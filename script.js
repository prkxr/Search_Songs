import { CLIENT_ID, CLIENT_SECRET } from './config.js';

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const BASE_URL = "https://api.spotify.com/v1";
let accessToken = "";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const songsContainer = document.getElementById("songs-container");
const playerImg = document.getElementById("player-img");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const audioPlayer = document.getElementById("audio-player");

async function getAccessToken() {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`),
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  accessToken = data.access_token;
}

async function searchSongs(query) {
  const response = await fetch(`${BASE_URL}/search?q=${query}&type=track&limit=20`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  renderSongs(data.tracks.items);
}

async function getDeezerPreview(trackName, artistName) {
  const deezerURL = `https://api.deezer.com/search?q=${encodeURIComponent(trackName + " " + artistName)}`;

  try {
    
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(deezerURL)}`);
    const data = await res.json();

    const json = JSON.parse(data.contents);

    if (json.data && json.data.length > 0 && json.data[0].preview) {
      return json.data[0].preview;
    }
  } catch (error) {
    console.error("Deezer API error:", error);
  }
  return null;
}


async function renderSongs(tracks) {
  songsContainer.innerHTML = "";

  for (const track of tracks) {
    const song = document.createElement("div");
    song.classList.add("song");

    song.innerHTML = `
      <img src="${track.album.images[0]?.url}" alt="${track.name}">
      <h3>${track.name}</h3>
      <p>${track.artists.map(artist => artist.name).join(", ")}</p>
    `;

    song.addEventListener("click", async () => {
      playerImg.src = track.album.images[0]?.url;
      playerTitle.textContent = track.name;
      playerArtist.textContent = track.artists.map(artist => artist.name).join(", ");

      let previewUrl = track.preview_url;

     
      if (!previewUrl) {
        previewUrl = await getDeezerPreview(track.name, track.artists[0].name);
      }

      if (previewUrl) {
        audioPlayer.src = previewUrl;
        await audioPlayer.play();
      } else {
        audioPlayer.src = "";
        alert("⚠️ Sorry, no preview available for this track!");
      }
    });

    songsContainer.appendChild(song);
  }

  if (!songsContainer.hasChildNodes()) {
    songsContainer.innerHTML = `<p style="color: #aaa; text-align: center;">No songs with previews found 😢</p>`;
  }
}



searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) {
    searchSongs(query);
  }
});

getAccessToken();

