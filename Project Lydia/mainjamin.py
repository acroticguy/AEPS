import asyncio
import os
from lidia import Lidia
from dotenv import load_dotenv
from pathlib import Path
from supabase_functions import SBInstance

def main():

    dotenv_path = Path('.') / '.env' # Assumes .env is in the same directory as script
    load_dotenv(dotenv_path=dotenv_path)

    url = os.environ.get("SUPABASE_URL")
    user_key = os.environ.get("SUPABASE_KEY")

    print(f"URL IS: {url}")

    sbi = SBInstance()
    sbi.initialize()

    email = "alexistestingagain@gmail.com"
    password = "password"

    login = sbi.sign_in(email, password)
    print(f"The user who just logged in has the ID {login.user.id}")

    # Initialize Lidia
    lidia_instance = Lidia(sbi)

    dummy_message = {
        "sender_name": "John Doe",
        "sender_id": 12345,
        "text": "Hello, this is another test message. I need you to send me the Q3 report by tomorrow. Thanks! \n TIMESTAMP: 2025-05-10 12:00:00 \n",
    }

    lidia_instance.process_notification(dummy_message)

main()