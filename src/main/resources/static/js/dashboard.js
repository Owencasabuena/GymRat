import { initTimerUI } from '/js/timer/timer.js';
import { initExerciseUI } from '/js/exercise/exerciseUi.js'
import { routineUI } from '/js/routine/routineUi.js';

document.addEventListener('DOMContentLoaded', () => {
    initTimerUI();
    initExerciseUI();
    routineUI();
});