const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const child_process = require('child_process');
const path = require('node:path')
const fs = require('fs')

let mainWindow = null

let createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
        },
        autoHideMenuBar: true
    })

    mainWindow.loadFile(path.join(__dirname,'views/index.html'))

    mainWindow.on('ready-to-show', () =>{
        mainWindow.show()
    })
}

function run_script(command, args, callback) {
    var child = child_process.spawn(command, args, {
        encoding: 'utf8',
        shell: true
    });
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
        dialog.showMessageBox({
            title: 'Title',
            type: 'warning',
            message: 'Error occured.\r\n' + error
        });
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data) => {
        //Here is the output
        data=data.toString();   
        console.log(data);      
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (data) => {
        // Return some data to the renderer process with the mainprocess-response ID
        mainWindow.webContents.send('mainprocess-response', data);
        //Here is the output from the command
        console.log(data);  
    });

    child.on('close', (code) => {
        //Here you can get the exit code of the script  
        switch (code) {
            case 0:
                dialog.showMessageBox({
                    title: 'Title',
                    type: 'info',
                    message: 'End process.\r\n'
                });
                break;
        }

    });
    if (typeof callback === 'function')
        callback();
}

function handleDownload(event, playlistName, selectedFolder, format){
    if(selectedFolder == null) selectedFolder = __dirname;
    if(format == "mp3"){
        run_script(`yt-dlp --embed-thumbnail --embed-metadata -x --audio-format mp3 -P ${selectedFolder} ${playlistName} `, [""], null);
    } else if (format == "mp4"){
         run_script(`yt-dlp --format mp4 -P ${selectedFolder} ${playlistName} `, [""], null);
    }
}

app.whenReady().then(() => {
    ipcMain.on('download', handleDownload)

   ipcMain.handle('selectFolder', async (event) => {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'] // Specify that only directories can be selected
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0]; // Return the path of the selected directory
      }
      return null; // Return null if the dialog was canceled
    });

    createWindow()

    app.on('activate', () => {
        if(BrowserWindow.getAllWindows.length === 0){
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
})