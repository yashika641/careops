# CareOps Backend API

Complete backend implementation for the CareOps Operations Management System built with FastAPI, Supabase, and AI integrations.

## 🚀 Features

- **Authentication & Authorization**
  - Email/Password signup and signin
  - Google OAuth integration
  - Role-based access control (Customer, Staff, Admin)
  - JWT token authentication
  - Staff signup with access code validation

- **Appointment Management**
  - Create, read, update, delete appointments
  - Status tracking (pending, confirmed, completed, cancelled)
  - Staff assignment
  - Automated email notifications
  - Calendar view and scheduling

- **Lead Management**
  - Lead capture and tracking
  - AI-powered lead classification
  - Lead-to-appointment conversion
  - Status workflow management
  - Service interest filtering

- **Inventory Management**
  - Stock tracking
  - Low stock alerts
  - Inventory history logging
  - Category-based organization
  - Supplier management

- **Staff Management**
  - Staff profiles and specializations
  - Calendar and schedule management
  - Availability tracking
  - Salary records
  - Appointment assignments

- **Admin Dashboard**
  - System-wide analytics
  - User management
  - Staff approval workflow
  - Revenue tracking (extensible)

- **AI/ML Integration**
  - Lead classification using Hugging Face
  - Appointment summarization
  - Follow-up message generation

## 📋 Prerequisites

- Python 3.9+
- Supabase account and project
- PostgreSQL (via Supabase)
- Hugging Face API key (optional)
- SMTP credentials (optional, for emails)

## 🛠️ Installation

### 1. Clone and Setup

```bash
# Navigate to project directory
cd careops-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase and other credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

SECRET_KEY=your_secret_key_here  # Generate with: openssl rand -hex 32
STAFF_ACCESS_CODE=STAFF2024SECRET

# Optional configurations
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
HUGGINGFACE_API_KEY=your_hf_api_key
```

### 3. Set Up Database

#### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run `database/schema.sql` to create tables
4. Run `database/seed.sql` to insert sample data

#### Using psql:

```bash
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres -f database/schema.sql
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres -f database/seed.sql
```

### 4. Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Click "Add user" → "Create new user"
2. Enter admin email and password
3. Note the user UUID

Then run this SQL in Supabase SQL Editor:

```sql
INSERT INTO users (id, email, username, role)
VALUES (
    'paste-admin-uuid-here',
    'admin@careops.com',
    'Admin User',
    'admin'
);
```

## 🚀 Running the Application

### Development Mode

```bash
# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py directly
python main.py
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Documentation

### Authentication Endpoints

#### POST `/auth/signup`
Register a new customer account.

```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "username": "John Doe",
  "phone_number": "+1234567890",
  "role": "customer"
}
```

#### POST `/auth/signup/staff`
Register a new staff account (requires access code).

```json
{
  "email": "staff@example.com",
  "password": "securepass123",
  "username": "Jane Staff",
  "phone_number": "+1234567890",
  "staff_access_code": "STAFF2024SECRET"
}
```

#### POST `/auth/signin`
Sign in with email and password.

```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

#### GET `/auth/me`
Get current user information (requires authentication).

### Appointment Endpoints

#### POST `/appointments`
Create new appointment (Customer only).

```json
{
  "service_type": "Senior Care",
  "preferred_date": "2024-03-15",
  "time_slot": "10:00 AM - 11:00 AM",
  "location": "123 Main St",
  "notes": "Initial consultation"
}
```

#### GET `/appointments`
Get appointments (filtered by role).
- Customers: their own appointments
- Staff: assigned appointments
- Admin: all appointments

Query parameters:
- `status`: Filter by status (pending, confirmed, completed, cancelled)

#### PATCH `/appointments/{id}`
Update appointment (Staff/Admin only).

```json
{
  "status": "confirmed",
  "assigned_staff_id": "staff-uuid"
}
```

### Lead Endpoints

