# Password Reset Implementation

This document describes the password reset functionality implemented in the AI Task Manager.

## Overview

The password reset feature allows users to securely reset their passwords via email. The implementation follows security best practices:

- Time-limited reset tokens (24 hours expiry)
- Secure random token generation
- Rate limiting on all endpoints
- Email enumeration prevention
- Token validation before password reset

## Backend Implementation

### Database Changes

Added two fields to the User model:
- `reset_token`: Stores the password reset token
- `reset_token_expires`: Stores the token expiration datetime

### API Endpoints

1. **Request Password Reset**
   - Endpoint: `POST /api/auth/password-reset/request`
   - Body: `{ "email": "user@example.com" }`
   - Rate limit: 3 requests per hour
   - Always returns success to prevent email enumeration

2. **Verify Reset Token**
   - Endpoint: `GET /api/auth/password-reset/verify/{token}`
   - Returns: Token validity and user email
   - Rate limit: 10 requests per hour

3. **Confirm Password Reset**
   - Endpoint: `POST /api/auth/password-reset/confirm`
   - Body: `{ "token": "...", "new_password": "..." }`
   - Rate limit: 5 requests per hour
   - Validates password strength (minimum 8 characters)

### Email Configuration

Add these environment variables to your `.env` file:

```env
# Email settings for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=AI Task Manager
SMTP_TLS=true
SMTP_SSL=false

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000

# Password reset token expiry in hours (default: 24)
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=24
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password at https://myaccount.google.com/apppasswords
3. Use the app-specific password in `SMTP_PASSWORD`

## Frontend Implementation

### New Pages

1. **Forgot Password** (`/forgot-password`)
   - Allows users to request a password reset
   - Shows success message after submission

2. **Reset Password** (`/reset-password?token=...`)
   - Validates the reset token
   - Allows users to set a new password
   - Includes password confirmation field

### Updated Pages

- **Login Page**: Added "Forgot your password?" link
- Changed username field to accept email addresses

## Database Migration

Run the migration to add the new fields:

```bash
cd backend
alembic upgrade head
```

## Security Considerations

1. **Rate Limiting**: All password reset endpoints have strict rate limits to prevent abuse
2. **Token Security**: Tokens are 32 characters of random alphanumeric characters
3. **Time Limits**: Tokens expire after 24 hours (configurable)
4. **Email Enumeration**: The request endpoint always returns success to prevent attackers from discovering valid emails
5. **HTTPS**: In production, ensure all communication is over HTTPS

## Testing the Feature

1. Navigate to the login page
2. Click "Forgot your password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the link and enter your new password
6. Log in with your new password

## Troubleshooting

### Email not sending

1. Check your SMTP configuration in `.env`
2. Verify your firewall allows outbound connections on the SMTP port
3. Check the backend logs for error messages
4. For Gmail, ensure you're using an app-specific password

### Token invalid errors

1. Ensure the token hasn't expired (24 hours by default)
2. Check that the frontend URL in `.env` matches your actual frontend URL
3. Verify the token is being passed correctly in the URL

### Rate limit errors

The system has strict rate limits to prevent abuse:
- Password reset requests: 3 per hour
- Token verification: 10 per hour
- Password reset confirmation: 5 per hour

Wait for the rate limit to reset or adjust the limits in the code if needed for development.
