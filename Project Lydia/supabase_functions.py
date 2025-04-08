import supabase as sb
from dotenv import load_dotenv
from pathlib import Path
import os

class SBInstance:

    url: str = None
    user_key: str = None 
    supabase: sb.Client = None

    def __init__(self):
        dotenv_path = Path('.') / '.env' # Assumes .env is in the same directory as script
        load_dotenv(dotenv_path=dotenv_path)

        self.url = os.environ.get("SUPABASE_URL")
        self.user_key = os.environ.get("SUPABASE_KEY")

    def initialize(self):
        self.supabase = sb.create_client(self.url, self.user_key)
        if self.supabase:
            print("Supabase Client has been initialized")
        else:
            print("There was a problem with Client Initialization")

    def sign_up(self, email, password):
        data = self.supabase.auth.sign_up(
                {
                    "email": email,
                    "password": password,
                }
        )

        if data.user:
            print(f"Sign-up successful for user: {data.user.email}")
            return data  # Return the auth response (includes user data, etc.)
        else:
            print("Sign-up failed (no user returned)")
            return None  # Indicate failure

    def sign_in(self, email, password):
        data = self.supabase.auth.sign_in_with_password(
            {
                    "email": email,
                    "password": password,
            }
        )

        if data.user:
            print(f"Sign-in successful for user: {data.user.email}")
            return data  # Return the auth response (includes user data, etc.)
        else:
            print("Sign-in failed (no user returned)")
            return None  # Indicate 

    async def get_user(self):
        session = await self.supabase.auth.get_user()
        return session

