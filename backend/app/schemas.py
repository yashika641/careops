from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime, date, time
from enum import Enum


# Enums
class UserRole(str, Enum):
    CUSTOMER = "customer"
    STAFF = "staff"
    ADMIN = "admin"


class AppointmentStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    CONVERTED = "converted"
    LOST = "lost"


# Auth Schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=3)
    phone_number: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    staff_access_code: Optional[str] = None


class StaffSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=3)
    phone_number: str
    staff_access_code: str
    role: UserRole = UserRole.STAFF


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    phone_number: Optional[str]
    role: UserRole
    created_at: datetime


# Appointment Schemas
class AppointmentCreate(BaseModel):
    service_type: str
    preferred_date: date
    time_slot: str
    location: str
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    service_type: Optional[str] = None
    preferred_date: Optional[date] = None
    time_slot: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None
    assigned_staff_id: Optional[str] = None


from datetime import datetime, date


class AppointmentResponse(BaseModel):
    id: str
    customer_id: str

    customer_email: Optional[str] = None
    customer_username: Optional[str] = None

    service_type: str
    preferred_date: date
    time_slot: str
    location: str

    notes: Optional[str] = None

    status: AppointmentStatus

    assigned_staff_id: Optional[str] = None
    assigned_staff_name: Optional[str] = None

    created_at: datetime
    updated_at: datetime


# Lead Schemas
class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    service_interest: str
    source: Optional[str] = None
    notes: Optional[str] = None


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    service_interest: Optional[str] = None
    status: Optional[LeadStatus] = None
    assigned_staff_id: Optional[str] = None
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: str
    name: str
    email: str
    phone_number: str
    service_interest: str
    status: LeadStatus
    source: Optional[str]
    assigned_staff_id: Optional[str]
    assigned_staff_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime


class LeadToAppointment(BaseModel):
    preferred_date: date
    time_slot: str
    location: str
    notes: Optional[str] = None


# Inventory Schemas
class InventoryCreate(BaseModel):
    item_name: str
    quantity: int = Field(..., ge=0)
    supplier: Optional[str] = None
    reorder_level: int = Field(default=10, ge=0)
    price: float = Field(..., ge=0)
    category: Optional[str] = None


class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    supplier: Optional[str] = None
    reorder_level: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    category: Optional[str] = None


class InventoryResponse(BaseModel):
    id: str
    item_name: str
    quantity: int
    supplier: Optional[str]
    reorder_level: int
    price: float
    category: Optional[str]
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime


# Staff Profile Schemas
class StaffProfileCreate(BaseModel):
    user_id: str
    specialization: Optional[str] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    availability: Optional[dict] = None


class StaffProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    hourly_rate: Optional[float] = Field(None, ge=0)
    availability: Optional[dict] = None
    is_active: Optional[bool] = None


class StaffProfileResponse(BaseModel):
    id: str
    user_id: str
    username: str
    email: str
    phone_number: Optional[str]
    specialization: Optional[str]
    hourly_rate: Optional[float]
    availability: Optional[dict]
    is_active: bool
    created_at: datetime


# Salary Schemas
class SalaryCreate(BaseModel):
    staff_id: str
    amount: float = Field(..., ge=0)
    payment_date: date
    period_start: date
    period_end: date
    notes: Optional[str] = None


class SalaryResponse(BaseModel):
    id: str
    staff_id: str
    staff_name: str
    amount: float
    payment_date: date
    period_start: date
    period_end: date
    notes: Optional[str]
    created_at: datetime


# AI Schemas
class LeadClassificationRequest(BaseModel):
    lead_text: str


class AppointmentSummaryRequest(BaseModel):
    appointment_id: str


class FollowUpMessageRequest(BaseModel):
    customer_name: str
    appointment_details: str
