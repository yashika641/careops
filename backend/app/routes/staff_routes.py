from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid

from supabase import Client

from app.database import get_supabase
from app.schemas import (
    StaffProfileUpdate,
    StaffProfileResponse,
    SalaryCreate,
    SalaryResponse
)
from app.auth import require_staff, require_admin


router = APIRouter(prefix="/staff", tags=["Staff"])


# =====================================================
# 👑 ADMIN — STAFF MANAGEMENT
# =====================================================

@router.get("", response_model=List[StaffProfileResponse])
async def get_all_staff(
    active_only: bool = Query(True),
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Get all staff"""

    query = supabase.table("staff_profiles").select("""
        *,
        users(username, email, phone_number)
    """)

    if active_only:
        query = query.eq("is_active", True)

    result = query.execute()

    staff_list = []

    for staff in result.data:
        user_data = staff.get("users", {})

        formatted = {
            **staff,
            "username": user_data.get("username"),
            "email": user_data.get("email"),
            "phone_number": user_data.get("phone_number")
        }

        formatted.pop("users", None)
        staff_list.append(formatted)

    return staff_list


@router.get("/{staff_id}", response_model=StaffProfileResponse)
async def get_staff_member(
    staff_id: UUID,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Get staff profile"""

    result = supabase.table("staff_profiles").select("""
        *,
        users(username, email, phone_number)
    """).eq("user_id", str(staff_id)).execute()

    if not result.data:
        raise HTTPException(404, "Staff member not found")

    staff = result.data[0]
    user_data = staff.get("users", {})

    formatted = {
        **staff,
        "username": user_data.get("username"),
        "email": user_data.get("email"),
        "phone_number": user_data.get("phone_number")
    }

    formatted.pop("users", None)

    return formatted


@router.patch("/{staff_id}", response_model=StaffProfileResponse)
async def update_staff_profile(
    staff_id: UUID,
    update_data: StaffProfileUpdate,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Update staff"""

    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict["updated_at"] = datetime.utcnow().isoformat()

    result = supabase.table("staff_profiles").update(update_dict)\
        .eq("user_id", str(staff_id)).execute()

    return result.data[0]


# =====================================================
# 💰 ADMIN — SALARIES
# =====================================================

@router.post("/salaries", response_model=SalaryResponse)
async def create_salary_record(
    salary: SalaryCreate,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Create salary"""

    staff = supabase.table("users")\
        .select("username")\
        .eq("id", salary.staff_id)\
        .execute()

    if not staff.data:
        raise HTTPException(404, "Staff member not found")

    salary_data = {
        "id": str(uuid.uuid4()),
        "staff_id": salary.staff_id,
        "amount": salary.amount,
        "payment_date": salary.payment_date.isoformat(),
        "period_start": salary.period_start.isoformat(),
        "period_end": salary.period_end.isoformat(),
        "notes": salary.notes,
    }

    result = supabase.table("staff_salaries").insert(salary_data).execute()

    response = result.data[0]
    response["staff_name"] = staff.data[0]["username"]

    return response


@router.get("/salaries", response_model=List[SalaryResponse])
async def get_all_salaries(
    staff_id: Optional[UUID] = Query(None),
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Get all salaries"""

    query = supabase.table("staff_salaries").select("""
        *,
        users(username)
    """)

    if staff_id:
        query = query.eq("staff_id", str(staff_id))

    result = query.order("payment_date", desc=True).execute()

    salaries = []

    for salary in result.data:
        user_data = salary.get("users", {})

        formatted = {
            **salary,
            "staff_name": user_data.get("username")
        }

        formatted.pop("users", None)
        salaries.append(formatted)

    return salaries


@router.get("/{staff_id}/salaries", response_model=List[SalaryResponse])
async def get_staff_salaries_admin(
    staff_id: UUID,
    current_user: dict = Depends(require_admin),
    supabase: Client = Depends(get_supabase)
):
    """Admin: Staff salary history"""

    result = supabase.table("staff_salaries").select("""
        *,
        users(username)
    """).eq("staff_id", str(staff_id))\
      .order("payment_date", desc=True)\
      .execute()

    salaries = []

    for salary in result.data:
        user_data = salary.get("users", {})

        formatted = {
            **salary,
            "staff_name": user_data.get("username")
        }

        formatted.pop("users", None)
        salaries.append(formatted)

    return salaries


# =====================================================
# 👤 STAFF — SELF
# =====================================================

@router.get("/me", response_model=StaffProfileResponse)
async def get_my_profile(
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Staff: Own profile"""

    result = supabase.table("staff_profiles").select("""
        *,
        users(username, email, phone_number)
    """).eq("user_id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(404, "Profile not found")

    staff = result.data[0]
    user_data = staff.get("users", {})

    formatted = {
        **staff,
        "username": user_data.get("username"),
        "email": user_data.get("email"),
        "phone_number": user_data.get("phone_number")
    }

    formatted.pop("users", None)

    return formatted


@router.get("/me/salaries", response_model=List[SalaryResponse])
async def get_my_salaries(
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Staff: Own salaries"""

    result = supabase.table("staff_salaries").select("""
        *,
        users(username)
    """).eq("staff_id", current_user["id"])\
      .order("payment_date", desc=True)\
      .execute()

    salaries = []

    for salary in result.data:
        user_data = salary.get("users", {})

        formatted = {
            **salary,
            "staff_name": user_data.get("username")
        }

        formatted.pop("users", None)
        salaries.append(formatted)

    return salaries


# =====================================================
# 📅 SHARED — CALENDAR / AVAILABILITY
# Staff can view & manage all staff schedules
# =====================================================

@router.get("/{staff_id}/calendar")
async def get_staff_calendar(
    staff_id: UUID,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Staff/Admin: View any staff calendar"""

    result = supabase.table("appointments").select("""
        *,
        users!appointments_customer_id_fkey(username, email)
    """).eq("assigned_staff_id", str(staff_id))\
      .order("preferred_date")\
      .order("time_slot")\
      .execute()

    events = []

    for apt in result.data:
        customer = apt.get("users", {})

        events.append({
            "id": apt["id"],
            "title": f"{apt['service_type']} - {customer.get('username')}",
            "date": apt["preferred_date"],
            "time": apt["time_slot"],
            "status": apt["status"],
            "customer": customer.get("username"),
            "customer_email": customer.get("email")
        })

    return {"events": events}


@router.get("/{staff_id}/availability")
async def check_staff_availability(
    staff_id: UUID,
    date: str,
    time_slot: str,
    current_user: dict = Depends(require_staff),
    supabase: Client = Depends(get_supabase)
):
    """Staff/Admin: Check any staff availability"""

    result = supabase.table("appointments").select("*")\
        .eq("assigned_staff_id", str(staff_id))\
        .eq("preferred_date", date)\
        .eq("time_slot", time_slot)\
        .neq("status", "cancelled")\
        .execute()

    return {
        "is_available": len(result.data) == 0,
        "conflicts": result.data
    }
