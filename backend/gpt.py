import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv() 
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

def chat(prompt, context, model):
    
    context_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in context])
    input_text = f"{context_text}\nuser: {prompt}"

    try:
        response = client.responses.create(
            model=model,
            instructions="Respond as a helpful assistant.",
            input=input_text,
        )

        return response.output_text

    except Exception as e:
        return (f"Error generating response: {e}")