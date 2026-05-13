import os
import markdown
from ollama import Client
from dotenv import load_dotenv
from config.config import SYSTEM_PROMPT

load_dotenv()


class ChatService:
    def __init__(self):
        self.client = Client(
            host='https://ollama.com',
            headers={
                'Authorization': 'Bearer ' + os.getenv('OLLAMA_CLOUD_API_KEY')
            }
        )
        self.model = 'gpt-oss:120b'

    def chat(self, prompt):
        system_prompt = {
            'role': 'system',
            'content': SYSTEM_PROMPT
        }
        user_prompt = {
            'role': 'user',
            'content': prompt
        }

        res = self.client.chat(
            model=self.model,
            messages=[system_prompt, user_prompt],
            stream=False
        )
        response = res['message']['content']

        # Convert markdown into HTML
        content = markdown.markdown(
            response,
            extensions=[
                "fenced_code",
                "tables",
                "codehilite"
            ]
        )
        print(f'AI response is: {content[0:100]} .....')
        return content
