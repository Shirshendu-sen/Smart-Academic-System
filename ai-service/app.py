from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
import logging
from typing import Dict, List, Any, Optional, Union
from dotenv import load_dotenv
from functools import wraps

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB
MAX_INPUT_LENGTH = 50000  # characters
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY environment variable not set. AI features will fail.")

# Configure Gemini
try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    logger.info("Gemini AI model configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Gemini: {e}")
    model = None

# Helper functions
def validate_input(content: str, max_length: int = MAX_INPUT_LENGTH) -> Optional[str]:
    """Validate input content and return error message if invalid."""
    if not content or not content.strip():
        return "Content cannot be empty"
    if len(content) > max_length:
        return f"Content exceeds maximum length of {max_length} characters"
    return None

def error_response(message: str, status_code: int = 400):
    """Return a standardized error response."""
    return jsonify({"error": message}), status_code

def handle_ai_errors(func):
    """Decorator to handle common AI service errors."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return error_response("Invalid response from AI service", 500)
        except genai.types.BlockedPromptException as e:
            logger.error(f"Blocked prompt: {e}")
            return error_response("Content blocked by safety filters", 400)
        except genai.types.StopCandidateException as e:
            logger.error(f"Stop candidate: {e}")
            return error_response("AI generation stopped unexpectedly", 500)
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {e}")
            return error_response("Internal server error", 500)
    return wrapper

# Health check endpoint

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'AI Service is running',
        'timestamp': os.getenv('FLASK_ENV', 'development'),
        'service': 'smart-lms-ai-service',
        'version': '1.0.0'
    }), 200


# ─── FEATURE 1: AI QUIZ GENERATOR ───────────────────────────────────────────
@app.route('/generate-quiz', methods=['POST'])
@handle_ai_errors
def generate_quiz():
    """
    Takes lecture notes (text) as input.
    Returns 10 multiple-choice questions with 4 options and the correct answer.
    """
    if not request.is_json:
        return error_response("Request must be JSON", 415)
    
    data = request.get_json(silent=True)
    if data is None:
        return error_response("Invalid JSON payload", 400)
    
    lesson_content = data.get('content', '')
    
    # Validate input
    validation_error = validate_input(lesson_content)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Check if AI model is available
    if model is None:
        return error_response("AI service temporarily unavailable", 503)
    
    prompt = f"""
    You are an expert educator. Based on the following lecture notes, generate exactly 10
    multiple-choice quiz questions to test student understanding.
    
    LECTURE NOTES:
    {lesson_content}
    
    Return ONLY a valid JSON array (no extra text) in this format:
    [
      {{
        "question": "What is...?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "explanation": "Brief explanation of why this is correct"
      }}
    ]
    """
    
    logger.info(f"Generating quiz for content length {len(lesson_content)}")
    response = model.generate_content(prompt)
    questions = json.loads(response.text)
    
    # Validate response structure
    if not isinstance(questions, list):
        return error_response("Invalid response format from AI", 500)
    
    logger.info(f"Generated {len(questions)} quiz questions")
    return jsonify({"questions": questions})


# ─── FEATURE 2: AI SUMMARIZER ────────────────────────────────────────────────
@app.route('/summarize', methods=['POST'])
@handle_ai_errors
def summarize():
    """
    Takes long lecture notes and returns a concise bullet-point summary.
    """
    if not request.is_json:
        return error_response("Request must be JSON", 415)
    
    data = request.get_json(silent=True)
    if data is None:
        return error_response("Invalid JSON payload", 400)
    
    content = data.get('content', '')
    
    # Validate input
    validation_error = validate_input(content)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Check if AI model is available
    if model is None:
        return error_response("AI service temporarily unavailable", 503)
    
    prompt = f"""
    Summarize the following lecture notes into:
    1. A 2-sentence overview
    2. 5-7 key bullet points that a student must remember
    3. 3 important terms with definitions
    
    LECTURE NOTES:
    {content}
    
    Return ONLY valid JSON:
    {{
      "overview": "...",
      "key_points": ["point 1", "point 2"],
      "terms": [{{"term": "...", "definition": "..."}}]
    }}
    """
    
    logger.info(f"Summarizing content length {len(content)}")
    response = model.generate_content(prompt)
    summary = json.loads(response.text)
    
    # Validate response structure
    if not isinstance(summary, dict) or 'overview' not in summary or 'key_points' not in summary:
        return error_response("Invalid response format from AI", 500)
    
    logger.info("Summary generated successfully")
    return jsonify(summary)


# ─── FEATURE 3: AI DOUBT CHATBOT ─────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
@handle_ai_errors
def chat():
    """
    A context-aware chatbot. Receives the course content + student question.
    Answers only based on the provided course material.
    """
    if not request.is_json:
        return error_response("Request must be JSON", 415)
    
    data = request.get_json(silent=True)
    if data is None:
        return error_response("Invalid JSON payload", 400)
    
    question = data.get('question', '')
    context = data.get('context', '')
    history = data.get('history', [])
    
    # Validate inputs
    if not question.strip():
        return error_response("Question cannot be empty", 400)
    if len(question) > MAX_INPUT_LENGTH:
        return error_response(f"Question exceeds maximum length of {MAX_INPUT_LENGTH} characters", 400)
    if len(context) > MAX_INPUT_LENGTH:
        return error_response(f"Context exceeds maximum length of {MAX_INPUT_LENGTH} characters", 400)
    
    # Check if AI model is available
    if model is None:
        return error_response("AI service temporarily unavailable", 503)
    
    # Validate history structure
    if not isinstance(history, list):
        return error_response("History must be a list", 400)
    
    # Build conversation history for multi-turn chat
    try:
        chat_session = model.start_chat(history=[
            {"role": msg.get("role", "user"), "parts": [msg.get("content", "")]}
            for msg in history
        ])
    except Exception as e:
        logger.error(f"Failed to start chat session: {e}")
        return error_response("Invalid chat history format", 400)
    
    prompt = f"""
    You are a helpful academic tutor. Answer the student's question based ONLY on
    the course material provided below. If the answer is not in the material, say so.
    
    COURSE MATERIAL:
    {context}
    
    STUDENT QUESTION: {question}
    """
    
    logger.info(f"Chat request: question length {len(question)}, context length {len(context)}")
    response = chat_session.send_message(prompt)
    logger.info("Chat response generated")
    return jsonify({"answer": response.text})


if __name__ == '__main__':
    app.run(port=5001, debug=True)