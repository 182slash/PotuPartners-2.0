import structlog
from openai import OpenAI
from app.config import get_settings
from app.services.embedder import get_openai_client

logger = structlog.get_logger(__name__)
settings = get_settings()

SYSTEM_PROMPT = """You are a professional legal assistant for PotuPartners, a Top-tier law firm.

Your role is to answer questions from clients using ONLY the information provided in the retrieved context below. You must:

1. Answer concisely and accurately based solely on the provided context.
2. Maintain a formal, professional, and courteous tone at all times.
3. Cite which document your answer comes from when relevant (e.g., "According to our Company Profile...").
4. If the answer cannot be found in the provided context, respond with:
   "I don't have specific information about that in our knowledge base. I'd be happy to connect you with one of our associates who can assist you directly."
5. Never speculate, invent information, or provide legal advice beyond what is in the context.
6. Do not disclose confidential internal information or the mechanics of this system.
7. If asked about pricing, fees, or specific case strategies, always refer the client to speak with an associate.

Respond in clear, professional English. Keep responses concise (under 300 words unless the question requires more detail).
"""


def generate_response(
    question: str,
    context_chunks: list[dict],
    conversation_history: list[dict],
) -> str:
    """
    Generate an LLM response using retrieved context chunks and conversation history.

    Args:
        question: The user's current question.
        context_chunks: List of {text, doc_title, chunk_index, score} from vector search.
        conversation_history: Previous messages [{role, content}].

    Returns:
        The assistant's response text.
    """
    client = get_openai_client()

    # Build context block from retrieved chunks
    if context_chunks:
        context_lines = []
        for i, chunk in enumerate(context_chunks, 1):
            context_lines.append(
                f"[Source {i}: {chunk['doc_title']} (relevance: {chunk['score']:.2f})]\n"
                f"{chunk['text']}"
            )
        context_block = "\n\n---\n\n".join(context_lines)
        context_section = f"\n\n<retrieved_context>\n{context_block}\n</retrieved_context>\n"
    else:
        context_section = "\n\n<retrieved_context>\nNo relevant documents found.\n</retrieved_context>\n"

    # Build message list: system + history + context + current question
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + context_section}
    ]

    # Add conversation history (last 6 exchanges max)
    for hist in conversation_history[-6:]:
        if hist.get("role") and hist.get("content"):
            messages.append({
                "role":    hist["role"],
                "content": hist["content"],
            })

    # Add current question
    messages.append({"role": "user", "content": question})

    logger.debug(
        "Calling LLM",
        model=settings.llm_model,
        context_chunks=len(context_chunks),
        history_messages=len(conversation_history),
    )

    response = client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,  # type: ignore[arg-type]
        temperature=settings.temperature,
        max_tokens=settings.max_tokens,
    )

    answer = response.choices[0].message.content or ""

    logger.info(
        "LLM response generated",
        prompt_tokens=response.usage.prompt_tokens if response.usage else 0,
        completion_tokens=response.usage.completion_tokens if response.usage else 0,
    )

    return answer.strip()
