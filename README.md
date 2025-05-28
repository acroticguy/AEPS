# Project LiDIA: Your Intelligent Productivity Assistant

LiDIA (Live Intelligent Desktop Assistant) is an AI-powered desktop application designed to streamline your daily workflow by intelligently managing Microsoft Teams notifications. LiDIA listens for incoming messages, processes them with advanced AI models, provides spoken summaries, and automatically suggests and organizes tasks based on your conversations.

## ✨ Features

*   **AI-Powered Task Creation:** LiDIA analyzes your Microsoft Teams messages using large language models (LLMs) to identify actionable tasks and automatically add them to your personalized task list.
*   **Voice Notifications & Summaries:** Receive real-time spoken summaries of important Teams messages, ensuring you stay informed without needing to constantly check your screen.
*   **Personalized Work Scope:** Configure LiDIA with your specific work responsibilities and preferred communication style for tailored assistance.
*   **Intuitive Dashboard:** A clean and organized dashboard to view, sort, and manage all your active tasks, with options for list, grid, and calendar views.
*   **Microsoft Teams Integration:** Seamlessly connects to your Microsoft Teams account to retrieve relevant chat messages.
*   **Secure Authentication:** Utilizes Microsoft (Azure AD) OAuth for secure user authentication and Supabase for persistent data storage.
*   **Cross-Platform Desktop Application:** Built with Electron, providing a native desktop experience on Windows, macOS, and Linux.

## 💻 Technologies Used

**Frontend (Electron, React, TypeScript):**
*   **Electron:** For building cross-platform desktop applications with web technologies.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Vite:** A fast build tool that provides an optimized development experience.
*   **Bootstrap:** Frontend component library for responsive design.
*   **Framer Motion:** For animations.
*   **React Router DOM:** For declarative routing in React applications.
*   **Supabase JS:** Client library for interacting with Supabase backend.
*   **MSAL Browser:** Microsoft Authentication Library for JavaScript (used in the frontend for OAuth).

**Backend (Python):**
*   **Google Generative AI (`google.genai`):** Interfacing with Google's Gemini LLMs for message analysis and task generation.
*   **gTTS (`gtts`):** Google Text-to-Speech library for generating spoken summaries.
*   **Pygame (`pygame`):** Used for playing audio (TTS output).
*   **MSAL Python (`msal`):** Microsoft Authentication Library for Python (used for Microsoft Graph API authentication).
*   **Supabase Python (`supabase`):** Python client library for interacting with Supabase database.
*   **Requests (`requests`):** HTTP library for making API calls (e.g., to Microsoft Graph).
*   **Pydantic (`pydantic`):** Data validation and settings management using Python type hints.
*   **python-dotenv (`dotenv`):** For loading environment variables from `.env` files.

