# PostgreSQL Setup Guide for Ananta FastAPI

## 📦 Installation

### Windows Installation

#### Option 1: Official PostgreSQL Installer (Recommended)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download the latest version (16.x recommended)
   - Or direct link: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run Installer:**
   - Run the downloaded `.exe` file
   - Installation directory: `C:\Program Files\PostgreSQL\16`
   - Port: `5432` (default)
   - Set a **strong password** for the `postgres` superuser (remember this!)
   - Locale: Default locale

3. **Add to PATH (if not automatic):**
   ```powershell
   # Add PostgreSQL to PATH
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"
   # Make it permanent
   [System.Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::User)
   ```

4. **Verify Installation:**
   ```powershell
   psql --version
   # Should show: psql (PostgreSQL) 16.x
   ```

#### Option 2: Docker (Alternative)

```powershell
# Pull PostgreSQL image
docker pull postgres:16

# Run PostgreSQL container
docker run --name ananta-postgres `
  -e POSTGRES_PASSWORD=your_secure_password `
  -e POSTGRES_DB=ananta_db `
  -p 5432:5432 `
  -d postgres:16
```

---

## 🗄️ Database Setup

### Step 1: Connect to PostgreSQL

```powershell
# Connect as postgres user
psql -U postgres
```

Enter the password you set during installation.

### Step 2: Create Database

```sql
-- Create database
CREATE DATABASE ananta_db;

-- Create user for the application
CREATE USER ananta_user WITH PASSWORD 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ananta_db TO ananta_user;

-- Connect to the database
\c ananta_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO ananta_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ananta_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ananta_user;

-- Exit
\q
```

### Step 3: Run Schema Script

```powershell
# Navigate to project directory
cd C:\Users\Dev\Desktop\Ananta_FastAPI

# Run the schema file
psql -U ananta_user -d ananta_db -f database\schema.sql
```

Or connect and run:
```powershell
psql -U ananta_user -d ananta_db
```

Then paste the contents of `database/schema.sql`.

---

## 🔌 Python Integration

### Install PostgreSQL Driver

```powershell
pip install psycopg2-binary sqlalchemy alembic
```

### Update requirements.txt

Add these lines to `requirements.txt`:
```
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
alembic==1.13.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

---

## 🔑 Environment Variables

Update your `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://ananta_user:your_secure_password_here@localhost:5432/ananta_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ananta_db
DB_USER=ananta_user
DB_PASSWORD=your_secure_password_here

# Security
SECRET_KEY=your-super-secret-key-min-32-characters-long-random-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Generate a secure SECRET_KEY:**
```powershell
# In Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📊 Database Schema Overview

### Core Tables:

1. **users** - Main user accounts
   - `id` (UUID primary key)
   - `email` (unique, validated)
   - `password_hash` (bcrypt hashed)
   - `full_name`, `company`, `job_title`
   - `is_active`, `is_verified`
   - Timestamps

2. **user_profiles** - Extended user information
   - Links to users (1:1)
   - Phone, country, industry
   - Company size, use case
   - Preferences (JSONB)

3. **subscriptions** - User plans
   - Plan types: free, starter, professional, enterprise
   - API call limits
   - Feature access control

4. **api_keys** - User API authentication
   - Key name and value
   - Usage tracking
   - Expiration dates

5. **demo_requests** - Landing page form submissions
   - Contact information
   - Status tracking
   - Follow-up notes

6. **activity_logs** - User actions audit
   - Login/logout tracking
   - API usage
   - IP and user agent

7. **saved_queries** - User's saved searches
   - Query parameters (JSONB)
   - Favorites

8. **user_alerts** - Custom notifications
   - Price changes
   - Supply disruptions
   - Weather alerts

9. **verification_tokens** - Email verification
   - Token management
   - Expiration handling

---

## 🧪 Testing the Database

### Connect to database:
```powershell
psql -U ananta_user -d ananta_db
```

### Useful PostgreSQL Commands:
```sql
-- List all tables
\dt

-- Describe table structure
\d users

-- View all users
SELECT * FROM users;

-- View active subscriptions
SELECT * FROM active_subscriptions;

-- View user stats
SELECT * FROM user_dashboard_stats;

-- Count tables
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🔒 Security Best Practices

1. **Password Hashing:**
   - Use `passlib` with bcrypt
   - Never store plain text passwords

2. **API Keys:**
   - Generate secure random keys
   - Hash or encrypt sensitive data

3. **SQL Injection:**
   - Use SQLAlchemy ORM (parameterized queries)
   - Never concatenate SQL strings

4. **Environment Variables:**
   - Never commit `.env` file
   - Use different credentials for dev/prod

5. **Database Backups:**
   ```powershell
   # Backup database
   pg_dump -U ananta_user -d ananta_db > backup_$(date +%Y%m%d).sql
   
   # Restore database
   psql -U ananta_user -d ananta_db < backup_20251203.sql
   ```

---

## 📈 Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database and user
3. ✅ Run schema.sql
4. ⬜ Create SQLAlchemy models (Python)
5. ⬜ Implement user authentication
6. ⬜ Create API endpoints for signup/login
7. ⬜ Connect frontend forms to backend

---

## 🆘 Troubleshooting

### Can't connect to PostgreSQL:
```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start service if stopped
Start-Service postgresql-x64-16
```

### Password authentication failed:
- Verify password is correct
- Check `pg_hba.conf` file (trust vs md5)
- Restart PostgreSQL service

### Port already in use:
- Check if another PostgreSQL instance is running
- Change port in postgresql.conf
- Or stop conflicting service

---

## 📚 Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQLAlchemy Docs: https://docs.sqlalchemy.org/
- FastAPI + PostgreSQL Tutorial: https://fastapi.tiangolo.com/tutorial/sql-databases/
