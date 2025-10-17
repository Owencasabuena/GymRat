import { initTimerUI } from '/js/timer/timer.js';
import { initExerciseUI } from '/js/exercise/exerciseUi.js'
import { routineUI } from '/js/routine/routineUi.js';
import { getUser, logout } from '/js/auth/authService.js';
import { setupAuthRouter } from '/js/auth/authRouter.js';

// Setup auth router (protect routes)
setupAuthRouter();

// Display user info
function setupUserInfo() {
    const user = getUser();
    const userInfo = document.getElementById('userInfo');
    if (user && userInfo) {
        userInfo.textContent = `Welcome, ${user.firstName}`;
    }
}

// Setup logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupLogout();
    initTimerUI();
    initExerciseUI();
    routineUI();
});