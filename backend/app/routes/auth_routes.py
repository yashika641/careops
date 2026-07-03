from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.database import get_supabase, db
from app.schemas import (
UserSignup,
StaffSignup,
UserLogin,
Token,
UserResponse,
UserRole,
)
from app.auth import (
create_access_token,
verify_staff_access_code,
get_current_user,
)
from app.services.email_service import email_service
from app.config import settings
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):

    if user_data.role in [UserRole.STAFF, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use staff signup endpoint for staff registration",
        )

    supabase = db.get_admin_client()

    try:
        # Basic validation
        if len(user_data.password) < 6:
            raise HTTPException(400, "Password must be at least 6 characters")

        auth_response = supabase.auth.admin.create_user(
            {
                "email": str(user_data.email),
                "password": str(user_data.password),
                "email_confirm": True,
                "user_metadata": {
                    "username": user_data.username or "",
                    "phone_number": user_data.phone_number or "",
                    "role": str(user_data.role.value).lower(),
                },
            }
        )

        user = auth_response.user
        if not user:
            raise HTTPException(400, "Failed to create account")

        await email_service.send_welcome_email(
            user_data.email,
            user_data.username,
            user_data.role.value,
        )

        access_token = create_access_token(
            data={"sub": user.id, "role": user_data.role.value}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user_data.username,
                "phone_number": user_data.phone_number,
                "role": user_data.role.value,
            },
        }

    except Exception as e:
        print("SUPABASE ERROR:", e)   # 🔍 debug log
        raise HTTPException(500, f"Registration failed: {str(e)}")


# =========================================================

# STAFF SIGNUP (WITH ACCESS CODE)

# =========================================================

@router.post("/signup/staff", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup_staff(user_data: StaffSignup):

    if not verify_staff_access_code(user_data.staff_access_code):
        raise HTTPException(403, "Invalid staff access code")

    supabase = db.get_admin_client()

    try:
        auth_response = supabase.auth.admin.create_user(
            {
                "email": user_data.email,
                "password": user_data.password,
                "email_confirm": True,
                "user_metadata": {
                    "username": user_data.username,
                    "phone_number": user_data.phone_number,
                    "role": UserRole.STAFF.value,
                },
            }
        )

        user = auth_response.user
        if not user:
            raise HTTPException(400, "Failed to create staff account")

        # Optional staff profile table
        staff_profile = {
            "id": str(uuid.uuid4()),
            "user_id": user.id,
            "is_active": True,
        }

        supabase.table("staff_profiles").insert(staff_profile).execute()

        await email_service.send_welcome_email(
            user_data.email,
            user_data.username,
            "staff",
        )

        access_token = create_access_token(
            data={"sub": user.id, "role": UserRole.STAFF.value}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user_data.username,
                "phone_number": user_data.phone_number,
                "role": UserRole.STAFF.value,
            },
        }

    except Exception as e:
        raise HTTPException(500, f"Staff registration failed: {str(e)}")

# =========================================================

# SIGNIN

# =========================================================

@router.post("/signin", response_model=Token)
async def signin(credentials: UserLogin):

    supabase = db.get_admin_client()

    try:
        # 1️⃣ Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": credentials.email,
                "password": credentials.password,
            }
        )

        if not auth_response.user:
            raise HTTPException(401, "Invalid credentials")

        user = auth_response.user
        metadata = user.user_metadata or {}

        role = metadata.get("role", "customer")

        # =====================================================
        # 2️⃣ Staff + Admin guardrail
        # =====================================================
        # 2️⃣ Staff guardrail only
        if role == "staff":

            staff = (
                supabase.table("staff_profiles")
                .select("is_active")
                .eq("user_id", user.id)
                .execute()
            )

            print("STAFF DATA:", staff.data)

            if not staff.data:
                raise HTTPException(
                    status_code=403,
                    detail="Staff profile not found",
                )

            if not staff.data[0]["is_active"]:
                raise HTTPException(
                    status_code=403,
                    detail="Staff account not active",
                )


        # 3️⃣ Admin guardrail (metadata only)
        if role == "admin":

            if not metadata.get("is_admin", True):
                raise HTTPException(
                    status_code=403,
                    detail="Admin access not permitted",
                )

        # =====================================================
        # 3️⃣ Create Backend JWT
        # =====================================================
        session = auth_response.session

        if not session:
            raise HTTPException(401, "Failed to create session")

        return {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": metadata.get("username"),
                "phone_number": metadata.get("phone_number"),
                "role": role,
            },
        }


    except HTTPException:
        raise

    except Exception as e:
        print("SIGNIN ERROR:", e)
        raise HTTPException(401, "Authentication failed")


# =========================================================

# LOGOUT

# =========================================================

@router.post("/logout")
async def logout(supabase: Client = Depends(get_supabase)):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception:
        raise HTTPException(500, "Logout failed")

# =========================================================

# CURRENT USER

# =========================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
current_user: dict = Depends(get_current_user),
):
    return current_user

# =========================================================

# GOOGLE SIGNIN

# =========================================================

@router.post("/signin/google")
async def signin_google():
    supabase = db.get_supabase_client()

    try:
        auth_response = supabase.auth.sign_in_with_oauth(
            {
                "provider": "google",
                "options": {
                    "redirect_to": f"{settings.CORS_ORIGINS.split(',')[0]}/auth/callback"
                },
            }
        )

        return {"url": auth_response.url}

    except Exception as e:
        raise HTTPException(500, f"Google OAuth failed: {str(e)}")
