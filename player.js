const selectButton = document.getElementById('selectSongs');
const playerContainer = document.getElementById('playerContainer');

let audio, mp3Files, currentIndex = 0;

let selectedSongs = [];
let songMetadata = [];

// This function gets called after you already have mp3Files from folder selection
function initializePlayer(files) {
    mp3Files = files;
    playerContainer.innerHTML = `
        <div class="thumbnail" id="thumbnail">Thumbnail</div>
        <div id="songTitle">Song Name</div>
        <input type="range" id="seekBar" value="0">
        <div class="controls">
            <button id="prevBtn">⏮</button>
            <button id="playPauseBtn">▶</button>
            <button id="nextBtn">⏭</button>
        </div>
        <input type="range" id="volumeBar" min="0" max="1" step="0.01" value="0.5">
    `;

    audio = new Audio();
    loadSong(currentIndex);

    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('prevBtn').addEventListener('click', prevSong);
    document.getElementById('nextBtn').addEventListener('click', nextSong);
    document.getElementById('seekBar').addEventListener('input', seekAudio);
    document.getElementById('volumeBar').addEventListener('input', e => audio.volume = e.target.value);

    audio.addEventListener('timeupdate', () => {
        document.getElementById('seekBar').value = audio.currentTime;
    });
    audio.addEventListener('loadedmetadata', () => {
        document.getElementById('seekBar').max = audio.duration;
    });
    audio.addEventListener('ended', nextSong);
}

function loadSong(index) {
    audio.src = mp3Files[index];
    let metadata = songMetadata[index];

    document.getElementById('songTitle').textContent = metadata.title;

    if (metadata.picture) {
    document.getElementById('thumbnail').innerHTML =
        `<img src="${metadata.picture}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        document.getElementById('thumbnail').textContent = "No Artwork";
    }

    audio.play();
    document.getElementById('playPauseBtn').textContent = '⏸';
}

function togglePlayPause() {
    if (audio.paused) {
        audio.play();
        document.getElementById('playPauseBtn').textContent = '⏸';
    } else {
        audio.pause();
        document.getElementById('playPauseBtn').textContent = '▶';
    }
}

function prevSong() {
    currentIndex = (currentIndex - 1 + mp3Files.length) % mp3Files.length;
    loadSong(currentIndex);
}

function nextSong() {
    currentIndex = (currentIndex + 1) % mp3Files.length;
    loadSong(currentIndex);
}

function seekAudio() {
    audio.currentTime = document.getElementById('seekBar').value;
}

// Simulated click handler — replace this with your existing folder selection logic
selectButton.addEventListener('click', async () => {
    // Replace this with your actual logic that returns a FileList or array of File objects
    selectedSongs = await window.electronAPI.selectSongs()
    for(const file of selectedSongs){
        let metadata = await window.electronAPI.readMetadata(file);
        songMetadata.push(metadata)
    }
    initializePlayer(selectedSongs); // Replace with your actual file list
});

