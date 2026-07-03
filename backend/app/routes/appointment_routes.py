from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database import get_supabase
from app.schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentStatus,
    UserRole
)
from app.auth import get_current_user, require_staff, require_admin
from app.services.email_service import email_service
from supabase import Client
import uuid
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new appointment (Customer only)"""
    
    if current_user["role"] != UserRole.CUSTOMER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create appointments"
        )
    
    try:
        appointment_data = {
            "id": str(uuid.uuid4()),
            "customer_id": current_user["id"],
            "service_type": appointment.service_type,
            "preferred_date": str(appointment.preferred_date),
            "time_slot": appointment.time_slot,
            "location": appointment.location,
            "notes": appointment.notes,
            "status": AppointmentStatus.PENDING.value,
        }
        
        result = supabase.table("appointments").insert(appointment_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create appointment"
            )
        
        # Get customer details for response
        response_data = result.data[0]
        response_data["customer_email"] = current_user["email"]
        response_data["customer_username"] = current_user["username"]
        print("Created appointment:", response_data)
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create appointment: {str(e)}"
        )


@router.get("", response_model=List[AppointmentResponse])
async def get_appointments(
    status_filter: Optional[AppointmentStatus] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get appointments based on user role:
    - Customer: their own appointments
    - Staff: assigned appointments
    - Admin: all appointments
    """
    
    try:
        query = supabase.table("appointments").select("""
            *,
            users!appointments_customer_id_fkey(email, username),
            staff:users!appointments_assigned_staff_id_fkey(username)
        """)
        
        # Filter based on role
        if current_user["role"] == UserRole.CUSTOMER.value:
            query = query.eq("customer_id", current_user["id"])
        elif current_user["role"] == UserRole.STAFF.value:
            query = query.eq("assigned_staff_id", current_user["id"])
        # Admin gets all appointments (no filter)
        
        # Apply status filter if provided
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        # Order by date
        query = query.order("preferred_date", desc=True)
        
        result = query.execute()
        
        # Format response
        appointments = []
        for apt in result.data:
            customer_data = apt.get("users", {})
            staff_data = apt.get("staff", {})
            
            formatted = {
                **apt,
                "customer_email": customer_data.get("email") if customer_data else None,
                "customer_username": customer_data.get("username") if customer_data else None,
                "assigned_staff_name": staff_data.get("username") if staff_data else None
            }
            
            # Remove nested objects
            formatted.pop("users", None)
            formatted.pop("staff", None)
            
            appointments.append(formatted)
        print(f"Fetched {len(appointments)} appointments for user {current_user['email']}")
        return appointments
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointments: {str(e)}"
        )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific appointment"""
    
    try:
        result = supabase.table("appointments").select("""
            *,
            users!appointments_customer_id_fkey(email, username),
            staff:users!appointments_assigned_staff_id_fkey(username)
        """).eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        apt = result.data[0]
        
        # Check access permissions
        if current_user["role"] == UserRole.CUSTOMER.value:
            if apt["customer_id"] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        elif current_user["role"] == UserRole.STAFF.value:
            if apt["assigned_staff_id"] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        # Format response
        customer_data = apt.get("users", {})
        staff_data = apt.get("staff", {})
        
        formatted = {
            **apt,
            "customer_email": customer_data.get("email") if customer_data else None,
            "customer_username": customer_data.get("username") if customer_data else None,
            "assigned_staff_name": staff_data.get("username") if staff_data else None
        }
        
        formatted.pop("users", None)
        formatted.pop("staff", None)
        
        return formatted
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointment: {str(e)}"
        )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Update an appointment (Staff/Admin only)"""
    
    try:
        # Get existing appointment
        existing = supabase.table("appointments").select("*").eq("id", appointment_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        # Prepare update data
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Convert date to string if present
        if "preferred_date" in update_dict:
            update_dict["preferred_date"] = str(update_dict["preferred_date"])
        
        # Convert status enum to value
        if "status" in update_dict:
            update_dict["status"] = update_dict["status"].value
        
        update_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Update appointment
        result = supabase.table("appointments").update(update_dict).eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update appointment"
            )
        
        updated_apt = result.data[0]
        
        # If status changed to confirmed or staff assigned, send emails
        if update_data.status == AppointmentStatus.CONFIRMED or update_data.assigned_staff_id:
            # Get customer details
            customer = supabase.table("users").select("*").eq("id", updated_apt["customer_id"]).execute()
            
            if customer.data:
                customer_data = customer.data[0]
                
                # Get staff details if assigned
                staff_name = None
                staff_result = None
                if updated_apt.get("assigned_staff_id"):
                    staff_result = supabase.table("users").select("*").eq("id", updated_apt["assigned_staff_id"]).execute()
                    if staff_result.data:
                        staff_name = staff_result.data[0]["username"]
                
                # Send confirmation email
                await email_service.send_appointment_confirmation(
                    customer_email=customer_data["email"],
                    customer_name=customer_data["username"],
                    appointment_details={
                        "service_type": updated_apt["service_type"],
                        "preferred_date": updated_apt["preferred_date"],
                        "time_slot": updated_apt["time_slot"],
                        "location": updated_apt["location"],
                        "staff_name": staff_name
                    }
                )
                
                # Send staff notification if assigned
                if update_data.assigned_staff_id and staff_result and staff_result.data:
                    await email_service.send_staff_assignment_notification(
                        staff_email=staff_result.data[0]["email"],
                        staff_name=staff_result.data[0]["username"],
                        appointment_details={
                            "customer_name": customer_data["username"],
                            "service_type": updated_apt["service_type"],
                            "preferred_date": updated_apt["preferred_date"],
                            "time_slot": updated_apt["time_slot"],
                            "location": updated_apt["location"]
                        }
                    )
        
        return updated_apt
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Delete an appointment (Admin only)"""
    
    try:
        result = supabase.table("appointments").delete().eq("id", appointment_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        return {"message": "Appointment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete appointment: {str(e)}"
        )
