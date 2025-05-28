"use strict";
const electron = require("electron");
const path = require("path");
require("url");
const child_process = require("child_process");
let mainWindow;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
      // Keep webSecurity true for custom protocols
    }
  });
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    console.log("Development mode: Loading from Vite dev server");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("app://./index.html");
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
let pythonProcess = null;
electron.ipcMain.handle("run-python-script", async (_event, args) => {
  if (pythonProcess) {
    _event.sender.send("python-stderr-data", "A Python script is already running. Please stop it first.");
    return { success: false, message: "Script already running" };
  }
  const pythonScriptPath = path.join(electron.app.getAppPath(), "python", "mainjamin.py");
  try {
    pythonProcess = child_process.spawn("py", [pythonScriptPath, ...args], {
      env: { ...process.env, PYTHONIOENCODING: "utf8", PYTHONUNBUFFERED: "1" }
    });
    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python stdout: ${data.toString()}`);
      _event.sender.send("python-stdout-data", data.toString());
    });
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python stderr: ${data.toString()}`);
      _event.sender.send("python-stderr-data", data.toString());
    });
    pythonProcess.on("close", (code, signal) => {
      console.log(`Python script exited with code ${code} and signal ${signal}`);
      _event.sender.send("python-script-complete", code, "Script finished.");
      pythonProcess = null;
    });
    pythonProcess.on("error", (err) => {
      console.error("Failed to start Python script:", err);
      _event.sender.send("python-stderr-data", `Failed to start script: ${err.message}`);
      _event.sender.send("python-script-complete", 1, `Failed to start script: ${err.message}`);
      pythonProcess = null;
    });
    return { success: true, message: "Python script started" };
  } catch (error) {
    console.error("Error spawning Python process:", error);
    _event.sender.send("python-stderr-data", `Error spawning Python process: ${error.message}`);
    _event.sender.send("python-script-complete", 1, `Error spawning Python process: ${error.message}`);
    pythonProcess = null;
    return { success: false, message: `Failed to start script: ${error.message}` };
  }
});
electron.ipcMain.handle("stop-python-script", async (event) => {
  if (pythonProcess) {
    console.log("Attempting to kill Python process...");
    const killed = pythonProcess.kill("SIGTERM");
    pythonProcess = null;
    if (killed) {
      console.log("Python process termination signal sent.");
      return { success: true, message: "Python script termination signal sent." };
    } else {
      console.warn("Failed to send termination signal to Python process.");
      return { success: false, message: "Failed to send termination signal." };
    }
  } else {
    console.log("No Python script is currently running.");
    return { success: false, message: "No Python script is running." };
  }
});
electron.app.on("will-quit", () => {
  if (pythonProcess) {
    console.log("App quitting, killing Python process...");
    pythonProcess.kill("SIGTERM");
    pythonProcess = null;
  }
});
