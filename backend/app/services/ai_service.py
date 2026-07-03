from typing import Dict, Optional
import httpx
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class HuggingFaceService:
    """Service for AI/ML operations using Hugging Face"""
    
    def __init__(self):
        self.api_key = settings.HUGGINGFACE_API_KEY
        self.base_url = "https://api-inference.huggingface.co/models"
    
    async def classify_lead(self, lead_text: str) -> Dict[str, any]:
        """
        Classify lead quality and intent using sentiment analysis
        Returns priority score and recommended action
        """
        try:
            # Use sentiment analysis model
            model = "distilbert-base-uncased-finetuned-sst-2-english"
            url = f"{self.base_url}/{model}"
            
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": lead_text}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Parse sentiment for lead quality
                    if isinstance(result, list) and len(result) > 0:
                        sentiment = result[0]
                        
                        # Determine lead quality based on sentiment
                        if sentiment[0]["label"] == "POSITIVE":
                            priority = "high"
                            score = sentiment[0]["score"]
                        else:
                            priority = "medium"
                            score = sentiment[0]["score"]
                        
                        return {
                            "priority": priority,
                            "confidence_score": score,
                            "recommended_action": "contact_immediately" if priority == "high" else "follow_up",
                            "sentiment": sentiment[0]["label"]
                        }
                else:
                    logger.warning(f"HuggingFace API error: {response.status_code}")
                    return self._get_fallback_classification()
                    
        except Exception as e:
            logger.error(f"Lead classification error: {str(e)}")
            return self._get_fallback_classification()
    
    async def summarize_appointment(self, appointment_text: str) -> str:
        """
        Generate a concise summary of appointment details
        """
        try:
            model = "facebook/bart-large-cnn"
            url = f"{self.base_url}/{model}"
            
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={
                        "inputs": appointment_text,
                        "parameters": {
                            "max_length": 100,
                            "min_length": 30
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        return result[0].get("summary_text", appointment_text)
                    return appointment_text
                else:
                    logger.warning(f"HuggingFace summarization error: {response.status_code}")
                    return appointment_text
                    
        except Exception as e:
            logger.error(f"Appointment summarization error: {str(e)}")
            return appointment_text
    
    async def generate_follow_up_message(
        self,
        customer_name: str,
        appointment_details: str,
        context: Optional[str] = None
    ) -> str:
        """
        Generate a personalized follow-up message
        """
        try:
            model = "facebook/blenderbot-400M-distill"
            url = f"{self.base_url}/{model}"
            
            headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
            
            prompt = f"Write a professional follow-up message for {customer_name} regarding their appointment: {appointment_details}"
            if context:
                prompt += f". Context: {context}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    json={"inputs": prompt}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        return result[0].get("generated_text", self._get_fallback_message(customer_name))
                    return self._get_fallback_message(customer_name)
                else:
                    logger.warning(f"HuggingFace message generation error: {response.status_code}")
                    return self._get_fallback_message(customer_name)
                    
        except Exception as e:
            logger.error(f"Follow-up message generation error: {str(e)}")
            return self._get_fallback_message(customer_name)
    
    def _get_fallback_classification(self) -> Dict[str, any]:
        """Fallback classification when API fails"""
        return {
            "priority": "medium",
            "confidence_score": 0.5,
            "recommended_action": "review_manually",
            "sentiment": "NEUTRAL"
        }
    
    def _get_fallback_message(self, customer_name: str) -> str:
        """Fallback message when API fails"""
        return f"Dear {customer_name}, thank you for choosing CareOps. We wanted to follow up regarding your recent appointment. If you have any questions or concerns, please don't hesitate to reach out. We look forward to serving you again."


# Global HuggingFace service instance
hf_service = HuggingFaceService()
