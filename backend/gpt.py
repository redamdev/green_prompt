import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv() 
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

def chat(prompt, context, model):

    messages = [{"role": "system", "content": "You are a helpful assistant."}]

    for msg in context:
        if msg["role"] in ["user", "assistant"]:
            messages.append(msg)
    
    messages.append({"role": "user", "content": prompt})

    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content

    except Exception as e:
        print(f"Error generating response: {e}")
        return f"Error generating response: {e}"