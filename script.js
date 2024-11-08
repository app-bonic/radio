const stations = [];
let playableStations = [];
let currentStationIndex = 0;

async function fetchStations() {
    const response = await fetch('https://app-bonic.github.io/radio/lista/HR.m3u');
    const data = await response.text();
    const lines = data.split('\n');

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXTINF")) {
            const name = lines[i].split(",")[1];
            const url = lines[i + 1];
            stations.push({ name, url });
        }
    }

    await filterPlayableStations();
    if (playableStations.length > 0) {
        loadStation(0);  // Pokreni prvu podržanu stanicu
    } else {
        alert("Nema podržanih radio stanica za reprodukciju.");
    }
}

// Funkcija za filtriranje stanica pomoću `fetch` provjere
async function filterPlayableStations() {
    const taskProgress = document.getElementById('task-progress');
    const totalStations = stations.length;

    for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        
        try {
            const response = await fetch(station.url, { method: 'HEAD' });
            if (response.ok && response.headers.get("content-type")?.includes("audio")) {
                playableStations.push(station);
            }
        } catch (error) {
            console.log(`Stanica ${station.name} nije podržana i neće biti prikazana.`);
        }

        // Ažuriraj task bar
        const progress = ((i + 1) / totalStations) * 100;
        taskProgress.style.width = `${progress}%`;
    }

    // Sakrij task bar nakon završetka
    document.getElementById('loading-container').style.display = 'none';

    displayStations(playableStations);  // Prikaz samo podržanih stanica
}

function displayStations(stationsToDisplay) {
    const stationsList = document.getElementById('stations');
    stationsList.innerHTML = '';
    stationsToDisplay.forEach((station, index) => {
        const li = document.createElement('li');
        li.textContent = station.name;
        li.onclick = () => loadStation(playableStations.indexOf(station));
        stationsList.appendChild(li);
    });
}

function loadStation(index) {
    const audioPlayer = document.getElementById('audio-player');
    audioPlayer.src = playableStations[index].url;
    document.getElementById('now-playing').textContent = `: ${playableStations[index].name}`;
    audioPlayer.play().catch(error => console.error("Greška u reprodukciji:", error));
    currentStationIndex = index;
}

function nextStation() {
    currentStationIndex = (currentStationIndex + 1) % playableStations.length;
    loadStation(currentStationIndex);
}

function previousStation() {
    currentStationIndex = (currentStationIndex - 1 + playableStations.length) % playableStations.length;
    loadStation(currentStationIndex);
}

function filterStations() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredStations = playableStations.filter(station => station.name.toLowerCase().includes(searchTerm));
    displayStations(filteredStations);
}

window.onload = fetchStations;
