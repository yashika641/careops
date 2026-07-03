from fastapi import APIRouter, HTTPException, status, Depends
from app.database import get_supabase
from app.auth import require_admin
from app.services.ai_service import hf_service
from app.schemas import (
    LeadClassificationRequest,
    AppointmentSummaryRequest,
    FollowUpMessageRequest
)
from supabase import Client

admin_router = APIRouter(prefix="/admin", tags=["Admin"])
ai_router = APIRouter(prefix="/ai", tags=["AI Services"])


# Admin Routes

@admin_router.get("/dashboard")
async def get_admin_dashboard(
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get admin dashboard statistics"""
    
    try:
        # Get counts
        total_customers = supabase.table("users").select(
            "id", count="exact"
        ).eq("role", "customer").execute()
        
        total_staff = supabase.table("users").select(
            "id", count="exact"
        ).eq("role", "staff").execute()
        
        total_appointments = supabase.table("appointments").select(
            "id", count="exact"
        ).execute()
        
        pending_appointments = supabase.table("appointments").select(
            "id", count="exact"
        ).eq("status", "pending").execute()
        
        total_leads = supabase.table("leads").select(
            "id", count="exact"
        ).execute()
        
        new_leads = supabase.table("leads").select(
            "id", count="exact"
        ).eq("status", "new").execute()
        
        low_stock_items = supabase.table("inventory").select(
            "id", count="exact"
        ).eq("is_low_stock", True).execute()
        
        # Get recent activities
        recent_appointments = supabase.table("appointments").select("""
            id, service_type, preferred_date, status,
            users!appointments_customer_id_fkey(username)
        """).order("created_at", desc=True).limit(5).execute()
        
        recent_leads = supabase.table("leads").select(
            "id, name, service_interest, status, created_at"
        ).order("created_at", desc=True).limit(5).execute()
        
        return {
            "statistics": {
                "total_customers": total_customers.count,
                "total_staff": total_staff.count,
                "total_appointments": total_appointments.count,
                "pending_appointments": pending_appointments.count,
                "total_leads": total_leads.count,
                "new_leads": new_leads.count,
                "low_stock_items": low_stock_items.count,
            },
            "recent_appointments": recent_appointments.data,
            "recent_leads": recent_leads.data,
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch dashboard data: {str(e)}"
        )


@admin_router.get("/analytics/appointments")
async def get_appointment_analytics(
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get appointment analytics"""
    
    try:
        # Status breakdown
        appointments = supabase.table("appointments").select("status").execute()
        
        status_counts = {}
        for apt in appointments.data:
            status = apt["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Service type breakdown
        service_counts = {}
        service_result = supabase.table("appointments").select("service_type").execute()
        
        for apt in service_result.data:
            service = apt["service_type"]
            service_counts[service] = service_counts.get(service, 0) + 1
        
        return {
            "status_breakdown": status_counts,
            "service_breakdown": service_counts,
            "total_appointments": len(appointments.data)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics: {str(e)}"
        )


@admin_router.get("/analytics/revenue")
async def get_revenue_analytics(
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Get revenue analytics (placeholder)"""
    
    # This would calculate revenue from appointments and services
    # For now, returning a placeholder
    
    return {
        "message": "Revenue analytics endpoint - implement based on your pricing model",
        "note": "Connect this to your payment/billing system"
    }


@admin_router.post("/staff/approve/{user_id}")
async def approve_staff(
    user_id: str,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Approve a pending staff account"""
    
    try:
        # Update staff profile to active
        result = supabase.table("staff_profiles").update({
            "is_active": True
        }).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Staff member not found"
            )
        
        return {"message": "Staff account approved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve staff: {str(e)}"
        )


# AI Service Routes

@ai_router.post("/classify-lead")
async def classify_lead(
    request: LeadClassificationRequest,
    current_user: dict = Depends(require_admin)
):
    """Classify lead quality using AI"""
    
    try:
        result = await hf_service.classify_lead(request.lead_text)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lead classification failed: {str(e)}"
        )


@ai_router.post("/summarize-appointment")
async def summarize_appointment(
    request: AppointmentSummaryRequest,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Generate AI summary of appointment"""
    
    try:
        # Get appointment
        apt = supabase.table("appointments").select("*").eq(
            "id", request.appointment_id
        ).execute()
        
        if not apt.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        
        appointment = apt.data[0]
        
        # Create text for summarization
        text = f"""
        Service: {appointment['service_type']}
        Date: {appointment['preferred_date']}
        Time: {appointment['time_slot']}
        Location: {appointment['location']}
        Notes: {appointment.get('notes', 'None')}
        Status: {appointment['status']}
        """
        
        summary = await hf_service.summarize_appointment(text)
        
        return {
            "appointment_id": request.appointment_id,
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Summarization failed: {str(e)}"
        )


@ai_router.post("/generate-followup")
async def generate_follow_up_message(
    request: FollowUpMessageRequest,
    current_user: dict = Depends(require_admin)
):
    """Generate AI-powered follow-up message"""
    
    try:
        message = await hf_service.generate_follow_up_message(
            customer_name=request.customer_name,
            appointment_details=request.appointment_details
        )
        
        return {
            "customer_name": request.customer_name,
            "message": message
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Message generation failed: {str(e)}"
        )
