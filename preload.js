const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  download: (playlistName, selectedFolder, format) => ipcRenderer.send('download', playlistName, selectedFolder, format),
  selectFolder: () => ipcRenderer.invoke('selectFolder'),
  selectSongs: () => ipcRenderer.invoke('selectSongs'),
  readMetadata: (file) => ipcRenderer.invoke('readMetadata', file)
})

ipcRenderer.on('download-finished', (event) => {
  const element = document.getElementById('downloadStatus');
  if (element) {
    element.innerHTML = "";
  }
});

ipcRenderer.on('error-response', (event, data) => {
  const element = document.getElementById('downloadStatus');
  if (element) {
    element.style.color = 'red';
    element.innerHTML = "Error! Please enter a valid youtube video URL.";
  }
});