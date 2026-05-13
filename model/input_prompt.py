from pydantic import BaseModel


class InputPrompt(BaseModel):
    input_prompt: str