#### POST `/leads`
Create a new lead (public endpoint).

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "service_interest": "Senior Care",
  "source": "Website",
  "notes": "Interested in home care services"
}
```

#### GET `/leads`
Get leads with filters (Staff/Admin only).

Query parameters:
- `status`: Filter by status
- `service`: Filter by service interest
- `from`: Start date filter
- `to`: End date filter

#### POST `/leads/{id}/convert`
Convert lead to appointment (Staff only).

```json
{
  "preferred_date": "2024-03-20",
  "time_slot": "2:00 PM - 3:00 PM",
  "location": "456 Oak Ave",
  "notes": "Converted from lead"
}
```

### Inventory Endpoints

#### POST `/inventory`
Add new inventory item (Staff/Admin).

```json
{
  "item_name": "Disposable Gloves",
  "quantity": 100,
  "supplier": "MediSupply Co",
  "reorder_level": 20,
  "price": 15.99,
  "category": "PPE"
}
```

#### GET `/inventory/alerts`
Get low stock alerts.

#### PATCH `/inventory/{id}`
Update inventory item.

### Staff Endpoints

#### GET `/staff`
Get all staff members.

#### GET `/staff/{id}/calendar`
Get staff calendar/schedule.

Query parameters:
- `date_from`: Start date
- `date_to`: End date

#### POST `/staff/salaries`
Create salary record (Admin only).

### Admin Endpoints

#### GET `/admin/dashboard`
Get admin dashboard statistics.

#### GET `/admin/analytics/appointments`
Get appointment analytics.

#### POST `/admin/staff/approve/{user_id}`
Approve staff account.

### AI Service Endpoints

#### POST `/ai/classify-lead`
Classify lead using AI.

```json
{
  "lead_text": "Looking for senior care services ASAP"
}
```

#### POST `/ai/summarize-appointment`
Generate AI summary of appointment.

```json
{
  "appointment_id": "appointment-uuid"
}
```

#### POST `/ai/generate-followup`
Generate follow-up message.

```json
{
  "customer_name": "John Doe",
  "appointment_details": "Senior care consultation scheduled for Monday"
}
```

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎭 Role-Based Access

- **Customer**: Can create appointments, view own appointments
- **Staff**: Can view assigned appointments, manage leads, access inventory, view calendar
- **Admin**: Full system access, analytics, user management

## 🗄️ Database Schema

### Main Tables

- **users**: User accounts and roles
- **staff_profiles**: Staff-specific information
- **appointments**: Customer bookings
- **leads**: Sales leads
- **inventory**: Stock items
- **inventory_history**: Audit log
- **staff_salaries**: Salary records

See `database/schema.sql` for complete schema.

## 📧 Email Notifications

The system sends automated emails for:
- Welcome emails on signup
- Appointment confirmations
- Staff assignment notifications

Configure SMTP settings in `.env` to enable emails. Without SMTP credentials, emails will be logged (mock mode).

## 🤖 AI Features

### Hugging Face Integration

The system uses Hugging Face models for:
- **Lead Classification**: Sentiment analysis to prioritize leads
- **Summarization**: Appointment summary generation
- **Text Generation**: Follow-up message suggestions

Models used:
- `distilbert-base-uncased-finetuned-sst-2-english` (sentiment)
- `facebook/bart-large-cnn` (summarization)
- `facebook/blenderbot-400M-distill` (conversation)

## 🧪 Testing

### Manual Testing via Swagger UI

1. Navigate to http://localhost:8000/docs
2. Use the interactive API documentation
3. Test endpoints with sample data

### Sample Test Flow

1. **Sign up as customer**: `POST /auth/signup`
2. **Sign in**: `POST /auth/signin` (get token)
3. **Create appointment**: `POST /appointments` (with token)
4. **Sign up staff**: `POST /auth/signup/staff` (with access code)
5. **Assign appointment**: `PATCH /appointments/{id}` (as staff)

## 📁 Project Structure

```
careops-backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Configuration settings
│   ├── database.py            # Database connections
│   ├── schemas.py             # Pydantic models
│   ├── auth.py                # Authentication utilities
│   ├── routes/                # API endpoints
│   │   ├── auth_routes.py
│   │   ├── appointment_routes.py
│   │   ├── lead_routes.py
│   │   ├── inventory_routes.py
│   │   ├── staff_routes.py
│   │   └── admin_routes.py
│   └── services/              # Business logic
│       ├── email_service.py
│       └── ai_service.py
├── database/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Sample data
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## 🔐 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong SECRET_KEY** (generate with `openssl rand -hex 32`)
3. **Rotate STAFF_ACCESS_CODE** regularly
4. **Enable HTTPS** in production
5. **Use Supabase RLS** (Row Level Security) policies
6. **Validate all user inputs**
7. **Rate limit** API endpoints in production

## 🚀 Deployment

### Using Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t careops-backend .
docker run -p 8000:8000 --env-file .env careops-backend
```

### Using Cloud Platforms

#### Heroku
```bash
heroku create careops-backend
heroku config:set $(cat .env | xargs)
git push heroku main
```

#### Railway/Render
1. Connect GitHub repository
2. Add environment variables from `.env`
3. Deploy

## 🔧 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP is whitelisted in Supabase

### Authentication Errors
- Verify SECRET_KEY is set
- Check JWT token expiry
- Ensure Supabase Auth is enabled

### Email Not Sending
- Verify SMTP credentials
- Check firewall/port 587
- System falls back to mock mode if SMTP fails

## 📝 License

This project is proprietary and confidential.

## 👥 Support

For issues and questions:
- Check Swagger docs at `/docs`
- Review Supabase logs
- Check application logs

## 🎯 Next Steps

1. Configure production environment variables
2. Set up monitoring (e.g., Sentry)
3. Implement rate limiting
4. Add API versioning
5. Set up CI/CD pipeline
6. Add comprehensive testing
7. Configure backup strategy
8. Set up logging aggregation

---

Built with ❤️ using FastAPI and Supabase
