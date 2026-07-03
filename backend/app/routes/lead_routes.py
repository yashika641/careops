from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from app.database import get_supabase
from app.schemas import (
    LeadCreate,
    LeadUpdate,
    LeadResponse,
    LeadToAppointment,
    LeadStatus,
    AppointmentStatus
)
from app.auth import require_staff, require_admin, get_current_user
from app.services.ai_service import hf_service
from supabase import Client
import uuid
from datetime import datetime

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    lead: LeadCreate,
    supabase: Client = Depends(get_supabase)
):
    """Create a new lead (public endpoint - no auth required)"""
    
    try:
        # Use AI to classify lead
        lead_text = f"{lead.name} - {lead.service_interest}. {lead.notes or ''}"
        classification = await hf_service.classify_lead(lead_text)
        
        lead_data = {
            "id": str(uuid.uuid4()),
            "name": lead.name,
            "email": lead.email,
            "phone_number": lead.phone_number,
            "service_interest": lead.service_interest,
            "source": lead.source,
            "notes": lead.notes,
            "status": LeadStatus.NEW.value,
            "ai_priority": classification.get("priority", "medium"),
            "ai_confidence": classification.get("confidence_score", 0.5),
        }
        
        result = supabase.table("leads").insert(lead_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create lead"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lead: {str(e)}"
        )


@router.get("", response_model=List[LeadResponse])
async def get_leads(
    status_filter: Optional[LeadStatus] = Query(None, alias="status"),
    service_filter: Optional[str] = Query(None, alias="service"),
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get all leads with optional filters (Staff/Admin only)"""
    
    try:
        query = supabase.table("leads").select("""
            *,
            staff:users!leads_assigned_staff_id_fkey(username)
        """)
        
        # Apply filters
        if status_filter:
            query = query.eq("status", status_filter.value)
        
        if service_filter:
            query = query.ilike("service_interest", f"%{service_filter}%")
        
        if date_from:
            query = query.gte("created_at", date_from)
        
        if date_to:
            query = query.lte("created_at", date_to)
        
        # Order by priority and date
        query = query.order("ai_priority", desc=True).order("created_at", desc=True)
        
        result = query.execute()
        
        # Format response
        leads = []
        for lead in result.data:
            staff_data = lead.get("staff", {})
            
            formatted = {
                **lead,
                "assigned_staff_name": staff_data.get("username") if staff_data else None
            }
            
            formatted.pop("staff", None)
            leads.append(formatted)
        
        return leads
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leads: {str(e)}"
        )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Get a specific lead"""
    
    try:
        result = supabase.table("leads").select("""
            *,
            staff:users!leads_assigned_staff_id_fkey(username)
        """).eq("id", lead_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        lead = result.data[0]
        staff_data = lead.get("staff", {})
        
        formatted = {
            **lead,
            "assigned_staff_name": staff_data.get("username") if staff_data else None
        }
        
        formatted.pop("staff", None)
        
        return formatted
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lead: {str(e)}"
        )


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    update_data: LeadUpdate,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Update a lead (Staff/Admin only)"""
    
    try:
        # Get existing lead
        existing = supabase.table("leads").select("*").eq("id", lead_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        # Prepare update data
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Convert status enum to value
        if "status" in update_dict:
            update_dict["status"] = update_dict["status"].value
        
        update_dict["updated_at"] = datetime.utcnow().isoformat()
        
        # Update lead
        result = supabase.table("leads").update(update_dict).eq("id", lead_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update lead"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lead: {str(e)}"
        )


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Delete a lead (Admin only)"""
    
    try:
        result = supabase.table("leads").delete().eq("id", lead_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return {"message": "Lead deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete lead: {str(e)}"
        )


@router.post("/{lead_id}/convert", status_code=status.HTTP_201_CREATED)
async def convert_lead_to_appointment(
    lead_id: str,
    appointment_data: LeadToAppointment,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Convert a lead to an appointment"""
    
    try:
        # Get lead
        lead_result = supabase.table("leads").select("*").eq("id", lead_id).execute()
        
        if not lead_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        lead = lead_result.data[0]
        
        # Check if customer account exists
        customer = supabase.table("users").select("*").eq("email", lead["email"]).execute()
        
        customer_id = None
        if customer.data:
            customer_id = customer.data[0]["id"]
        else:
            # Create customer account
            import secrets
            temp_password = secrets.token_urlsafe(16)
            
            auth_response = supabase.auth.admin.create_user({
                "email": lead["email"],
                "password": temp_password,
                "email_confirm": True
            })
            
            if auth_response.user:
                user_record = {
                    "id": auth_response.user.id,
                    "email": lead["email"],
                    "username": lead["name"],
                    "phone_number": lead["phone_number"],
                    "role": "customer",
                }
                
                supabase.table("users").insert(user_record).execute()
                customer_id = auth_response.user.id
        
        if not customer_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create customer account"
            )
        
        # Create appointment
        appointment = {
            "id": str(uuid.uuid4()),
            "customer_id": customer_id,
            "service_type": lead["service_interest"],
            "preferred_date": str(appointment_data.preferred_date),
            "time_slot": appointment_data.time_slot,
            "location": appointment_data.location,
            "notes": appointment_data.notes or lead.get("notes"),
            "status": AppointmentStatus.PENDING.value,
            "assigned_staff_id": current_user["id"]
        }
        
        apt_result = supabase.table("appointments").insert(appointment).execute()
        
        if not apt_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create appointment"
            )
        
        # Update lead status to converted
        supabase.table("leads").update({
            "status": LeadStatus.CONVERTED.value,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("id", lead_id).execute()
        
        return {
            "message": "Lead converted to appointment successfully",
            "appointment_id": apt_result.data[0]["id"],
            "customer_id": customer_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to convert lead: {str(e)}"
        )
