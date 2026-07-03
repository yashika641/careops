# CareOps Backend - Setup & Deployment Guide

## 🚀 Quick Start Guide

### Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and API keys

2. **Configure Database**
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Run: database/schema.sql
   # Then run: database/seed.sql
   ```

3. **Enable Authentication**
   - Go to Authentication → Settings
   - Enable Email provider
   - Enable Google OAuth (optional)
   - Set site URL for redirects

4. **Get Credentials**
   - Project URL: `https://[project-ref].supabase.co`
   - Anon key: Found in Settings → API
   - Service role key: Found in Settings → API (keep secret!)

### Step 2: Backend Setup

1. **Clone/Download Project**
   ```bash
   cd careops-backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Generate Secret Key**
   ```bash
   # Generate a secure secret key
   python -c "import secrets; print(secrets.token_hex(32))"
   # Copy the output to SECRET_KEY in .env
   ```

4. **Create Admin User**
   
   In Supabase Dashboard → Authentication → Users:
   - Click "Add user"
   - Enter email: `admin@careops.com`
   - Enter password (save this!)
   - Copy the user UUID

   Then in SQL Editor:
   ```sql
   INSERT INTO users (id, email, username, role)
   VALUES (
       'paste-uuid-here',
       'admin@careops.com',
       'Admin User',
       'admin'
   );
   ```

5. **Run the Server**
   ```bash
   python main.py
   ```

   Visit: http://localhost:8000/docs

### Step 3: First API Calls

1. **Sign in as Admin**
   ```bash
   curl -X POST http://localhost:8000/auth/signin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@careops.com",
       "password": "your-admin-password"
     }'
   ```

   Save the `access_token` from the response.

2. **Test Protected Endpoint**
   ```bash
   curl http://localhost:8000/auth/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## 📧 Email Configuration (Optional)

### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification → Enable

2. **Create App Password**
   - Security → App passwords
   - Select "Mail" and "Other"
   - Copy the 16-character password

3. **Update .env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=noreply@careops.com
   ```

### Using SendGrid (Alternative)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## 🤖 Hugging Face Setup (Optional)

1. **Create Account**
   - Go to https://huggingface.co
   - Sign up for free account

2. **Get API Token**
   - Profile → Settings → Access Tokens
   - Create new token
   - Copy token to `HUGGINGFACE_API_KEY` in .env

Note: AI features work with fallbacks even without API key.

## 🌐 Frontend Integration

### CORS Configuration

Update `CORS_ORIGINS` in `.env`:

```env
# For local development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# For production
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### API Base URL

In your frontend, set:

```javascript
const API_BASE_URL = "http://localhost:8000";
// or in production:
// const API_BASE_URL = "https://api.yourdomain.com";
```

### Authentication Flow

```javascript
// 1. Sign up
const signup = async (email, password, username) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username, role: 'customer' })
  });
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

// 2. Sign in
const signin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

// 3. Make authenticated requests
const getAppointments = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## 🚀 Production Deployment

### Option 1: Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set SUPABASE_URL=your-url
   railway variables set SUPABASE_KEY=your-key
   # ... add all other env vars
   ```

### Option 2: Render

1. **Create New Web Service**
   - Connect GitHub repo
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables**
   - Add all variables from `.env`
   - Set `ENVIRONMENT=production`
   - Set `DEBUG=False`

### Option 3: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Create fly.toml**
   ```toml
   app = "careops-backend"
   
   [build]
   
   [env]
     PORT = "8000"
   
   [http_service]
     internal_port = 8000
     force_https = true
   
   [[services]]
     protocol = "tcp"
     internal_port = 8000
   ```

3. **Deploy**
   ```bash
   fly launch
   fly secrets set SUPABASE_URL=your-url
   fly secrets set SUPABASE_KEY=your-key
   # ... set all other secrets
   fly deploy
   ```

### Option 4: Docker + Any Platform

1. **Create Dockerfile**
   ```dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8000
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and Push**
   ```bash
   docker build -t careops-backend .
   docker tag careops-backend your-registry/careops-backend
   docker push your-registry/careops-backend
   ```

## 🔒 Production Checklist

- [ ] Set `ENVIRONMENT=production` in .env
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Review Supabase RLS policies
- [ ] Configure firewall rules
- [ ] Set up logging
- [ ] Enable API key rotation
- [ ] Configure CDN (if needed)
- [ ] Set up health check monitoring
- [ ] Configure auto-scaling

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://your-api-url/health
```

### Logging

Logs are output to stdout. In production, use a logging service:

```python
# Add to main.py for production logging
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=5)
logging.basicConfig(handlers=[handler], level=logging.INFO)
```

### Metrics

Consider adding:
- Prometheus for metrics
- Grafana for visualization
- Sentry for error tracking

## 🐛 Troubleshooting

### Database Issues
```bash
# Test database connection
python -c "import asyncpg; import asyncio; asyncio.run(asyncpg.connect('your-db-url'))"
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

### Module Import Errors
```bash
# Ensure virtual environment is activated
which python  # Should point to venv/bin/python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### CORS Errors
- Check `CORS_ORIGINS` in .env
- Ensure frontend URL is included
- Check browser console for specific error

## 📈 Performance Optimization

1. **Connection Pooling**
   - Already configured in `database.py`
   - Adjust `min_size` and `max_size` for your load

2. **Caching**
   - Add Redis for session caching
   - Cache frequent queries

3. **Database Indexes**
   - Already included in schema
   - Add custom indexes as needed

4. **Load Balancing**
   - Use multiple uvicorn workers:
     ```bash
     uvicorn main:app --workers 4
     ```

## 🔐 Security Hardening

1. **Rate Limiting**
   ```python
   # Add to main.py
   from slowapi import Limiter, _rate_limit_exceeded_handler
   from slowapi.util import get_remote_address
   
   limiter = Limiter(key_func=get_remote_address)
   app.state.limiter = limiter
   app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
   ```

2. **API Key Rotation**
   - Rotate `SECRET_KEY` quarterly
   - Rotate `STAFF_ACCESS_CODE` monthly

3. **Input Validation**
   - Already handled by Pydantic
   - Add custom validators for complex logic

## 📞 Support

For issues:
1. Check logs
2. Review Supabase dashboard
3. Test with Swagger UI at `/docs`
4. Check network connectivity

---

**Next Steps:**
1. Complete Supabase setup
2. Configure environment variables
3. Create admin user
4. Test API endpoints
5. Integrate with frontend
6. Deploy to production
