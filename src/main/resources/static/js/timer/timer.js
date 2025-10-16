// ==========================================
// CONSTANTS
// ==========================================
const SECONDS_PER_MINUTE = 60;
const TIMER_INTERVAL = 1000; // 1 second

// ==========================================
// DOM SELECTORS
// ==========================================
const elements = {
    display: () => document.querySelector('.timer__display'),
    presetBtns: () => document.querySelectorAll('.btn--preset'),
    customBtn: () => document.querySelector('.btn--custom'),
    customContainer: () => document.querySelector('.timer__custom'),
    customForm: () => document.querySelector('.custom-form'),
    minutesInput: () => document.getElementById('customMinutes'),
    secondsInput: () => document.getElementById('customSeconds'),
    errorMsg: () => document.querySelector('.custom-form__error'),
    startPauseBtn: () => document.querySelector('.btn--start-pause'),
    resetBtn: () => document.querySelector('.btn--reset'),
};

// ==========================================
// STATE
// ==========================================
let state = {
    remainingTime: 0,
    initialTime: 0,
    timerId: null,
    isRunning: false,
    originalTitle: document.title,
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Format seconds to MM:SS
 */
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Update timer display
 */
function updateDisplay(seconds) {
    elements.display().textContent = formatTime(seconds);
}

/**
 * Update browser tab title with timer
 */
function updatePageTitle(seconds) {
    if (state.isRunning && seconds > 0) {
        document.title = `${formatTime(seconds)} - ${state.originalTitle}`;
    } else {
        document.title = state.originalTitle;
    }
}

/**
 * Play a short tick sound every second
 */
function playTickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440; // Frequency (Hz)
        oscillator.type = 'square'; // Sharper tick sound

        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05); // very short
    } catch (err) {
        console.warn('Tick sound failed:', err);
    }
}

/**
 * Play a short click sound (for button presses)
 */
function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 300;
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
        console.warn('Click sound failed:', err);
    }
}



/**
 * Play notification sound when timer ends
 */
function playTimerEndSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('Could not play sound:', error);
    }
}

/**
 * Show browser notification (if permitted)
 */
function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Finished!', {
            body: 'Your workout rest timer has ended.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
        });
    }
}

/**
 * Request notification permission on first use
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ==========================================
// TIMER CONTROL FUNCTIONS
// ==========================================

/**
 * Stop the timer
 */
export function stopTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    state.isRunning = false;
    elements.startPauseBtn().textContent = 'Start';
    updatePageTitle(0);
}

/**
 * Start the timer
 */
export function startTimer() {
    if (state.remainingTime <= 0) return;

    state.isRunning = true;
    elements.startPauseBtn().textContent = 'Pause';

    // Request notification permission on first start
    requestNotificationPermission();

    state.timerId = setInterval(() => {
        state.remainingTime--;
        playTickSound();
        updateDisplay(state.remainingTime);
        updatePageTitle(state.remainingTime);

        // Timer finished
        if (state.remainingTime <= 0) {
            stopTimer();
            onTimerComplete();
        }
    }, TIMER_INTERVAL);
}

/**
 * Pause the timer
 */
function pauseTimer() {
    stopTimer();
}

/**
 * Reset timer to initial time
 */
export function resetTimer() {
    stopTimer();
    state.remainingTime = state.initialTime;
    updateDisplay(state.remainingTime);
}

/**
 * Set new time and update display
 */
export function setTime(seconds) {
    stopTimer();
    state.remainingTime = seconds;
    state.initialTime = seconds;
    updateDisplay(seconds);
}

/**
 * Called when timer reaches zero
 */
function onTimerComplete() {
    playTimerEndSound();
    showNotification();

    // Flash the display briefly
    const display = elements.display();
    display.style.color = 'var(--primary)';
    setTimeout(() => {
        display.style.color = '';
    }, 1000);
}

// ==========================================
// VALIDATION
// ==========================================

