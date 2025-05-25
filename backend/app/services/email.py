import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.smtp_from_email = settings.smtp_from_email
        self.smtp_from_name = settings.smtp_from_name
        self.smtp_tls = settings.smtp_tls
        self.smtp_ssl = settings.smtp_ssl
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using configured SMTP settings."""
        if not all([self.smtp_username, self.smtp_password, self.smtp_from_email]):
            logger.warning("Email settings not configured. Skipping email send.")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.smtp_from_name} <{self.smtp_from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.smtp_tls:
                    server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_url: str) -> bool:
        """Send password reset email."""
        subject = "Password Reset Request - AI Task Manager"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your AI Task Manager account.</p>
                    <p>To reset your password, please click the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_url}" 
                           style="background-color: #2563eb; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb;">{reset_url}</p>
                    <p>This link will expire in {settings.password_reset_token_expire_hours} hours.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="font-size: 12px; color: #666;">
                        This is an automated email from AI Task Manager. Please do not reply to this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hello,
        
        We received a request to reset your password for your AI Task Manager account.
        
        To reset your password, please visit the following link:
        {reset_url}
        
        This link will expire in {settings.password_reset_token_expire_hours} hours.
        
        If you didn't request a password reset, please ignore this email.
        
        This is an automated email from AI Task Manager. Please do not reply to this email.
        """
        
        return self.send_email(to_email, subject, html_content, text_content)

# Create a singleton instance
email_service = EmailService()
