import msal
import dotenv
import os
import requests
import datetime as dt
from datetime import datetime, timezone
import json
from lidia_tools import format_date

def create_request(token, url):
    headers = {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json',}

    response = requests.get(url, headers=headers)
    return response

class TeamsHandler:

    dotenv.load_dotenv()
    CLIENT_ID = os.environ.get("CLIENT_ID")
    AUTHORITY = "https://login.microsoftonline.com/ad5ba4a2-7857-4ea1-895e-b3d5207a174f" # Tenant ID
    SCOPES = ["Chat.Read", "User.Read"] # Add other scopes as needed
    TOKEN_CACHE_FILE = "teams_token_cache.bin"

    def __init__(self, token=None):
        self.token_cache = msal.SerializableTokenCache()
        if os.path.exists(self.TOKEN_CACHE_FILE):
            self.token_cache.deserialize(open(self.TOKEN_CACHE_FILE, "r").read())
        if token:
            self.token = token
            self.profile = create_request(self.token, "https://graph.microsoft.com/v1.0/me").json()
            self.save_token_cache()
        else:
            self.token = None
        
            # For delegated, use PublicClientApplication
            self.app_msal = msal.PublicClientApplication(
                self.CLIENT_ID,
                authority=self.AUTHORITY,
                token_cache=self.token_cache
            )

        if not os.path.exists("config.json"):
            with open("config.json", "r") as f:
                self.last_check = format_date(json.load(f).get("last_check", None))
        else:
            self.last_check = dt.datetime.now(timezone.utc) - dt.timedelta(weeks=2) # Default to 2 weeks ago if no config file exists

    def save_token_cache(self):
        if self.token_cache.has_state_changed:
            with open(self.TOKEN_CACHE_FILE, "w") as f:
                f.write(self.token_cache.serialize())

    def update_access_token(self): # Delegated flow
        accounts = self.app_msal.get_accounts()
        if accounts:
            result = self.app_msal.acquire_token_silent(self.SCOPES, account=accounts[0])
            if result:
                self.save_token_cache()
                self.token = result.get("access_token")
                self.profile = create_request(self.token, "https://graph.microsoft.com/v1.0/me").json()
                return

        print("No cached token or silent acquisition failed. Need interactive login.")
        # For a webhook service, interactive login is problematic.
        # You'd typically acquire it once, or use app-only auth.
        # This part needs careful consideration for a production service.
        # For local testing, you can run an interactive login once.

        try:
            result = self.app_msal.acquire_token_interactive(
                scopes=self.SCOPES,
            )

            if "access_token" in result:
                self.save_token_cache()
                print("Access token acquired successfully.")
                self.token = result.get("access_token")
                self.profile = create_request(self.token, "https://graph.microsoft.com/v1.0/me").json()
            
        except msal.MSALClientError as e:
            print(f"MSALClientError during interactive login: {e}")
            print("Ensure you have a browser and are able to complete the interactive flow.")
            exit(1)
        except Exception as e:
            print(f"An unexpected error occurred during interactive login: {e}")
            exit(1)

    def get_new_chat_messages(self):

        # Get 1:1 and group chats (group chats not yet), expand to get the last message details
        # We sort by lastMessagePreview/createdDateTime descending and take top few to avoid missing rapid messages
        # and then process them in ascending order of time.
        graph_url_chats = "https://graph.microsoft.com/v1.0/me/chats?$expand=lastMessagePreview&$orderby=lastMessagePreview/createdDateTime desc"
        
        response = create_request(self.token, graph_url_chats)
        eligible_chats = []
        if response.status_code != 200:
            print(f"Error getting chats: {response.status_code} - {response.text}")
            return []

        chats = response.json().get('value', [])

        for chat in chats:
            if chat["chatType"] == "oneOnOne":
                if chat["lastMessagePreview"] is not None:
                    if not chat["lastMessagePreview"]["from"]["user"]["id"] == self.profile["id"]:
                        message = {
                            "sender_name": chat["lastMessagePreview"]["from"]["user"]["displayName"],
                            "sender_id": chat["lastMessagePreview"]["from"]["user"]["id"],
                            "text": chat["lastMessagePreview"]["body"]["content"],
                            "timestamp": format_date(chat["lastMessagePreview"]["createdDateTime"])
                        }
                        eligible_chats.append(message)

        chats = [msg for msg in eligible_chats if msg["timestamp"] > self.last_check]
        for chat in chats:
            chat["timestamp"] = chat["timestamp"].strftime('%a %d %b %Y, %I:%M%p')


        self.last_check = datetime.now(timezone.utc)
        config = {
            "last_check": self.last_check.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        }
        with open("config.json", "w") as f:
            json.dump(config, f, indent=4)

        return chats

