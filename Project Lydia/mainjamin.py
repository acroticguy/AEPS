from lidia import Lidia
from supabase_functions import SBInstance
from teams_handler import TeamsHandler
import time

def main():

    sbi = SBInstance()
    sbi.initialize()

    email = "alexistestingagain@gmail.com"
    password = "password"

    login = sbi.sign_in(email, password)
    print(f"The user who just logged in has the ID {login.user.id}")

    # Initialize Lidia
    lidia_instance = Lidia(sbi)
    teams_handler = TeamsHandler()
    teams_handler.update_access_token()

    new_msgs = teams_handler.get_new_chat_messages()
    if new_msgs:
        print(f"New messages since last check: {len(new_msgs)}")
    else:
        print("No new messages since last check.")

    for msg in new_msgs:
        print(f"Processing message: {msg}")
        lidia_instance.process_notification(msg)
        time.sleep(5)

    dummy_message = {
        "sender_name": "John Doe",
        "sender_id": 12345,
        "text": "Hello, this is another test message. I need you to send me the Q3 report by tomorrow. Thanks! \n TIMESTAMP: 2025-05-10 12:00:00 \n",
    }

main()