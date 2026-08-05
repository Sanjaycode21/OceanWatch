import abc
import logging

logger = logging.getLogger("alerts.sms")

class BaseSMSProvider(abc.ABC):
    @abc.abstractmethod
    def send_sms(self, phone: str, message: str) -> bool:
        """Sends an SMS text message to the target phone number. Returns True on success."""
        pass

class MockSMSProvider(BaseSMSProvider):
    def send_sms(self, phone: str, message: str) -> bool:
        """Logs the SMS transmission coordinates to standard output for local validation."""
        logger.info(f"SMS BROADCAST [MOCK] to {phone}: '{message}'")
        return True