**Database & Authentication:**
*   **Supabase:** An open-source Firebase alternative providing a PostgreSQL database, authentication, and real-time capabilities.
*   **Microsoft Graph API:** For accessing Microsoft Teams chat messages.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js (LTS version):** [Download from nodejs.org](https://nodejs.org/)
*   **npm (Node Package Manager):** Comes with Node.js.
*   **Python 3.9+:** [Download from python.org](https://www.python.org/downloads/)
    *   Ensure `py` command is available (Windows) or `python3` (macOS/Linux).
*   **Microsoft Azure Account:** Required for setting up an Azure AD application for Microsoft Graph API access.
*   **Supabase Project:** Required for database and authentication services.

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url> "Project Lydia"
cd "Project Lydia/LiDIA Frontend"
```

### 2. Configure Environment Variables

LiDIA requires several API keys and credentials to function. Create `.env` files in the specified locations:

**a) `Project Lydia/LiDIA Frontend/.env` (for Frontend/Electron):**

```env
# Supabase Credentials
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"

# Microsoft Azure AD App Credentials (if not using MSAL-Node for direct handling)
# Generally, these are handled by Supabase OAuth flow, but included for completeness if needed.
# VITE_MS_CLIENT_ID="YOUR_MS_CLIENT_ID"
# VITE_MS_TENANT_ID="YOUR_MS_TENANT_ID"
```
**Note:** For the frontend, `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` are read by Vite. The Microsoft authentication is handled by Supabase's OAuth provider configured on their platform.

**b) `Project Lydia/LiDIA Frontend/python/.env` (for Python Backend):**

```env
# Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Microsoft Azure AD App Credentials
CLIENT_ID="YOUR_AZURE_AD_APPLICATION_CLIENT_ID"

# Supabase Credentials (Python client uses these for direct database interaction)
SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" # Use Service Role Key for backend operations with RLS if needed, or Anon Key if RLS is configured for user_id.

# Microsoft Tenant ID (as seen in teams_handler.py Authority URL)
# AUTHORITY="https://login.microsoftonline.com/YOUR_TENANT_ID" # This tenant ID is hardcoded in teams_handler.py, consider making it configurable if your setup varies.
```

**How to get these keys:**

*   **Supabase:**
    1.  Create a new project on [Supabase](https://supabase.com/).
    2.  Navigate to `Project Settings` -> `API`. You'll find your `URL` and `anon public` key.
    3.  For the `SUPABASE_KEY` in the Python `.env`, you might need the `service_role` key (also found in `API` settings) if your backend Python scripts need elevated permissions to insert/update tasks, bypassing Row Level Security (RLS) policies. Otherwise, the anon key is sufficient if RLS is set up for `user_id`.
    4.  Set up the `profiles` and `tasks` tables as per the application's schema (refer to `supabase_functions.py` for column names like `display_name`, `email`, `lidia_instructions`, `work_scope` for `profiles`, and `task_name`, `description`, `due_date`, `priority`, `chat_origin_id`, `is_complete`, `user_id` for `tasks`).
    5.  Enable Microsoft (Azure AD) as an OAuth provider in Supabase's `Authentication` -> `Providers` settings. You'll need the Client ID and Client Secret from your Azure AD app.

*   **Google Gemini API Key:**
    1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    2.  Create a new API key.

*   **Microsoft Azure AD Application Client ID:**
    1.  Go to the [Azure portal](https://portal.azure.com/).
    2.  Search for "App registrations" and create a "New registration".
    3.  **Name:** e.g., "LiDIA Teams Integration"
    4.  **Supported account types:** "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"
    5.  **Redirect URI:** Select "Web" and add `http://localhost:5173/login`. This URL must match the `redirectTo` option in `Login.tsx`.
    6.  After registration, note down the "Application (client) ID".
    7.  Go to "Authentication" and ensure "Implicit grant and hybrid flows" is *not* enabled (Supabase handles the OAuth flow, not direct implicit grant).
    8.  Go to "API permissions", click "Add a permission", then "Microsoft Graph". Add "Delegated permissions":
        *   `Chat.Read`
        *   `User.Read`
        *   `offline_access` (important for refresh tokens)
        *   `email`
        *   `profile`
    9.  Grant admin consent for the added permissions if you are an admin.

### 3. Install Dependencies

**a) Frontend (Node.js/npm):**

Navigate to the `LiDIA Frontend` directory:
```bash
cd "Project Lydia/LiDIA Frontend"
npm install
```

**b) Python Backend (pip):**

Navigate to the `python` directory within `LiDIA Frontend`:
```bash
cd "Project Lydia/LiDIA Frontend/python"
pip install -r requirements.txt
```
If `requirements.txt` does not exist, create it manually and then run `pip install -r requirements.txt`:
```
# Project LiDIA Python Dependencies
google-generativeai
gTTS
pygame
python-dotenv
supabase
msal
requests
pydantic
```

## ▶️ Usage

### Development Mode

To run LiDIA in development mode (with hot-reloading for the frontend and Python script spawning from Electron):

Navigate to the `LiDIA Frontend` directory:
```bash
cd "Project Lydia/LiDIA Frontend"
npm run dev
```
This command will start the Vite development server for the frontend and then launch the Electron application. The Electron app will connect to the Vite server. Python scripts will be spawned by the Electron main process.

### Building for Production

To build the executable application:

