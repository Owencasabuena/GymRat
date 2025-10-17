// ==========================================
// LOGIN PAGE
// ==========================================

import { login } from '/js/auth/authService.js';
import { redirectIfAuthenticated } from '/js/auth/authRouter.js';

// Check if already logged in
redirectIfAuthenticated();

// ==========================================
// DOM ELEMENTS
// ==========================================

const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const authError = document.getElementById('authError');
const submitBtn = document.getElementById('submitBtn');

// ==========================================
// FORM HANDLING
// ==========================================

function clearErrors() {
    emailError.textContent = '';
    passwordError.textContent = '';
    authError.textContent = '';
}

function showError(element, message) {
    element.textContent = message;
}

function validateForm(email, password) {
    clearErrors();
    let isValid = true;

    if (!email || !email.trim()) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError(emailError, 'Please enter a valid email');
        isValid = false;
    }

    if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError(passwordError, 'Password must be at least 6 characters');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function handleSubmit(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validateForm(email, password)) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        await login(email, password);
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(authError, error.message || 'Login failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

form.addEventListener('submit', handleSubmit);