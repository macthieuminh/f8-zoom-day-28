const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const togglePlaylistBtn = $(".toggle-playlist-btn")
const playlist = $(".playlist")
const likeBtns = $$(".like-btn")

if (togglePlaylistBtn && playlist) {
    togglePlaylistBtn.addEventListener("click", () => {
        playlist.classList.toggle("hidden")
    })
}

const player = {
    _playlistElement: $(".playlist"),
    _togglePlayElement: $("#btn-toggle-play"),
    _audioElement: $("#audio"),
    _progressElement: $("#progress"),

    _nextBtn: $("#next-btn"),
    _prevBtn: $("#prev-btn"),
    _repeatBtn: $("#repeat-btn"),
    _shuffleBtn: $("#shuffle-btn"),

    _playingTitle: $("#js-playing-song-name"),
    _playingArtist: $("#js-playing-artist-name"),
    _playingThumb: $("#js-playing-thumb"),

    _isPlaying: false,
    _isShuffle: localStorage.getItem("shuffle") === "true",
    _isLoop: localStorage.getItem("loop") === "true",
    _rotationDeg: 0,

    _songs: [
        {
            id: 0,
            path: "./musics/Teddy Swims - Lose Control (The Village Sessions).mp3",
            name: "Lose Control",
            singer: "Teddy Swims",
            thumb: "./imges/teddy-swims.jpeg",
        },
        {
            id: 1,
            path: "./musics/Sickick - Rollin x Rollin x Rollin (Masked Wolf Remix).mp3",
            name: "Rollin",
            singer: "Sickick",
            thumb: "./imges/thumbnail_2.jpg",
        },
        {
            id: 2,
            path: "./musics/Sickick - Talking to the Moon (Bruno Mars Remix).mp3",
            name: "Talking to the Moon",
            singer: "Sickick",
            thumb: "./imges/thumbnail_3.jpg",
        },
        {
            id: 3,
            path: "./musics/Carpetman  Feel so cold.mp3",
            name: "Feel so cold",
            singer: "Carpetman",
            thumb: "./imges/thumbnail_4.jpg",
        },
    ],

    _currentIndex: 0,

    start() {
        if (this._isLoop) {
            this._repeatBtn.classList.add("active")
        } else {
            this._repeatBtn.classList.remove("active")
        }
        if (this._isShuffle) {
            this._shuffleBtn.classList.add("active")
        } else {
            this._shuffleBtn.classList.remove("active")
        }

        this._render()
        this._handlePlayback()

        this._togglePlayElement.onclick = this._togglePlay.bind(this)

        this._audioElement.onplay = () => {
            this._setPauseIcon()
            this._isPlaying = true
            this._audioElement.play()
            this._rotateThumb()
        }
        this._audioElement.onpause = () => {
            this._setPlayIcon()
            this._isPlaying = false
            this._audioElement.pause()
        }
        this._nextBtn.onclick = () => {
            this._handleRandomSong()
            this._nextSong()
        }
        this._prevBtn.onclick = () => {
            this._handleRandomSong()
            this._prevSong()
        }
        this._repeatBtn.onclick = () => {
            player._isLoop = !player._isLoop
            this._audioElement.loop = this._isLoop
            this._setLoopState()
        }
        this._shuffleBtn.onclick = () => {
            this._setShuffleState()
        }
        this._progressElement.onmousedown = (e) => {
            this._progressElement.seeking = true
        }
        this._progressElement.onmouseup = (e) => {
            const nextStep = +this._progressElement.value
            const seekTime = (this._audioElement.duration / 100) * nextStep

            this._audioElement.currentTime = seekTime
            this._progressElement.seeking = false
            this._progressElement.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${nextStep}%, var(--sub-color) ${nextStep}%, var(--sub-color) 100%)`
        }
        this._audioElement.onended = () => {
            this._nextSong()
        }
        this.pressSpacebar()
        this.pressRepeat()
        this.pressEsc()
        this.pressNumber()
        this.pressF()
    },
    _handlePlayback() {
        const currentSong = this._getCurrentSong()
        this._playingTitle.textContent = currentSong.name
        this._playingArtist.textContent = currentSong.singer
        this._playingThumb.src = currentSong.thumb
        this._audioElement.src = currentSong.path

        let currentDuration = $("#duration-current")
        let totalDuration = $("#duration-total")

        audio.addEventListener("loadedmetadata", () => {
            totalDuration.textContent = this._formatTime(audio.duration)
        })
        audio.addEventListener("timeupdate", () => {
            currentDuration.textContent = this._formatTime(audio.currentTime)
            if (!this._progressElement.seeking) {
                const percent =
                    (this._audioElement.currentTime / this._audioElement.duration) * 100
                this._progressElement.value = percent || 0
                progress.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percent}%, #f5f5f5 ${percent}%, #f5f5f5 100%)`
            }
        })

        this._audioElement.onload = () => {
            if (player._isPlaying) {
                this._audioElement.play()
            }
        }
    },
    _setProgress(progress) {
        this._progressElement.value = progress
    },
    _getCurrentSong() {
        return this._songs[this._currentIndex]
    },
    _nextSong() {
        this._currentIndex = (this._currentIndex + 1) % this._songs.length
        this._handlePlayback()
        this._render()
        this._audioElement.play()
    },
    _prevSong() {
        this._currentIndex =
            (this._currentIndex - 1 + this._songs.length) % this._songs.length
        this._handlePlayback()
        this._render()
        this._audioElement.play()
    },
    _setLoopState() {
        this._audioElement.loop = this._isLoop
        this._repeatBtn.classList.toggle("active", this._isLoop)
        localStorage.setItem("loop", this._isLoop)
    },
    _setShuffleState() {
        this._isShuffle = !this._isShuffle
        this._shuffleBtn.classList.toggle("active", this._isShuffle)
        this._render()
        localStorage.setItem("shuffle", this._isShuffle)
    },
    _getRandomIndex() {
        let randomIndex = null
        do {
            randomIndex = Math.floor(Math.random() * this._songs.length)
        } while (randomIndex === this._currentIndex)
        return randomIndex
    },
    _handleRandomSong() {
        if (this._isShuffle) {
            this._currentIndex = this._getRandomIndex()
        }
    },
    _togglePlay() {
        if (this._audioElement.paused) {
            player._isPlaying = true
            this._audioElement.play()
        } else {
            this._audioElement.pause()
        }
    },
    _setPlayIcon() {
        this._togglePlayElement.innerHTML = `
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `
    },
    _setPauseIcon() {
        this._togglePlayElement.innerHTML = `
            <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `
    },
    _formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    },
    _handleSongIndex() {
        this._currentIndex =
            (++this._currentIndex + this._songs.length) % this._songs.length
        this._handlePlayback()
        this._render()
        this._audioElement.play()
    },
    _render() {
        const html = this._songs
            .map((song, index) => {
                const isActive = index === this._currentIndex
                return `
                <div class="song-item ${isActive ? "active" : ""}" data-id="${song.id}">
                    <img
                        class="song-thumb"
                        src="${song.thumb}"
                        alt="thumb" />
                <div class="song-info">
                    <span class="song-title">${song.name}</span>
                    <span class="song-artist">${song.singer}</span>
                </div>
            </div>
            `
            })
            .join("")
        this._playlistElement.innerHTML = html
        this._chooseSong()
    },
    _chooseSong() {
        const songs = $$(".song-item")
        songs.forEach((song) => {
            song.addEventListener("click", (e) => {
                this._currentIndex = Number(song.dataset.id)
                this._handlePlayback()
                this._render()
                this._togglePlay()
            })
        })
    },
    pressSpacebar() {
        window.addEventListener("keydown", (e) => {
            e.preventDefault()
            if (e.code == "Space") {
                this._togglePlay()
            }
        })
    },
    pressRepeat() {
        window.addEventListener("keydown", (e) => {
            if (e.key == "r") {
                player._isLoop = !player._isLoop
                this._audioElement.loop = this._isLoop
                this._setLoopState()
            }
        })
    },
    pressEsc() {
        window.addEventListener("keydown", (e) => {
            if (e.key == 27 || e.key === "Escape") {
                playlist.classList.toggle("hidden")
            }
        })
    },
    pressF() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "f") {
                this._setShuffleState()
            }
        })
    },
    pressNumber() {
        document.addEventListener("keydown", (e) => {
            const songIndex = parseInt(e.key, 10) - 1

            if (songIndex < this._songs.length) {
                this._currentIndex = songIndex
                this._handlePlayback()
                this._render()
                this._audioElement.play()
                this._isPlaying = true
                this._setPauseIcon()
            }
        })
    },
    _rotateThumb() {
        const animate = () => {
            if (this._isPlaying) {
                this._rotationDeg = this._rotationDeg + 0.3
                this._playingThumb.style.transform = `rotate(${this._rotationDeg}deg)`
            }
            requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    },
}
player.start()
