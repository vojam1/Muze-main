let selectFolderBtn = document.getElementById("selectFolder")
let downloadBtn = document.getElementById("download")
let playlistInput = document.getElementById("playlistInput")

let selectedFolder = null

selectFolderBtn.addEventListener('click', async () =>{
    selectedFolder = await window.electronAPI.selectFolder()
})

downloadBtn.addEventListener('click', () => {
    let format = document.querySelector("input[name=format]:checked").value
    window.electronAPI.download(playlistInput.value, selectedFolder, format)
}) 

