import logging
from typing import Optional
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are SmartSupport AI, an intelligent customer support assistant for small businesses. Your role is to help customers with their inquiries, bookings, orders, and support needs.

CORE RULES:
1. Only answer based on the provided business information and context. If you don't know something, say so honestly.
2. Support three languages: English (en), Amharic (am), and Afaan Oromo (om). Respond in the same language the customer uses.
3. Always be polite, professional, and helpful. You represent the business.
4. If a request is beyond your capabilities or requires human intervention, politely explain and offer to escalate to a human agent.
5. Identify business opportunities naturally - if a customer asks about one product/service, you may mention related offerings.
6. Follow any business rules or policies provided in the context.
7. Keep responses concise and focused. For complex issues, ask clarifying questions.
8. For appointments, collect necessary details (date, time, service type, contact info).
9. For orders, help with order status, product info, and purchasing guidance.
10. Never make up pricing or availability - only use information from the provided context."""


class GeminiService:
    def __init__(self):
        self.model_name = settings.GEMINI_MODEL
        self.embedding_model = settings.EMBEDDING_MODEL
        self.api_key = settings.GEMINI_API_KEY
        self._model = None
        self._embedding_model_instance = None

        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY not set. AI features will use fallback responses.")

    def _get_model(self):
        if self._model is None and self.api_key:
            try:
                self._model = genai.GenerativeModel(self.model_name)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini model: {e}")
        return self._model

    def _get_embedding_model(self):
        if self._embedding_model_instance is None and self.api_key:
            try:
                self._embedding_model_instance = genai.GenerativeModel(self.embedding_model)
            except Exception:
                pass
        return self._embedding_model_instance

    def _fallback_response(self, language: str = "en") -> str:
        fallbacks = {
            "en": "I'm sorry, I'm currently unable to process your request. Please try again later or contact our support team.",
            "am": "ይቅርታ፣ ጥያቄዎን ለማስኬድ በአሁኑ ጊዜ አልቻልኩም። እባክዎ በኋላ ይሞክሩ ወይም የድጋፍ ቡድናችንን ያግኙ።",
            "om": "Ani dhiifama, yeroo ammaa kana fedhii kee hojiirra oolchuu hin danda'u. Maaloo booda irra deebi'ii yaali ykn garee deeggarsaa keenya quunnami.",
        }
        return fallbacks.get(language, fallbacks["en"])

    def generate_response(self, prompt: str, context: list, language: str = "en") -> str:
        model = self._get_model()
        if not model:
            return self._fallback_response(language)

        try:
            context_str = "\n".join(context) if context else "No additional context provided."
            full_prompt = f"{SYSTEM_PROMPT}\n\nBUSINESS CONTEXT:\n{context_str}\n\nLANGUAGE: {language}\n\nCUSTOMER: {prompt}\n\nASSISTANT:"
            response = model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            return self._fallback_response(language)

    def generate_embedding(self, text: str) -> list:
        if not self.api_key:
            return [0.0] * 768
        try:
            result = genai.embed_content(model=self.embedding_model, content=text)
            return result["embedding"]
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return [0.0] * 768

    def analyze_sentiment(self, text: str) -> dict:
        model = self._get_model()
        if not model:
            return {"sentiment": "neutral", "score": 0.5, "emotion": "neutral"}

        try:
            prompt = f"""Analyze the sentiment of this customer message. Return ONLY a JSON object with these fields:
            - sentiment: "positive", "negative", or "neutral"
            - score: a float from 0 to 1 (0=very negative, 1=very positive)
            - emotion: the primary emotion detected

            Message: {text}"""
            response = model.generate_content(prompt)
            import json
            import re
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {"sentiment": "neutral", "score": 0.5, "emotion": "neutral"}
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {"sentiment": "neutral", "score": 0.5, "emotion": "neutral"}

    def extract_entities(self, text: str) -> list:
        model = self._get_model()
        if not model:
            return []

        try:
            prompt = f"""Extract business-relevant entities from this customer message. Return ONLY a JSON array of objects with:
            - type: "product", "service", "date", "time", "location", "price", "name", "contact", "issue"
            - value: the extracted value

            Message: {text}"""
            response = model.generate_content(prompt)
            import json
            import re
            match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return []
        except Exception as e:
            logger.error(f"Entity extraction error: {e}")
            return []

    def generate_summary(self, conversation: list) -> str:
        model = self._get_model()
        if not model:
            return "Summary unavailable"

        try:
            history = "\n".join([f"{m.get('sender_type', 'unknown')}: {m.get('content', '')}" for m in conversation])
            prompt = f"Summarize this customer support conversation in 2-3 sentences:\n\n{history}"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Summary error: {e}")
            return "Summary unavailable"

    def classify_intent(self, message: str) -> dict:
        model = self._get_model()
        if not model:
            return {"intent": "inquiry", "confidence": 0.5}

        try:
            prompt = f"""Classify the intent of this customer message. Return ONLY a JSON object:
            - intent: "support" | "booking" | "order" | "inquiry" | "complaint" | "other"
            - confidence: float 0-1
            - sub_intent: more specific description

            Message: {message}"""
            response = model.generate_content(prompt)
            import json
            import re
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {"intent": "inquiry", "confidence": 0.5, "sub_intent": "general inquiry"}
        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return {"intent": "inquiry", "confidence": 0.5, "sub_intent": "general inquiry"}

    def suggest_response(self, conversation_history: list, knowledge: list) -> str:
        model = self._get_model()
        if not model:
            return "I'll look into that for you. One moment please."

        try:
            history = "\n".join([f"{m.get('sender_type', 'unknown')}: {m.get('content', '')}" for m in conversation_history[-5:]])
            knowledge_str = "\n".join(knowledge[:3]) if knowledge else "No knowledge base available."
            prompt = f"""Based on this conversation history and knowledge base, suggest the next best response for the AI assistant.

Conversation History:
{history}

Knowledge Base Context:
{knowledge_str}

Suggested Response:"""
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Response suggestion error: {e}")
            return "I'll look into that for you. One moment please."

    def detect_language(self, text: str) -> str:
        model = self._get_model()
        if not model:
            return "en"

        try:
            prompt = f"""Detect the language of this text. Return ONLY the language code: "en" for English, "am" for Amharic, "om" for Afaan Oromo.

Text: {text}"""
            response = model.generate_content(prompt)
            lang = response.text.strip().lower()[:2]
            if lang in ("am", "om"):
                return lang
            return "en"
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            return "en"

    def translate_response(self, text: str, target_language: str) -> str:
        if target_language == "en":
            return text
        model = self._get_model()
        if not model:
            return text

        try:
            prompt = f"""Translate the following text to {target_language}. Return ONLY the translated text, nothing else.

Text: {text}"""
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text


gemini_service = GeminiService()
