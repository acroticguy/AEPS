import type { IpcRendererEvent } from "electron";

const { contextBridge, ipcRenderer } = require('electron');
// import { contextBridge, ipcRenderer } from 'electron';

// Expose a limited set of APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: How to invoke a function in the main process
  runPythonScript: (args: string[]) => ipcRenderer.invoke('run-python-script', args),
  stopPythonScript: () => ipcRenderer.invoke('stop-python-script'),

  onPythonStdout: (callback: (event: IpcRendererEvent, data: string) => void) => {
    ipcRenderer.on('python-stdout-data', callback);
    // Return an unsubscribe function
    return () => ipcRenderer.removeListener('python-stdout-data', callback);
  },
  removePythonStdoutListener: () => ipcRenderer.removeAllListeners('python-stdout-data'),

  onPythonStderr: (callback: (event: IpcRendererEvent, data: string) => void) => {
    ipcRenderer.on('python-stderr-data', callback);
    return () => ipcRenderer.removeListener('python-stderr-data', callback);
  },
  removePythonStderrListener: () => ipcRenderer.removeAllListeners('python-stderr-data'),

  onPythonScriptComplete: (callback: (event: IpcRendererEvent, code: number, stderr: string) => void) => {
    ipcRenderer.on('python-script-complete', callback);
    return () => ipcRenderer.removeListener('python-script-complete', callback);
  },
  removePythonScriptCompleteListener: () => ipcRenderer.removeAllListeners('python-script-complete'),
  // Add other APIs as needed (e.g., save file dialog, open external links)
});

// Define the type for 'electronAPI' to be used in your React app
declare global {
  interface Window {
    electronAPI: {
      runPythonScript: (args: string[]) => Promise<{ stdout: string; stderr: string; returnCode: number }>;
      stopPythonScript: () => Promise<void>;
      onPythonStdout: (callback: (event: IpcRendererEvent, data: string) => void) => () => void;
      removePythonStdoutListener: () => void;
      onPythonStderr: (callback: (event: IpcRendererEvent, data: string) => void) => () => void;
      removePythonStderrListener: () => void;
      onPythonScriptComplete: (callback: (event: IpcRendererEvent, code: number, stderr: string) => void) => () => void;
      removePythonScriptCompleteListener: () => void;
    };
  }
}