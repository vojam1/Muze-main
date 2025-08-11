const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const child_process = require('child_process');
const path = require('node:path')
const fs = require('fs').promises
var jsmediatags = require("jsmediatags");


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
        mainWindow.webContents.send('error-response', data);
        //Here is the output from the command
        console.log(data);  
    });

    child.on('close', (code) => {
        //Here you can get the exit code of the script  
        switch (code) {
            case 0:
                dialog.showMessageBox({
                    title: 'Download finished',
                    type: 'info',
                    message: 'Downloaded successfully!\r\n'
                });
                mainWindow.webContents.send('download-finished');
                break;
        }

    });
    if (typeof callback === 'function')
        callback();
}

function handleDownload(event, playlistName, selectedFolder, format){
    if(selectedFolder == null) selectedFolder = __dirname;
    if(format == "mp3"){
        run_script(`yt-dlp --embed-thumbnail --embed-metadata -x --audio-format mp3 -P "${selectedFolder}" ${playlistName} `, [""], null);
    } else if (format == "mp4"){
         run_script(`yt-dlp --embed-thumbnail --embed-metadata --format mp4 -P "${selectedFolder}" ${playlistName} `, [""], null);
    }
}


app.whenReady().then(() => {
    ipcMain.on('download', handleDownload)

    ipcMain.handle('readMetadata', (event, file) => {
        return new Promise((resolve, reject) => {
        jsmediatags.read(file, {
        onSuccess: tag => {
            const picture = tag.tags.picture;
            if (picture) {
                let base64String = "";
                const byteArray = picture.data;
                const len = byteArray.length;
                for (let i = 0; i < len; i++) {
                    base64String += String.fromCharCode(byteArray[i]);
                }
                const base64 = btoa(base64String);
                const imageUrl = `data:${picture.format};base64,${base64}`;
                
                resolve({
                    artist: tag.tags.artist,
                    title: tag.tags.title,
                    picture: imageUrl // Send this back to renderer
                });
            } else {
                resolve({
                    artist: tag.tags.artist,
                    title: tag.tags.title,
                    picture: null
                });
            }
        },
        onError: error => {
            reject(error);
        }
    });
    });
    });

    ipcMain.handle('selectFolder', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'] // Specify that only directories can be selected
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0]; 
        }
        return null; 
    });


    ipcMain.handle('selectSongs', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        let songArray = [];

        if(!result.canceled && result.filePaths.length > 0){
            try {
                const files = await fs.readdir(result.filePaths[0]);
                songArray = files.map(file => result.filePaths[0] + '/' + file);
            } catch (err) {
                console.error('Error reading directory:', err);
            }
        }
        return songArray; 
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