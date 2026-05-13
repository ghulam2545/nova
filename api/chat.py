from fastapi import APIRouter

from core.chat_service import ChatService
from model.input_prompt import InputPrompt

router = APIRouter()

chat_service = ChatService()


@router.post("/chat")
async def chat(prompt: InputPrompt):
    response = chat_service.chat(prompt.input_prompt)
    return {
        "response": response
    }
