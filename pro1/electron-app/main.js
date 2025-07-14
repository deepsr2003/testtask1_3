const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
let win, recorder;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('start-record', (_, format) => {
  const exePath = path.join(__dirname, 'resources', 'SystemCaptureCLI');
  recorder = spawn(exePath, ['--format', format]);
  recorder.stdout.on('data', chunk => {
    win.webContents.send('audio-chunk', chunk);
  });
  recorder.stderr.on('data', data => console.error(data.toString()));
  recorder.on('close', code => console.log(`recorder exited ${code}`));
});

ipcMain.handle('stop-record', () => {
  if (recorder) recorder.kill();
});
