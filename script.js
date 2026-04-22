document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const timeline = document.querySelector('.timeline');
    const progress = document.querySelector('.progress');

    const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

    // --- Flower Generation (Anti-Overlap) ---
    const numberOfFlowers = 25;
    const flowers = [];
    const minDistance = 100; // Minimalna odległość między środkami kwiatków

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    for (let i = 0; i < numberOfFlowers; i++) {
        let x, y, tooClose;
        let attempts = 0;

        do {
            tooClose = false;
            x = Math.random() * 90; // Pozostawiamy margines 10% od prawej/dołu
            y = Math.random() * 90;
            attempts++;

            for (const f of flowers) {
                if (getDistance(x, y, f.x, f.y) < minDistance / (window.innerWidth / 100)) {
                    tooClose = true;
                    break;
                }
            }
        } while (tooClose && attempts < 100);

        flowers.push({ x, y });

        const flower = document.createElement('div');
        flower.classList.add('flower');
        flower.style.top = `${y}vh`;
        flower.style.left = `${x}vw`;
        flower.style.transform = `scale(${Math.random() * 0.4 + 0.6}) rotate(${Math.random() * 360}deg)`;
        container.appendChild(flower);
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
        }
    }

    let isDragging = false;

    function setProgress(e) {
        const rect = timeline.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const width = rect.width;
        let clickX = clientX - rect.left;
        
        // Ograniczenie do granic paska
        clickX = Math.max(0, Math.min(clickX, width));
        
        const duration = audio.duration;
        if (duration) {
            const percent = (clickX / width) * 100;
            progress.style.width = `${percent}%`;
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
            e.preventDefault(); // Zapobiega przewijaniu strony na telefonie podczas przesuwania paska
        }
    }

    playPauseBtn.addEventListener('click', togglePlayPause);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        playPauseBtn.innerHTML = playIcon;
        progress.style.width = '0%';
    });

    // Obsługa myszy
    timeline.addEventListener('mousedown', startDragging);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', stopDragging);

    // Obsługa dotyku
    timeline.addEventListener('touchstart', startDragging);
    window.addEventListener('touchmove', drag, { passive: false });
    window.addEventListener('touchend', stopDragging);
});
