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
        self.user = None

    def initialize(self, access_token=None, refresh_token=None):
        self.supabase = sb.create_client(self.url, self.user_key)
        if self.supabase:
            print("Supabase Client has been initialized")
        else:
            print("There was a problem with Client Initialization")
        if access_token and refresh_token:
            self.supabase.auth.set_session(access_token, refresh_token)
            data = self.supabase.auth.get_session()
            if data.user:
                print(f"Authentication successful for user: {data.user.email}")
                self.user = data.user
            else:
                print("Authentication failed (no user returned)")

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
            self.user = data.user
            return data  # Return the auth response (includes user data, etc.)
        else:
            print("Sign-in failed (no user returned)")
            return None  # Indicate 
        
    def get_tasks(self, related_to=None):
        """
        Fetch tasks for a specific user from the Supabase database.
        
        Args:
            user_id (str): The ID of the user whose tasks are to be fetched.
        
        Returns:
            list: A list of tasks associated with the user.
        """

        response = (
            self.supabase.table("tasks")
            .select("*")
            .eq("user_id", self.user.id)
            .eq("chat_origin_id", related_to)
            .execute()
        )
        print(f"Tasks fetched for user {self.user.id}, related to {related_to}: {response.data}")
        return response.data
    
    def get_user_data(self):


        response = (
            self.supabase.table("profiles")
            .select("display_name, email, lidia_instructions, work_scope")
            .eq("id", self.user.id)
            .execute()
        )

        print(f"User fetched: {response.data}")
        return response.data

    async def get_user(self):
        session = await self.supabase.auth.get_user()
        return session

    def post_task(self, task):
        """
        Post a new task to the Supabase database.
        
        Args:
            task (dict): A dictionary containing task details.
        
        Returns:
            dict: The response from the Supabase database after posting the task.
        """


        response = (
            self.supabase.table("tasks")
            .insert(task)
            .execute()
        )
        print(f"Task posted: {response.data}")
        return response.data