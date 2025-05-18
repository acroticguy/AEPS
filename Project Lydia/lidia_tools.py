import os
import dotenv
import requests
import json
import supabase_functions
import datetime
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

    def to_dict(self):
        return {
            "task_name": self.task_name,
            "description": self.description,
            "due_date": self.due_date,
            "priority": self.priority
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

def create_task(task_name: str, description: str, due_date: str, priority: int) -> dict:
    """
    Create a task with the given details.
    
    Args:
        task_name (str): The name of the task.
        description (str): A brief description of the task.
        due_date (str): The due date for the task in YYYY-MM-DD format.
        priority (int): The priority level of the task (1-5).
    
    Returns:
        dict: The data in dictionary form.
    """

    return {
            "task_name": task_name,
            "description": description,
            "due_date": due_date,
            "priority": priority
        }
    
available_tools = [create_task]