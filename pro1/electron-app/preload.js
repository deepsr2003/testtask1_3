const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  start: format => ipcRenderer.invoke('start-record', format),
  stop: () => ipcRenderer.invoke('stop-record'),
  onChunk: cb => ipcRenderer.on('audio-chunk', (_, chunk) => cb(chunk))
});
