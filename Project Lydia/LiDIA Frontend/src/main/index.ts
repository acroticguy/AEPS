import { app, BrowserWindow, ipcMain, protocol } from 'electron'; // Add protocol
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';

// Get __dirname equivalent in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null;

function createWindow() {
mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        preload: path.join(__dirname, '../preload/index.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true, // Keep webSecurity true for custom protocols
    },
});

  if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:5173');
      console.log('Development mode: Loading from Vite dev server');
      mainWindow.webContents.openDevTools();
  } else {
      // In production, load using the custom 'app' protocol
      mainWindow.loadURL('app://./index.html'); // Load index.html via custom protocol
  }

  mainWindow.on('closed', () => {
      mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let pythonProcess: ChildProcessWithoutNullStreams | null = null;

// IPC listener for running Python script
ipcMain.handle('run-python-script', async (_event, args: string[]) => {
  if (pythonProcess) {
    _event.sender.send('python-stderr-data', 'A Python script is already running. Please stop it first.');
    return { success: false, message: 'Script already running' };
  }
  const pythonScriptPath = path.join(app.getAppPath(), 'python', 'mainjamin.py'); // Adjust path to your Python script

  try {
    pythonProcess = spawn('py', [pythonScriptPath, ...args], {
      env: { ...process.env, PYTHONIOENCODING: 'utf8', PYTHONUNBUFFERED: '1' }
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data.toString()}`);
      _event.sender.send('python-stdout-data', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data.toString()}`);
      _event.sender.send('python-stderr-data', data.toString());
    });

    pythonProcess.on('close', (code, signal) => {
      console.log(`Python script exited with code ${code} and signal ${signal}`);
      _event.sender.send('python-script-complete', code, 'Script finished.');
      pythonProcess = null;
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python script:', err);
      _event.sender.send('python-stderr-data', `Failed to start script: ${err.message}`);
      _event.sender.send('python-script-complete', 1, `Failed to start script: ${err.message}`);
      pythonProcess = null;
    });

    return { success: true, message: 'Python script started' };
    } catch (error: any) {
      console.error('Error spawning Python process:', error);
      _event.sender.send('python-stderr-data', `Error spawning Python process: ${error.message}`);
      _event.sender.send('python-script-complete', 1, `Error spawning Python process: ${error.message}`);
      pythonProcess = null;
      return { success: false, message: `Failed to start script: ${error.message}` };
    }
});

ipcMain.handle('stop-python-script', async (event) => {
  if (pythonProcess) {
    console.log('Attempting to kill Python process...');
    const killed = pythonProcess.kill('SIGTERM');
    pythonProcess = null;
    if (killed) {
      console.log('Python process termination signal sent.');
      return { success: true, message: 'Python script termination signal sent.' };
    } else {
      console.warn('Failed to send termination signal to Python process.');
      return { success: false, message: 'Failed to send termination signal.' };
    }
  } else {
    console.log('No Python script is currently running.');
    return { success: false, message: 'No Python script is running.' };
  }
});

app.on('will-quit', () => {
  if (pythonProcess) {
    console.log('App quitting, killing Python process...');
    pythonProcess.kill('SIGTERM');
    pythonProcess = null;
  }
});