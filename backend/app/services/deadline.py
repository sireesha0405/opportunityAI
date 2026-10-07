import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
import uuid
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger("opportunityai.deadline")

async def send_email_notification(to_email: str, subject: str, html_content: str) -> bool:
    """Send SMTP email notification if SMTP is configured; otherwise log cleanly"""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info(f"[In-App Notification Preferred] SMTP not configured. Skipped sending email to {to_email}.")
        return False
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.EMAILS_FROM_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"Successfully sent email notification to {to_email}")
        return True
    except Exception as e:
        logger.warning(f"Failed to send email notification: {e}")
        return False

async def generate_deadline_notifications_for_user(db, user: Dict[str, Any], opportunities: List[Dict[str, Any]]):
    """
    Checks upcoming deadlines for user's matched and saved opportunities.
    Prevents duplicate notifications for the same opportunity reminder interval.
    """
    user_id = user.get("id")
    user_email = user.get("email")
    user_name = user.get("full_name", "Student")
    
    # Fetch saved opportunities
    saved_cursor = db.saved_opportunities.find({"user_id": user_id})
    saved_list = await saved_cursor.to_list(100)
    saved_opp_ids = {s.get("opportunity_id") for s in saved_list}

    # Fetch existing notifications for this user
    existing_cursor = db.notifications.find({"user_id": user_id})
    existing_notifications = await existing_cursor.to_list(500)
    existing_notif_keys = {
        f"{n.get('opportunity_id')}_{n.get('title')}" for n in existing_notifications if n.get("opportunity_id")
    }

    new_notifications = []

    for opp in opportunities:
        opp_id = opp.get("id")
        title = opp.get("title")
        org = opp.get("organization")
        deadline_str = opp.get("deadline", "")
        
        # Calculate days remaining
        try:
            clean_str = deadline_str.replace("Z", "+00:00")
            dl = datetime.fromisoformat(clean_str)
            now = datetime.now(timezone.utc)
            days_left = (dl - now).days
        except Exception:
            continue

        notif_title = None
        notif_msg = None
        urgency_type = "deadline_reminder"

        # Check reminder triggers
        if 0 <= days_left <= 1:
            notif_title = f"🚨 FINAL DAY: {title}"
            notif_msg = f"The deadline for {title} at {org} closes in less than 24 hours! Submit your application now."
        elif days_left == 3:
            notif_title = f"⏰ 3 Days Left: {title}"
            notif_msg = f"Only 3 days remaining to apply for {title} ({org}). Finalize your application documents."
        elif days_left == 7 and opp_id in saved_opp_ids:
            notif_title = f"📅 1 Week Reminder: {title}"
            notif_msg = f"Your saved opportunity '{title}' closes in exactly 7 days. Review required skills and criteria."

        if notif_title:
            key = f"{opp_id}_{notif_title}"
            if key not in existing_notif_keys:
                notif_obj = {
                    "id": f"notif-{uuid.uuid4().hex[:10]}",
                    "user_id": user_id,
                    "title": notif_title,
                    "message": notif_msg,
                    "type": urgency_type,
                    "opportunity_id": opp_id,
                    "is_read": False,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "action_url": f"/explore?id={opp_id}"
                }
                new_notifications.append(notif_obj)
                existing_notif_keys.add(key)

                # Attempt email delivery if user has configured SMTP
                email_html = f"""
                <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                    <h2>OpportunityAI Deadline Alert</h2>
                    <p>Hello {user_name},</p>
                    <p><strong>{notif_title}</strong></p>
                    <p>{notif_msg}</p>
                    <p><a href="{opp.get('official_url')}" style="background-color: #2563eb; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 6px;">View Official Application</a></p>
                </div>
                """
                await send_email_notification(user_email, notif_title, email_html)

    if new_notifications:
        await db.notifications.insert_many(new_notifications)
        logger.info(f"Generated {len(new_notifications)} new notifications for user {user_id}")

    return len(new_notifications)
