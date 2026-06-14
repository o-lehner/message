document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const timeline = document.querySelector('.timeline');
    const progress = document.querySelector('.progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    
    const pinScreen = document.getElementById('pin-screen');
    const selectionScreen = document.getElementById('selection-screen');
    const mainContent = document.getElementById('main-content');
    const selectionBtns = document.querySelectorAll('.selection-btn');
    const changeVersionBtn = document.getElementById('change-version-btn');
    const skipBackBtn = document.getElementById('skip-back-btn');
    const skipForwardBtn = document.getElementById('skip-forward-btn');
    const pinDots = document.querySelectorAll('.dot');
    const keyboardBtns = document.querySelectorAll('.pin-btn');
    const deleteBtn = document.getElementById('pin-delete');
    const hintBtn = document.getElementById('pin-hint-btn');
    const hintBox = document.getElementById('hint-box');
    const hintClose = document.getElementById('hint-close');
    const pinDotsContainer = document.getElementById('pin-dots');

    // Kod PIN jest zakodowany (Base64), aby nie był widoczny jako tekst
    const TARGET = "NjIxNzE0"; 
    let enteredPin = "";

    const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

    // --- Flower Generation ---
    function generateFlowers(avoidElements = []) {
        container.innerHTML = '';
        const isMobile = window.innerWidth < 600;
        const numberOfFlowers = isMobile ? 35 : 55;
        const placedFlowers = [];
        const flowerSize = 80; 
        const padding = 10; 
        const playerPadding = 30;

        const avoidRects = avoidElements.map(el => el.getBoundingClientRect());

        for (let i = 0; i < numberOfFlowers; i++) {
            let x, y, overlap;
            let attempts = 0;

            do {
                overlap = false;
                x = Math.random() * (window.innerWidth - flowerSize);
                y = Math.random() * (window.innerHeight - flowerSize);
                attempts++;

                const flowerRect = {
                    left: x - playerPadding,
                    right: x + flowerSize + playerPadding,
                    top: y - playerPadding,
                    bottom: y + flowerSize + playerPadding
                };

                for (const avoidRect of avoidRects) {
                    if (!(flowerRect.right < avoidRect.left || 
                          flowerRect.left > avoidRect.right || 
                          flowerRect.bottom < avoidRect.top || 
                          flowerRect.top > avoidRect.bottom)) {
                        overlap = true;
                        break;
                    }
                }

                if (overlap) continue;

                for (const f of placedFlowers) {
                    if (!(x + flowerSize + padding < f.x || 
                          x > f.x + flowerSize + padding || 
                          y + flowerSize + padding < f.y || 
                          y > f.y + flowerSize + padding)) {
                        overlap = true;
                        break;
                    }
                }
            } while (overlap && attempts < 250);

            if (!overlap) {
                placedFlowers.push({ x, y });
                const flower = document.createElement('div');
                flower.classList.add('flower');
                flower.style.left = `${x}px`;
                flower.style.top = `${y}px`;
                flower.style.transform = `scale(${Math.random() * 0.4 + 0.6}) rotate(${Math.random() * 360}deg)`;
                container.appendChild(flower);
            }
        }
    }

    generateFlowers([document.querySelector('.pin-keyboard'), document.querySelector('.pin-header'), pinDotsContainer]);

    // --- PIN Logic ---
    function updateDots() {
        pinDots.forEach((dot, index) => {
            if (index < enteredPin.length) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function checkPin() {
        if (btoa(enteredPin) === TARGET) {
            pinScreen.classList.add('fade-out');
            setTimeout(() => {
                pinScreen.style.display = 'none';
                selectionScreen.classList.remove('hidden');
                selectionScreen.classList.add('fade-in');
                setTimeout(() => {
                    generateFlowers([
                        document.querySelector('.selection-header'),
                        document.querySelector('.selection-options'),
                        document.querySelector('.selection-footer')
                    ]);
                }, 50);
            }, 500);
        } else {
            pinDotsContainer.classList.add('error');
            setTimeout(() => {
                pinDotsContainer.classList.remove('error');
                enteredPin = "";
                updateDots();
            }, 500);
        }
    }

    // --- Selection Logic ---
    const _0x4a2 = ["YXNzZXRzL3Y5czdfazNwX204eDIubXAz", "YXNzZXRzL24ydzRfcjZ0X2I1cTkubXAz"]; // Encoded paths

    selectionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const version = btn.getAttribute('data-version');
            const audioSrc = atob(version === 'music' ? _0x4a2[0] : _0x4a2[1]);
            
            audio.src = audioSrc;
            audio.load();

            selectionScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainContent.classList.add('fade-in');

            setTimeout(() => {
                generateFlowers([document.querySelector('.audio-player')]);
            }, 50);
        });
    });

    changeVersionBtn.addEventListener('click', () => {
        audio.pause();
        playPauseBtn.innerHTML = playIcon;
        
        mainContent.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        
        setTimeout(() => {
            generateFlowers([
                document.querySelector('.selection-header'),
                document.querySelector('.selection-options'),
                document.querySelector('.selection-footer')
            ]);
        }, 50);
    });

    keyboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (enteredPin.length < 6) {
                enteredPin += btn.getAttribute('data-value');
                updateDots();
                if (enteredPin.length === 6) {
                    setTimeout(checkPin, 250);
                }
            }
        });
    });

    deleteBtn.addEventListener('click', () => {
        if (enteredPin.length > 0) {
            enteredPin = enteredPin.slice(0, -1);
            updateDots();
        }
    });

    hintBtn.addEventListener('click', () => {
        hintBox.classList.remove('hidden');
    });

    hintClose.addEventListener('click', () => {
        hintBox.classList.add('hidden');
    });

    // --- Skip Logic ---
    skipBackBtn.addEventListener('click', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
        updateProgress();
    });

    skipForwardBtn.addEventListener('click', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        updateProgress();
    });

    // --- Helper Format Time ---
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // --- Player Logic ---
    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = pauseIcon;
        } else {
            audio.pause();
            playPauseBtn.innerHTML = playIcon;
        }
    }

    function updateProgress() {
        if (!isDragging) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    }

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    let isDragging = false;

    function setProgress(e) {
        const rect = timeline.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const width = rect.width;
        let clickX = clientX - rect.left;
        clickX = Math.max(0, Math.min(clickX, width));
        const duration = audio.duration;
        if (duration) {
            const percent = (clickX / width) * 100;
            progress.style.width = `${percent}%`;
            currentTimeEl.textContent = formatTime((clickX / width) * duration);
            if (!isDragging) {
                audio.currentTime = (clickX / width) * duration;
            }
        }
    }

    function startDragging(e) {
        isDragging = true;
        setProgress(e);
    }

    function stopDragging(e) {
        if (isDragging) {
            const rect = timeline.getBoundingClientRect();
            const clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
            const width = rect.width;
            let clickX = clientX - rect.left;
            clickX = Math.max(0, Math.min(clickX, width));
            audio.currentTime = (clickX / width) * audio.duration;
            isDragging = false;
        }
    }

    function drag(e) {
        if (isDragging) {
            setProgress(e);
            e.preventDefault();
        }
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        playPauseBtn.innerHTML = playIcon;
        progress.style.width = '0%';
        currentTimeEl.textContent = '0:00';
    });

    timeline.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);
    timeline.addEventListener('touchstart', startDragging);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', stopDragging);

    if (audio.readyState >= 1) {
        durationEl.textContent = formatTime(audio.duration);
    }
});