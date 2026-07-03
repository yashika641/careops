import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from typing import List, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending notifications"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.email_from = settings.EMAIL_FROM
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.email_from
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            message.attach(part2)
            
            # Send email
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                await aiosmtplib.send(
                    message,
                    hostname=self.smtp_host,
                    port=self.smtp_port,
                    username=self.smtp_username,
                    password=self.smtp_password,
                    start_tls=True
                )
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                # Mock mode - just log
                logger.info(f"[MOCK] Email would be sent to {to_email}: {subject}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_appointment_confirmation(
        self,
        customer_email: str,
        customer_name: str,
        appointment_details: dict
    ) -> bool:
        """Send appointment confirmation email"""
        
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9fafb; }
                .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Appointment Confirmed</h1>
                </div>
                <div class="content">
                    <p>Dear {{ customer_name }},</p>
                    <p>Your appointment has been confirmed! Here are the details:</p>
                    
                    <div class="details">
                        <p><strong>Service:</strong> {{ service_type }}</p>
                        <p><strong>Date:</strong> {{ date }}</p>
                        <p><strong>Time:</strong> {{ time_slot }}</p>
                        <p><strong>Location:</strong> {{ location }}</p>
                        {% if staff_name %}
                        <p><strong>Assigned Staff:</strong> {{ staff_name }}</p>
                        {% endif %}
                    </div>
                    
                    <p>If you need to reschedule or have any questions, please contact us.</p>
                    <p>We look forward to serving you!</p>
                </div>
                <div class="footer">
                    <p>© 2024 CareOps. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            customer_name=customer_name,
            service_type=appointment_details.get("service_type"),
            date=appointment_details.get("preferred_date"),
            time_slot=appointment_details.get("time_slot"),
            location=appointment_details.get("location"),
            staff_name=appointment_details.get("staff_name")
        )
        
        return await self.send_email(
            to_email=customer_email,
            subject="Your Appointment is Confirmed - CareOps",
            html_content=html_content
        )
    
    async def send_staff_assignment_notification(
        self,
        staff_email: str,
        staff_name: str,
        appointment_details: dict
    ) -> bool:
        """Send staff assignment notification"""
        
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9fafb; }
                .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>New Assignment</h1>
                </div>
                <div class="content">
                    <p>Dear {{ staff_name }},</p>
                    <p>You have been assigned to a new appointment:</p>
                    
                    <div class="details">
                        <p><strong>Customer:</strong> {{ customer_name }}</p>
                        <p><strong>Service:</strong> {{ service_type }}</p>
                        <p><strong>Date:</strong> {{ date }}</p>
                        <p><strong>Time:</strong> {{ time_slot }}</p>
                        <p><strong>Location:</strong> {{ location }}</p>
                    </div>
                    
                    <p>Please review the appointment details in your dashboard.</p>
                </div>
                <div class="footer">
                    <p>© 2024 CareOps. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(
            staff_name=staff_name,
            customer_name=appointment_details.get("customer_name"),
            service_type=appointment_details.get("service_type"),
            date=appointment_details.get("preferred_date"),
            time_slot=appointment_details.get("time_slot"),
            location=appointment_details.get("location")
        )
        
        return await self.send_email(
            to_email=staff_email,
            subject="New Appointment Assignment - CareOps",
            html_content=html_content
        )
    
    async def send_welcome_email(
        self,
        email: str,
        username: str,
        role: str
    ) -> bool:
        """Send welcome email to new users"""
        
        template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9fafb; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to CareOps!</h1>
                </div>
                <div class="content">
                    <p>Dear {{ username }},</p>
                    <p>Welcome to CareOps! Your account has been successfully created as a {{ role }}.</p>
                    <p>You can now log in and start using our platform.</p>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>© 2024 CareOps. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = template.render(username=username, role=role)
        
        return await self.send_email(
            to_email=email,
            subject="Welcome to CareOps!",
            html_content=html_content
        )


# Global email service instance
email_service = EmailService()