/**
 * Validate custom time input
 */
function validateCustomTime(minutes, seconds) {
    const errors = [];

    if (minutes < 0 || seconds < 0) {
        errors.push('Time cannot be negative.');
    }

    if (seconds >= SECONDS_PER_MINUTE) {
        errors.push('Seconds must be less than 60.');
    }

    if (minutes === 0 && seconds === 0) {
        errors.push('Time must be greater than zero.');
    }

    if (minutes > 99) {
        errors.push('Minutes cannot exceed 99.');
    }

    return errors;
}

/**
 * Show error message
 */
function showError(message) {
    const errorEl = elements.errorMsg();
    errorEl.textContent = message;
    errorEl.classList.add('show');
}

/**
 * Clear error message
 */
function clearError() {
    const errorEl = elements.errorMsg();
    errorEl.textContent = '';
    errorEl.classList.remove('show');
}

// ==========================================
// CUSTOM TIME UI
// ==========================================

/**
 * Toggle custom time input visibility
 */
function toggleCustomInput() {
    const container = elements.customContainer();
    const isHidden = container.hasAttribute('hidden');

    if (isHidden) {
        container.removeAttribute('hidden');
        elements.customBtn().textContent = 'Hide';
        setTimeout(() => elements.minutesInput().focus(), 100);
    } else {
        container.setAttribute('hidden', '');
        elements.customBtn().textContent = 'Custom';
        clearError();
    }
}

/**
 * Hide custom input
 */
function hideCustomInput() {
    const container = elements.customContainer();
    container.classList.remove('show');
    elements.customBtn().textContent = 'Custom';
    clearError();
}

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Handle start/pause button click
 */
function handleStartPause() {
    playClickSound();
    if (state.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

/**
 * Handle reset button click
 */
function handleReset() {
    resetTimer();
}

/**
 * Handle preset button clicks
 */
function handlePresetClick(e) {
    // Ignore custom button
    if (e.target.classList.contains('custom-btn')) return;

    const seconds = parseInt(e.target.dataset.seconds);
    if (!isNaN(seconds)) {
        setTime(seconds);
        hideCustomInput();
    }
}

/**
 * Handle custom time form submission
 */
function handleCustomSubmit(e) {
    e.preventDefault();
    
    const minutes = parseInt(elements.minutesInput().value) || 0;
    const seconds = parseInt(elements.secondsInput().value) || 0;
    
    // Validate
    const errors = validateCustomTime(minutes, seconds);
    
    if (errors.length > 0) {
        showError(errors[0]); // Show first error
        return;
    }
    
    // Valid input
    clearError();
    const totalSeconds = (minutes * SECONDS_PER_MINUTE) + seconds;
    setTime(totalSeconds);
    hideCustomInput();
    
    // Reset form
    elements.customForm().reset();
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    // Start/Pause button
    elements.startPauseBtn().addEventListener('click', handleStartPause);
    
    // Reset button
    elements.resetBtn().addEventListener('click', handleReset);
    
    // Preset buttons
    elements.presetBtns().forEach(btn => {
        btn.addEventListener('click', handlePresetClick);
    });
    
    // Custom button
    elements.customBtn().addEventListener('click', toggleCustomInput);
    
    // Custom form
    elements.customForm().addEventListener('submit', handleCustomSubmit);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to start/pause (when not in input)
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            handleStartPause();
        }
        
        // R to reset (when not in input)
        if (e.code === 'KeyR' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            handleReset();
        }
    });
    
    // Cleanup when page unloads
    window.addEventListener('beforeunload', () => {
        stopTimer();
    });
}

// ==========================================
// INITIALIZATION
// ==========================================
export function initTimerUI() {
    setupEventListeners();
    updateDisplay(0);
    
    // Set default time (optional)
    // setTime(60); // Start with 1 minute
}

// For backward compatibility
export const timer = initTimerUI;