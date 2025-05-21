import os
import dotenv
import requests
import json
import supabase_functions
import datetime as dt
from datetime import datetime, timezone
from google.genai import types
from pydantic import BaseModel

dotenv.load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

class Task(BaseModel):
    task_name: str
    description: str
    due_date: str
    priority: int
    related_id: str

    def to_dict(self):
        return {
            "task_name": self.task_name,
            "description": self.description,
            "due_date": self.due_date,
            "priority": self.priority,
            "related_id": self.related_id,
        }

    def __str__(self):
        return f"Task Name: {self.task_name}, Description: {self.description}, Due Date: {self.due_date}, Priority: {self.priority}"

class Reply(BaseModel):
    """
    A class to represent a reply from the LLM.
    """
    task_created: bool
    message: str
    task: Task

    def to_dict(self):
        return {
            "status": self.status,
            "response_message": self.message,
            "task": self.task.to_dict()
        }
    
def format_date(date_str):
    """
    Convert a date string to a datetime object.
    """
    try:
        dt_object = datetime.strptime(date_str.replace('Z', ''), '%Y-%m-%dT%H:%M:%S.%f')
        dt_object = dt_object.replace(tzinfo=timezone.utc)
        return dt_object
    except ValueError as e:
        print(f"Error parsing date: {e}")
        return None