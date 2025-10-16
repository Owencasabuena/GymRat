// ==========================================
// WORKOUT MANAGER
// Manages workout flow and timer integration
// ==========================================

import { setTime, startTimer, stopTimer, resetTimer } from '../timer/timer.js';

// ==========================================
// STATE
// ==========================================
let workoutState = {
    isActive: false,
    routineId: null,
    routineName: '',
    exercises: [],
    currentExerciseIndex: 0,
    currentSet: 1,
    restTimerSeconds: 90, // Default rest time
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
    workoutOverlay: () => document.getElementById('workoutOverlay'),
    workoutRoutineName: () => document.getElementById('workoutRoutineName'),
    workoutExerciseName: () => document.getElementById('workoutExerciseName'),
    workoutSetInfo: () => document.getElementById('workoutSetInfo'),
    workoutProgressBar: () => document.getElementById('workoutProgressBar'),
    completeSetBtn: () => document.getElementById('completeSetBtn'),
    skipRestBtn: () => document.getElementById('skipRestBtn'),
    endWorkoutBtn: () => document.getElementById('endWorkoutBtn'),
    workoutError: () => document.getElementById('workoutError'),
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function showWorkoutError(message) {
    const errorEl = elements.workoutError();
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    }
}

function showWorkoutSuccess(message) {
    const errorEl = elements.workoutError();
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.backgroundColor = 'var(--primary)';
        errorEl.style.display = 'block';
        setTimeout(() => {
            errorEl.style.display = 'none';
            errorEl.style.backgroundColor = '';
        }, 3000);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function createWorkoutOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'workoutOverlay';
    overlay.className = 'workout-overlay';
    overlay.innerHTML = `
        <div class="workout-panel">
            <div class="workout-panel__header">
                <div>
                    <h3 id="workoutRoutineName" class="workout-panel__title">Workout</h3>
                    <p id="workoutExerciseName" class="workout-panel__exercise">Exercise Name</p>
                </div>
                <button class="btn btn--icon btn--end-workout" id="endWorkoutBtn" aria-label="End workout">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div id="workoutError" class="workout-panel__error" style="display: none;"></div>

            <div class="workout-panel__body">
                <p id="workoutSetInfo" class="workout-panel__set-info">Set 1 of 3</p>

                <div class="workout-panel__progress">
                    <div id="workoutProgressBar" class="workout-panel__progress-bar"></div>
                </div>

                <div class="workout-panel__actions">
                    <button class="btn btn--primary" id="completeSetBtn">Complete Set</button>
                    <button class="btn btn--cancel" id="skipRestBtn" style="display: none;">Skip Rest</button>
                </div>
            </div>
        </div>

        <!-- End Workout Confirmation Modal -->
        <dialog class="modal modal--confirm" id="endWorkoutModal">
            <form class="modal__form">
                <p class="modal__text">Are you sure you want to end this workout?</p>
                <div class="modal__actions">
                    <button type="button" class="btn btn--cancel" id="cancelEndWorkout">Cancel</button>
                    <button type="button" class="btn btn--danger" id="confirmEndWorkout">End Workout</button>
                </div>
            </form>
        </dialog>

        <!-- Workout Complete Modal -->
        <dialog class="modal modal--confirm" id="workoutCompleteModal">
            <div class="modal__form">
                <h2 class="modal__title">🎉 Workout Complete!</h2>
                <p class="modal__text">Great job! You've finished your workout.</p>
                <div class="modal__actions">
                    <button type="button" class="btn btn--primary" id="closeCompleteModal">Close</button>
                </div>
            </div>
        </dialog>
    `;
    document.body.appendChild(overlay);
}

