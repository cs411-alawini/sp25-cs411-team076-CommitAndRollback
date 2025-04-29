import google.generativeai as genai
from typing import List, Dict
from config import GEMINI_API_KEY

# Initialize Gemini API
genai.configure(api_key=GEMINI_API_KEY)

def list_available_models():
    """
    List all available models in the Gemini API.
    """
    try:
        models = genai.list_models()
        print("Available models:")
        for model in models:
            print(f"- {model.name}")
        return models
    except Exception as e:
        print(f"Error listing models: {str(e)}")
        return None

def summarize_messages(messages: List[Dict]) -> str:
    """
    Summarize a list of chat messages using Gemini API.
    
    Args:
        messages (List[Dict]): List of message dictionaries containing sender_name and message_text
        
    Returns:
        str: Generated summary of the messages
    """
    try:
        # Format messages for Gemini
        formatted_messages = []
        for msg in messages:
            formatted_messages.append(f"{msg['sender_name']}: {msg['message_text']}")
        
        # Join messages with newlines
        conversation = "\n".join(formatted_messages)
        
        # Create prompt for Gemini
        prompt = f"""Please provide a concise summary of the following conversation. 
        Focus on the main topics discussed and key points made by participants.
        Keep the summary under 200 words.
        
        Conversation:
        {conversation}
        
        Summary:"""
        
        # Generate summary using Gemini
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        print(f"Error in summarize_messages: {str(e)}")
        raise Exception("Failed to generate summary") 