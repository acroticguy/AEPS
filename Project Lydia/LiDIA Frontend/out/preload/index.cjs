"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Example: How to invoke a function in the main process
  runPythonScript: (args) => ipcRenderer.invoke("run-python-script", args),
  stopPythonScript: () => ipcRenderer.invoke("stop-python-script"),
  onPythonStdout: (callback) => {
    ipcRenderer.on("python-stdout-data", callback);
    return () => ipcRenderer.removeListener("python-stdout-data", callback);
  },
  removePythonStdoutListener: () => ipcRenderer.removeAllListeners("python-stdout-data"),
  onPythonStderr: (callback) => {
    ipcRenderer.on("python-stderr-data", callback);
    return () => ipcRenderer.removeListener("python-stderr-data", callback);
  },
  removePythonStderrListener: () => ipcRenderer.removeAllListeners("python-stderr-data"),
  onPythonScriptComplete: (callback) => {
    ipcRenderer.on("python-script-complete", callback);
    return () => ipcRenderer.removeListener("python-script-complete", callback);
  },
  removePythonScriptCompleteListener: () => ipcRenderer.removeAllListeners("python-script-complete")
  // Add other APIs as needed (e.g., save file dialog, open external links)
});