function updateProgressBar() {
    const totalSets = workoutState.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const completedSets = workoutState.exercises.slice(0, workoutState.currentExerciseIndex)
        .reduce((sum, ex) => sum + ex.sets, 0) + (workoutState.currentSet - 1);

    const progress = (completedSets / totalSets) * 100;
    const progressBar = elements.workoutProgressBar();
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

function updateWorkoutDisplay() {
    const currentExercise = workoutState.exercises[workoutState.currentExerciseIndex];

    if (!currentExercise) {
        completeWorkout();
        return;
    }

    elements.workoutRoutineName().textContent = workoutState.routineName;
    elements.workoutExerciseName().textContent = currentExercise.name;

    const setInfo = currentExercise.reps
        ? `Set ${workoutState.currentSet} of ${currentExercise.sets} - ${currentExercise.reps} reps`
        : `Set ${workoutState.currentSet} of ${currentExercise.sets} - ${currentExercise.duration}s`;

    elements.workoutSetInfo().textContent = setInfo;

    updateProgressBar();

    // Show/hide buttons based on state
    const completeBtn = elements.completeSetBtn();
    const skipBtn = elements.skipRestBtn();

    completeBtn.style.display = 'block';
    skipBtn.style.display = 'none';
}

// ==========================================
// WORKOUT FLOW
// ==========================================

export function startWorkout(routineId, routineName, exercises) {
    if (!exercises || exercises.length === 0) {
        showWorkoutError('No exercises in this routine!');
        return;
    }

    workoutState = {
        isActive: true,
        routineId,
        routineName,
        exercises: [...exercises],
        currentExerciseIndex: 0,
        currentSet: 1,
        restTimerSeconds: 120,
    };

    // Create overlay if it doesn't exist
    if (!document.getElementById('workoutOverlay')) {
        createWorkoutOverlay();
        setupWorkoutEventListeners();
    }

    // Show overlay
    elements.workoutOverlay().classList.add('workout-overlay--active');

    updateWorkoutDisplay();

    // Auto-start timer for duration-based exercises
    const currentExercise = workoutState.exercises[0];
    if (currentExercise.duration) {
        setTime(currentExercise.duration);
        startTimer();
    }
}

function handleCompleteSet() {
    const currentExercise = workoutState.exercises[workoutState.currentExerciseIndex];

    if (!currentExercise) return;

    // Stop timer if it's running (for duration exercises)
    stopTimer();

    // Check if more sets remaining for this exercise
    if (workoutState.currentSet < currentExercise.sets) {
        // More sets to do - start rest timer
        workoutState.currentSet++;
        startRestTimer();
    } else {
        // Exercise complete - move to next
        workoutState.currentExerciseIndex++;
        workoutState.currentSet = 1;

        if (workoutState.currentExerciseIndex >= workoutState.exercises.length) {
            // Workout complete!
            completeWorkout();
        } else {
            // Next exercise - start rest timer
            startRestTimer();
        }
    }
}

function startRestTimer() {
    // Update UI for rest mode
    const completeBtn = elements.completeSetBtn();
    const skipBtn = elements.skipRestBtn();
    const overlay = elements.workoutOverlay();

    completeBtn.style.display = 'none';
    skipBtn.style.display = 'block';
    overlay.classList.add('rest-mode');

    elements.workoutExerciseName().textContent = 'Rest Time';
    elements.workoutSetInfo().textContent = 'Take a break!';

    // Start timer
    setTime(workoutState.restTimerSeconds);
    startTimer();

    // When timer ends, automatically move to next set/exercise
    listenForTimerEnd();
}

function listenForTimerEnd() {
    // This will be called by the timer when it reaches 0
    // We'll add this hook to the timer module
    const checkInterval = setInterval(() => {
        const timerDisplay = document.querySelector('.timer__display');
        if (timerDisplay && timerDisplay.textContent === '00:00') {
            clearInterval(checkInterval);
            handleRestComplete();
        }
    }, 500);

    // Store interval so we can clear it if user skips
    workoutState.restCheckInterval = checkInterval;
}

function handleRestComplete() {
    if (workoutState.restCheckInterval) {
        clearInterval(workoutState.restCheckInterval);
    }

    // Hide rest time selector
    const restSelector = document.getElementById('restTimeSelector');

    updateWorkoutDisplay();

    // Auto-start timer for duration-based exercises
    const currentExercise = workoutState.exercises[workoutState.currentExerciseIndex];
    if (currentExercise && currentExercise.duration) {
        setTime(currentExercise.duration);
        startTimer();
    }
}

function handleSkipRest() {
    if (workoutState.restCheckInterval) {
        clearInterval(workoutState.restCheckInterval);
    }

    stopTimer();
    resetTimer();
    handleRestComplete();
}

function completeWorkout() {
    showWorkoutSuccess('Workout Complete! Great job!');
    setTimeout(() => endWorkout(), 2000);
}

function endWorkout() {
    if (workoutState.restCheckInterval) {
        clearInterval(workoutState.restCheckInterval);
    }

    stopTimer();
    resetTimer();

    workoutState.isActive = false;

    const endModal = document.getElementById('endWorkoutModal');
    if (endModal && endModal.open) {
        endModal.close();
    }

    const completeModal = document.getElementById('workoutCompleteModal');
    if (completeModal && completeModal.open) {
        completeModal.close();
    }

    const overlay = elements.workoutOverlay();
    if (overlay) {
        overlay.classList.remove('workout-overlay--active');
    }

    // Hide rest selector
    const restSelector = document.getElementById('restTimeSelector');
    if (restSelector) restSelector.style.display = 'none';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupWorkoutEventListeners() {
    elements.completeSetBtn().addEventListener('click', handleCompleteSet);
    elements.skipRestBtn().addEventListener('click', handleSkipRest);
    elements.endWorkoutBtn().addEventListener('click', () => {
        const endModal = document.getElementById('endWorkoutModal');
        if (endModal) {
            endModal.showModal();
        }
    });

    const confirmEndBtn = document.getElementById('confirmEndWorkout');
    if (confirmEndBtn) {
        confirmEndBtn.addEventListener('click', () => {
            endWorkout();
        });
    }

    const cancelEndBtn = document.getElementById('cancelEndWorkout');
    if (cancelEndBtn) {
        cancelEndBtn.addEventListener('click', () => {
            const endModal = document.getElementById('endWorkoutModal');
            if (endModal) {
                endModal.close();
            }
        });
    }

    const closeCompleteBtn = document.getElementById('closeCompleteModal');
    if (closeCompleteBtn) {
        closeCompleteBtn.addEventListener('click', () => {
            endWorkout();
        });
    }
}

// ==========================================
// EXPORT
// ==========================================

export function isWorkoutActive() {
    return workoutState.isActive;
}

export function getCurrentWorkoutState() {
    return { ...workoutState };
}