# lidia.py handles the commmunication between the LLM and the rest of the program. Here we will do TTS, and send the text to the LLM.
import os
import google.genai
import threading
import time
import dotenv
import supabase_functions
import lidia_tools
import json

class Lidia:
    def __init__(self, sbinstance):
        dotenv.load_dotenv()
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
        self.gemini_model = "gemini-2.0-flash"

        self.sbinstance = sbinstance

        self.user_id = self.sbinstance.user.id
        self.client = google.genai.Client(api_key=GEMINI_API_KEY)

        res = self.sbinstance.get_user_data()
        if res is None:
            print("User not found in the database.")
            return
        
        if not len(res) == 1:
            print("Multiple users found in the database. Please check the database.")
            return
        self.display_name = res[0]["display_name"]
        self.email = res[0]["email"]
        self.lidia_instructions = res[0]["lidia_instructions"]
        self.work_scope = res[0]["work_scope"]

        print("Lidia session initialized!")

    def process_notification(self, message):
        """
        Send a notification from Microsoft Teams to the LLM for analysis.
        """
        # Fetch relevant data from the sender's ID

        #IDEA: FIRST ASK THE USER IF THEY ARE IN A POSITION TO LISTEN TO THE MESSAGE. IF THEY ARE, READ THE MESSAGE.

        if message is None:
            print("No message to process.")
            return
        elif len(message["text"]) < 20:
            print("Message too short to process.")
            return

        tasks = self.sbinstance.get_tasks(message["sender_id"])

        system_ins = f"""
            You are LiDIA, a personal assistant for workplace productivity. You're assisting {self.display_name} with their work, 
            which involves the following: {self.work_scope}. 
            You will be given a message from Microsoft Teams, and you will create a task for it.
            You can use the information from the message to figure out the task name, description, due date, and priority.
            You will also be given a list of tasks associated with the sender's ID.
            If there is no task to create, you will simply respond with a summary of the message you received, return task_created as false.
            When communicating with the user, always use the name {self.display_name}, and keep in mind the following instructions: {self.lidia_instructions}.

            Example scenario:

            Let's say you have this task list known:

            - Train the new hire
            - Finish the report for the client
            - Send the analytics data

            'Sender: John. Sender ID: 12345. Timestamp: 2025-04-18 10:00:00
            Hey {self.display_name}, can you please give me an update on the training of the new hire? I was expecting a message before yesterday's EOD. Thanks!'

            Example response:
            'Hey {self.display_name}, John sent you a message asking for an update regarding the training of the new hire.'

            END OF EXAMPLE SCENARIO

            As you can see, the message is not a task, but it is related to one of the tasks in the list. That's why we will not need to create a task in the database.

            Here is another example:
            'Sender: Mary. Sender ID: 54321. Timestamp: 2025-05-18 10:00:00
            Hi {self.display_name}, can you please send the analytics data to the client? I need it by tomorrow EOD. Thanks!'

            *FUNCTION CALL EXECUTION*
            - task_name: Send analytics data to the client
            - description: Send the analytics data to the client as requested by Mary.
            - due_date: 2025-05-19
            - priority: 2
            *END OF FUNCTION CALL EXECUTION*
            END OF EXAMPLE SCENARIO
            """

        session = self.client.chats.create(
            model=self.gemini_model,
            config={
                "response_mime_type": "application/json",
                "response_schema": lidia_tools.Reply,
                'system_instruction': system_ins,
            }
        )

        prompt = f"""
            Hey LiDIA, {self.display_name} has an incoming message from {message["sender_name"]} (ID: {message["sender_id"]}). 
            Here is the list of tasks associated with this ID: {json.dumps(tasks)}.

            And here is the message: {message["text"]}
            Create a task for it, if necessary.
            """
        
        lidia_res = session.send_message(prompt)

        if lidia_res.candidates[0].content.parts[0].function_call:
            function_call = lidia_res.candidates[0].content.parts[0].function_call
            print(f"Function to call: {function_call.name}")
            print(f"Arguments: {function_call.args}")
        else:
            print("No function call found in the response.")
            print(lidia_res.text)

        # Play TTS response

        print(f"Notification sent to {self.user_id}: {message}")