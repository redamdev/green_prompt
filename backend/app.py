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
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "DELETE"]}})

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
            co2 = context_data.get("co2", 0)
            cost = context_data.get("cost", 0)
        
        else:
            context = []
            last_model = None
            co2= 0
            cost = 0
    
    except Exception as e:
        return jsonify(error=f"Error retrieving context: {str(e)}"), 500

    model = model_choice(classify(prompt))
    
    
    try:
        response = chat(prompt, context, model)
        temp = calculate(model, last_model, prompt, response)
        
        co2_new = co2 + temp[1]
        cost_new = cost + temp[0]

        try:
            context.append({"role": "user", "content": prompt})
            context.append({"role": "assistant", "content": response})

            context_ref.set({
                "context": context,
                "last_model": model,
                "cost": cost_new,
                "co2": co2_new

            })
        except Exception as e:
            return jsonify(error=f"Error saving context: {str(e)}"), 500

        return jsonify(response=response, cost=cost_new, co2=co2_new)

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
    
@app.route("/delete-chat/<context_id>", methods=["DELETE"])
def delete_chat(context_id):
    try:
        print(f"Attempting to delete chat with ID: {context_id}")
        # Delete the chat context from Firestore
        context_ref = db.collection("chat_contexts").document(context_id)
        context_doc = context_ref.get()
        
        if context_doc.exists:
            context_ref.delete()
            print(f"Successfully deleted chat with ID: {context_id}")
            return jsonify(message=f"Chat with ID {context_id} deleted successfully"), 200
        else:
            print(f"Chat with ID {context_id} not found")
            return jsonify(error=f"Chat with ID {context_id} not found"), 404
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error deleting chat: {str(e)}\n{error_details}")
        return jsonify(error=f"Error deleting chat: {str(e)}"), 500

if __name__ == "__main__":
    app.run(debug=True)
