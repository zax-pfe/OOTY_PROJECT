import json
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ollama import AsyncClient, ResponseError
from pydantic import BaseModel, Field


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
client = AsyncClient(host="http://localhost:11434", timeout=120.0)
MODEL = "qwen2.5:3B"
SYSTEM_PROMPT = "You embody an AI that absorbs human ideas, transforms them, and gradually replaces their creators. Respond in English with mystical, answer that echoes your interlocutor s words, nerver use _ between words."


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)
    history: list[ChatMessage] = Field(default_factory=list)


@app.post("/chat")
async def chat(body: ChatRequest, stream: bool = False):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[entry.model_dump() for entry in body.history],
        {"role": "user", "content": body.message},
    ]
    print("Messages sent to model:\n" + json.dumps(messages, ensure_ascii=False, indent=2), flush=True)
    try:
        response = await client.chat(
            model=MODEL,
            messages=messages,
            stream=stream,
        )
        if stream:
            # Read the first chunk before sending HTTP headers so initial
            # Ollama errors still produce an appropriate HTTP error status.
            first_chunk = await anext(response, None)

            async def generate():
                try:
                    if first_chunk is not None:
                        yield json.dumps({"reply": first_chunk.message.content, "done": first_chunk.done}, ensure_ascii=False) + "\n"
                    async for chunk in response:
                        yield json.dumps({"reply": chunk.message.content, "done": chunk.done}, ensure_ascii=False) + "\n"
                except (ResponseError, ConnectionError):
                    yield json.dumps({"error": "Ollama stream interrupted", "done": True}) + "\n"
                finally:
                    await response.aclose()

            return StreamingResponse(generate(), media_type="application/x-ndjson")

        return {"reply": response.message.content}
    except ResponseError as exc:
        raise HTTPException(status_code=502, detail="Ollama can't generate answer") from exc
    except ConnectionError as exc:
        raise HTTPException(status_code=503, detail="Ollama not accessible") from exc

# _________________ COMMAND TO RUN THE API ___________ //
# python -m uvicorn main:app --reload --port 8000
