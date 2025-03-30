import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from gpt import chat
from model import classify
from calc import calculate
from calc import model_choice
from firebase import db

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
CORS(app)

@app.route("/chat", methods=["POST"])
def chat_endpoint():
    data = request.get_json()

    prompt = data["prompt"]
    context_id = data["context_id"]

    try:
        context_ref = db.collection("chat_contexts").document(context_id)
        context_doc = context_ref.get()
        
        if context_doc.exists:
            context_data = context_doc.to_dict()
            context = context_data.get("context", [])
            last_model = context_data.get("last_model", None)
            calc = context_data.get("calc", 0)
        
        else:
            context = []
            last_model = None
            calc = 0
    
    except Exception as e:
        return jsonify(error=f"Error retrieving context: {str(e)}"), 500

    model = model_choice(classify(prompt))
    
    try:
        response = chat(prompt, context, model)
        new_calc = calculate(model, last_model, prompt, response) + calc

        try:
            context.append({"role": "user", "content": prompt})
            context.append({"role": "assistant", "content": response})

            context_ref.set({
                "context": context,
                "last_model": model,
                "calc": new_calc
            })
        except Exception as e:
            return jsonify(error=f"Error saving context: {str(e)}"), 500

        return jsonify(response=response, calc=calc)

    except Exception as e:
        return jsonify(error=f"Error processing chat: {str(e)}"), 500


@app.route("/chat-history/<context_id>", methods=["GET"])
def get_chat_history(context_id):
    
    try:
        context_ref = db.collection("chat_contexts").document(context_id)
        context_doc = context_ref.get()
        if context_doc.exists:
            context_data = context_doc.to_dict()
            return jsonify(context=context_data.get("context", []))
        else:
            return jsonify(context=[])
    
    except Exception as e:
        return jsonify(error=f"Error retrieving chat history: {str(e)}"), 500

if __name__ == "__main__":
    app.run(debug=False)