Navigate to the `LiDIA Frontend` directory:
```bash
cd "Project Lydia/LiDIA Frontend"
npm run build
```
This will compile the frontend and package the Electron application. The output will typically be in an `out/` or `dist/` directory, depending on `electron-builder` configuration.

After building, you can run the application directly from the generated executable:
```bash
npm run start
```

### Using the Application

1.  **Login:** Upon launching LiDIA, you will be prompted to sign in with your Microsoft account. LiDIA uses this to authenticate with Supabase and to access your Teams data.
2.  **Questionnaire:** If it's your first time logging in or your profile is incomplete, you'll be guided through a short questionnaire to set up your LiDIA preferences (e.g., your name, work scope, AI assistant's personality).
3.  **Dashboard:** Once logged in and configured, you will land on the Dashboard.
4.  **Run LiDIA:** Click the "Run LiDIA" button (visible if "Developer Mode" is enabled, or always visible). This will start the Python backend process which connects to Microsoft Teams and Supabase.
5.  **Monitor:** LiDIA will periodically check for new Microsoft Teams chat messages relevant to you. When new messages arrive, LiDIA will summarize them, potentially create new tasks, and provide audio notifications.
6.  **Task Management:** Your active tasks, whether automatically created by LiDIA or manually added, will appear on the dashboard. You can search, sort, and mark tasks as complete.

## 📂 Project Structure

```
.
├── .gitignore
├── Project Lydia
│   ├── LiDIA Frontend
│   │   ├── .gitignore              # Gitignore for frontend specific files
│   │   ├── README.md               # Original React/Vite README (can be removed/integrated)
│   │   ├── electron.vite.config.ts # Electron-Vite specific configuration
│   │   ├── eslint.config.js        # ESLint configuration
│   │   ├── package-lock.json       # npm lock file
│   │   ├── package.json            # Frontend (Node.js/React/Electron) dependencies and scripts
│   │   ├── public                  # Static assets for Vite
│   │   ├── python                  # Python backend source code
│   │   │   ├── .env                # Environment variables for Python backend (SUPABASE_URL, GEMINI_API_KEY, CLIENT_ID etc.)
│   │   │   ├── config.json         # Stores last check timestamp for Teams messages
│   │   │   ├── lidia.py            # Handles LLM communication, TTS, task validation
│   │   │   ├── lidia_tools.py      # Utility functions (date formatting, TTS, Pydantic models)
│   │   │   ├── mainjamin.py        # Main entry point for the Python backend (spawns from Electron)
│   │   │   ├── supabase_functions.py # Handles Supabase database interactions (auth, tasks, user profiles)
│   │   │   └── teams_handler.py    # Manages Microsoft Teams API interactions (auth, fetching messages)
│   │   ├── src                     # Frontend (React/TypeScript) source code
│   │   │   ├── App.css
│   │   │   ├── App.tsx             # Main React application component
│   │   │   ├── Message.tsx         # Example component
│   │   │   ├── index.css
│   │   │   ├── main                # Electron Main Process code
│   │   │   │   └── index.ts        # Electron main process entry point, handles IPC with Python
│   │   │   ├── preload             # Electron Preload script
│   │   │   │   └── index.ts        # Exposes Electron APIs to the renderer process
│   │   │   ├── renderer            # React Renderer Process code
│   │   │   │   ├── index.html      # HTML entry point for the renderer
│   │   │   │   └── src
│   │   │   │       ├── assets      # Images, SVGs
│   │   │   │       ├── components  # Reusable React components (e.g., ProtectedRoute)
│   │   │   │       ├── main.tsx    # React application entry point, Supabase client setup, routing
│   │   │   │       └── pages       # React page components (Login, Dashboard, Questionnaire, Legal)
│   │   │   └── vite-env.d.ts       # Vite environment type definitions
│   │   ├── tsconfig.app.json       # TypeScript configuration for application code
│   │   ├── tsconfig.json           # Base TypeScript configuration
│   │   ├── tsconfig.node.json      # TypeScript configuration for Node.js environment
│   │   └── vite.config.ts          # Vite specific configuration
│   └── __pycache__                 # Python bytecode cache (ignored by git)
└── README.md                       # This README file
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, bug fixes, or new features, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
