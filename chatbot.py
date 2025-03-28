import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Hugging Face API configuration
API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}

def get_bot_response(user_input):
    """
    Get response from the chatbot using Hugging Face API
    """
    try:
        response = requests.post(
            API_URL, 
            headers=headers, 
            json={"inputs": user_input}
        )
        response.raise_for_status()
        return response.json()[0]["generated_text"]
    except Exception as e:
        return f"Xin lỗi, đã có lỗi xảy ra: {str(e)}"

def main():
    print("Chào mừng đến với Chatbot AI! (Gõ 'quit' để thoát)")
    print("-" * 50)
    
    while True:
        user_input = input("\nBạn: ")
        
        if user_input.lower() == 'quit':
            print("Tạm biệt!")
            break
            
        bot_response = get_bot_response(user_input)
        print(f"\nBot: {bot_response}")

if __name__ == "__main__":
    main() 