from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')

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
def generate_quiz():
    """
    Takes lecture notes (text) as input.
    Returns 10 multiple-choice questions with 4 options and the correct answer.
    """
    data = request.json
    lesson_content = data.get('content', '')
    
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
    
    response = model.generate_content(prompt)
    questions = json.loads(response.text)
    return jsonify({"questions": questions})


# ─── FEATURE 2: AI SUMMARIZER ────────────────────────────────────────────────
@app.route('/summarize', methods=['POST'])
def summarize():
    """
    Takes long lecture notes and returns a concise bullet-point summary.
    """
    data = request.json
    content = data.get('content', '')
    
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
    
    response = model.generate_content(prompt)
    summary = json.loads(response.text)
    return jsonify(summary)


# ─── FEATURE 3: AI DOUBT CHATBOT ─────────────────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    """
    A context-aware chatbot. Receives the course content + student question.
    Answers only based on the provided course material.
    """
    data = request.json
    question = data.get('question', '')
    context = data.get('context', '')  # course content for this lesson
    history = data.get('history', [])  # previous messages in this conversation
    
    # Build conversation history for multi-turn chat
    chat_session = model.start_chat(history=[
        {"role": msg["role"], "parts": [msg["content"]]}
        for msg in history
    ])
    
    prompt = f"""
    You are a helpful academic tutor. Answer the student's question based ONLY on 
    the course material provided below. If the answer is not in the material, say so.
    
    COURSE MATERIAL:
    {context}
    
    STUDENT QUESTION: {question}
    """
    
    response = chat_session.send_message(prompt)
    return jsonify({"answer": response.text})


if __name__ == '__main__':
    app.run(port=5001, debug=True)