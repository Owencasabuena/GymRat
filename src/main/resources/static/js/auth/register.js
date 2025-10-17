// ==========================================
// REGISTER PAGE
// ==========================================

import { register } from '/js/auth/authService.js';
import { redirectIfAuthenticated } from '/js/auth/authRouter.js';

// Check if already logged in (will redirect to dashboard if authenticated)
redirectIfAuthenticated();

// ==========================================
// DOM ELEMENTS
// ==========================================

const form = document.getElementById('registerForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('regEmail');
const passwordInput = document.getElementById('regPassword');
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('regEmailError');
const passwordError = document.getElementById('regPasswordError');
const authError = document.getElementById('authError');
const submitBtn = document.getElementById('submitBtn');

// ==========================================
// FORM HANDLING
// ==========================================

function clearErrors() {
    firstNameError.textContent = '';
    lastNameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    authError.textContent = '';
}

function showError(element, message) {
    element.textContent = message;
}

function validateForm(firstName, lastName, email, password) {
    clearErrors();
    let isValid = true;

    if (!firstName || !firstName.trim()) {
        showError(firstNameError, 'First name is required');
        isValid = false;
    }

    if (!lastName || !lastName.trim()) {
        showError(lastNameError, 'Last name is required');
        isValid = false;
    }

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

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validateForm(firstName, lastName, email, password)) {
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
        await register(firstName, lastName, email, password);
        // Redirect to dashboard after successful registration
        window.location.href = '/dashboard.html';
    } catch (error) {
        showError(authError, error.message || 'Registration failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

form.addEventListener('submit', handleSubmit);