let selectFolderBtn = document.getElementById("selectFolder")
let downloadBtn = document.getElementById("download")
let playlistInput = document.getElementById("playlistInput")

let selectedFolder = null

selectFolderBtn.addEventListener('click', async () =>{
    selectedFolder = await window.electronAPI.selectFolder()
})

downloadBtn.addEventListener('click', () => {
    let format = document.querySelector("input[name=format]:checked").value
    document.getElementById("downloadStatus").innerHTML = "Downloading in progress..."
    document.getElementById("downloadStatus").style.color = "green"
    let playlistName = playlistInput.value;
    if(playlistName.includes("&list")){
        playlistName = playlistName.split("&list")[0]
        console.log(playlistName)
    }
    window.electronAPI.download(playlistName, selectedFolder, format)
}) 

