import asyncio
import os
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
    print(f"The user who just logged in has the email {login.user.email}")

main()