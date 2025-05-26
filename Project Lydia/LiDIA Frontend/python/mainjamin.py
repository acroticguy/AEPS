from lidia import Lidia
from supabase_functions import SBInstance
from teams_handler import TeamsHandler
import lidia_tools
import time
import sys
import os

def main():

    in_electron = len(sys.argv) == 4
    sbi = SBInstance()
    if in_electron:
        # If 3 arguments are provided, it means we are running from Electron. Arguments are:
        # 1. Access Token, 2. Refresh Token, 3. MSAL Token
        os.chdir('python')
        access_token = sys.argv[1]
        refresh_token = sys.argv[2]
        msal_token = sys.argv[3]
        sbi.initialize(access_token, refresh_token)
        teams_handler = TeamsHandler(msal_token)
        
    else:
        # Otherwise, initialize without tokens (local sign-in)
        sbi.initialize()
    
        email = "alexistestingagain@gmail.com"
        password = "password"

        login = sbi.sign_in(email, password)
        print(f"The user who just logged in has the ID {login.user.id}")
        teams_handler = TeamsHandler()

        # Initialize Lidia
    lidia_instance = Lidia(sbi)
    while True:
        if not in_electron:
            # If not running in Electron, update the access token
            teams_handler.update_access_token()

        new_msgs = teams_handler.get_new_chat_messages()
        if new_msgs:
            lidia_tools.tts(f"New messages since last check: {len(new_msgs)}")
        else:
            lidia_tools.tts("No new messages since last check.")

        for msg in new_msgs:
            print(f"Processing message: {msg}")
            lidia_instance.process_notification(msg)
            time.sleep(5)
        time.sleep(300)

main()