export function timer() {
    const customBtn = document.querySelector(".custom-btn");
    const customInputContainer = document.querySelector(".custom-input-container");
    const customForm = document.querySelector(".custom-input-form");
    const errorMessage = document.querySelector(".custom-error");
    const timerDisplay = document.querySelector(".timer-display");
    const presetBtns = document.querySelectorAll(".preset-btn");
    const startPauseBtn = document.querySelector(".start-pause-btn");
    const resetBtn = document.querySelector(".reset-btn");

    let remainingTime = 0;
    let timerId = null;
    let isRunning = false;

    startPauseBtn.addEventListener('click', () => {
        if(!isRunning && remainingTime > 0) {
            isRunning = true;
            startPauseBtn.textContent = "Pause";

            timerId = setInterval(() => {
                remainingTime--;
                updateDisplay(remainingTime);

                if (remainingTime <= 0) {
                    clearInterval(timerId);
                    isRunning = false;
                    startPauseBtn.textContent = 'Start';
                }
            }, 1000);
        } else {
            isRunning = false;
            clearInterval(timerId);
            startPauseBtn.textContent = "Start";
        }
    });

    function updateDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    presetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(timerId);
                isRunning = false;
                startPauseBtn.textContent = 'Start';
            }

            remainingTime = parseInt(btn.getAttribute('data-seconds'));
            updateDisplay(remainingTime);
        });
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerId);
        isRunning = false;
        remainingTime = 0;
        startPauseBtn.textContent = "Start";
        updateDisplay(remainingTime);
    });

    customBtn.addEventListener('click', () => {
        const isVisible = customInputContainer.classList.toggle('show');
        customBtn.textContent = isVisible ? 'Hide' : 'Custom';
    });

    customForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customMinutes = parseInt(document.querySelector("#customMinutes").value) || 0;
        const customSeconds = parseInt(document.querySelector("#customSeconds").value) || 0;

        const isMinutesValid = customMinutes >= 0;
        const isSecondsValid = customSeconds >= 0 && customSeconds < 60;

        if (!isMinutesValid || !isSecondsValid || (customMinutes === 0 && customSeconds === 0)) {
            if (customMinutes === 0 && customSeconds === 0) {
                errorMessage.textContent = "Time should be greater than zero.";
            } else if (customSeconds >= 60) {
                errorMessage.textContent = "Seconds must be less than 60.";
            } else if (customMinutes < 0 || customSeconds < 0) {
                errorMessage.textContent = "Time cannot be negative.";
            } else {
                errorMessage.textContent = "Invalid time input.";
            }
            errorMessage.classList.add("show");
        } else {
            errorMessage.classList.remove("show");
            errorMessage.textContent = '';
            clearInterval(timerId);
            isRunning = false;
            remainingTime = (customMinutes * 60) + customSeconds;
            updateDisplay(remainingTime);
            customInputContainer.classList.remove('show');
            customBtn.textContent = 'Custom';
        }
    });

}
