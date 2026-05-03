import os
from groq import Groq
from dotenv import load_dotenv
from ingest import ingest, get_collection

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

conversation_histories = {}

# Indexa documentos al arrancar
collection = ingest()

def get_relevant_context(question: str) -> str:
    results = collection.query(
        query_texts=[question],
        n_results=2
    )
    chunks = results["documents"][0] if results["documents"] else []
    return "\n\n".join(chunks)

def get_chat_response(message: str, session_id: str) -> str:
    if session_id not in conversation_histories:
        conversation_histories[session_id] = []

    context = get_relevant_context(message)

    system_prompt = f"""Eres un asistente virtual del sistema ERP SizeSoft.
Responde ÚNICAMENTE basándote en la siguiente documentación del sistema.
Si la pregunta no está relacionada con el sistema, indícalo amablemente.
Responde siempre en español, de forma clara, concisa y corta.
No tienes acceso a internet ni a información externa, solo a la DOCUMENTACIÓN DEL SISTEMA que se te proporciona a continuación.
si la gente te esta haciendo preguntas, es por que ya iniciaron sesion



DOCUMENTACIÓN DEL SISTEMA:
{context}
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages += conversation_histories[session_id]
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=512,
    )

    reply = response.choices[0].message.content

    conversation_histories[session_id].append({"role": "user", "content": message})
    conversation_histories[session_id].append({"role": "assistant", "content": reply})

    return reply