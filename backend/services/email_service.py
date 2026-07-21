"""
Placeholder for alert-notification emails. Not in the SRS functional
requirements as a hard requirement, but the folder structure reserves this
file, so it's stubbed with a logging fallback until/if it's needed.
"""
import logging

logger = logging.getLogger("email_service")


def send_alert_email(to_email: str, subject: str, body: str) -> None:
    # Wire up a real provider (SES, SendGrid, etc.) here if this becomes a requirement.
    logger.info("EMAIL (stub) to=%s subject=%s body=%s", to_email, subject, body)
