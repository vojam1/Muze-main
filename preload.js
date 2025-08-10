const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  download: (playlistName, selectedFolder, format) => ipcRenderer.send('download', playlistName, selectedFolder, format),
  selectFolder: () => ipcRenderer.invoke('selectFolder'),
  selectSongs: () => ipcRenderer.invoke('selectSongs')
})