import { initTimerUI } from '/js/timer/timer.js';
import { initExerciseUI } from '/js/exercise/exerciseUi.js'
import { routineUI } from '/js/routine/routineUi.js';
import { setUser, getUser, logout } from '/js/auth/authService.js';
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

function updateSettingsUserInfo() {
    const user = getUser();
    if (!user) return;

    const userInitials = document.getElementById('userInitials');
    const settingsUserName = document.getElementById('settingsUserName');
    const settingsUserEmail = document.getElementById('settingsUserEmail');

    if (userInitials) {
        const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
        userInitials.textContent = initials;
    }

    if (settingsUserName) {
        settingsUserName.textContent = `${user.firstName} ${user.lastName}`;
    }

    if (settingsUserEmail) {
        settingsUserEmail.textContent = user.email;
    }
}

function setupSettingsDropdown() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const dropdownLogoutBtn = document.getElementById('dropdownLogoutBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');

    const user = getUser();

    if (!user) return;

    let backdrop = null;

    function openDropdown() {
        settingsDropdown.hidden = false;
        settingsBtn.setAttribute('aria-expanded', 'true');

        // Create backdrop
        backdrop = document.createElement('div');
        backdrop.className = 'settings-dropdown-backdrop';
        backdrop.addEventListener('click', closeDropdown);
        document.body.appendChild(backdrop);
    }

    function closeDropdown() {
        settingsDropdown.hidden = true;
        settingsBtn.setAttribute('aria-expanded', 'false');

        // Remove backdrop
        if (backdrop) {
            backdrop.remove();
            backdrop = null;
        }
    }

    function toggleDropdown() {
        if (settingsDropdown.hidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    }

    // Toggle dropdown on button click
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !settingsDropdown.hidden) {
            closeDropdown();
        }
    });

    // Logout from dropdown
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Change Password
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            closeDropdown();
            openChangePasswordModal();
        });
    }

    // Edit Profile
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            closeDropdown();
            openEditProfileModal();
        });
    }
}

// ==========================================
// CHANGE PASSWORD MODAL
// ==========================================

function openChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    const form = document.getElementById('changePasswordForm');
    const cancelBtn = document.getElementById('cancelChangePasswordBtn');

    // Clear form
    form.reset();
    clearChangePasswordErrors();

    // Show modal
    modal.showModal();

    // Cancel button
    cancelBtn.onclick = () => {
        modal.close();
    };

    // Form submit
    form.onsubmit = handleChangePasswordSubmit;
}

function clearChangePasswordErrors() {
    document.getElementById('currentPasswordError').textContent = '';
    document.getElementById('newPasswordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    document.getElementById('changePasswordAuthError').textContent = '';
}

function showChangePasswordError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

async function handleChangePasswordSubmit(e) {
    e.preventDefault();

    clearChangePasswordErrors();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitChangePasswordBtn');

    // Validation
    if (newPassword.length < 6) {
        showChangePasswordError('newPasswordError', 'Password must be at least 6 characters');
        return;
    }

    if (newPassword !== confirmPassword) {
        showChangePasswordError('confirmPasswordError', 'Passwords do not match');
        return;
    }

    if (currentPassword === newPassword) {
        showChangePasswordError('newPasswordError', 'New password must be different from current password');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing...';

    try {
        const response = await fetch('http://localhost:8080/auth/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to change password');
        }

        // Success
        document.getElementById('changePasswordModal').close();
        alert('Password changed successfully!');

    } catch (error) {
        showChangePasswordError('changePasswordAuthError', error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
    }
}

// ==========================================
// EDIT PROFILE MODAL
// ==========================================

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    const form = document.getElementById('editProfileForm');
    const cancelBtn = document.getElementById('cancelEditProfileBtn');
    const user = getUser();

    // Populate form with current user data
    document.getElementById('editFirstName').value = user.firstName;
    document.getElementById('editLastName').value = user.lastName;
    document.getElementById('editEmail').value = user.email;

    clearEditProfileErrors();

    // Show modal
    modal.showModal();

    // Cancel button
    cancelBtn.onclick = () => {
        modal.close();
    };

    // Form submit
    form.onsubmit = handleEditProfileSubmit;
}

function clearEditProfileErrors() {
    document.getElementById('editFirstNameError').textContent = '';
    document.getElementById('editLastNameError').textContent = '';
    document.getElementById('editEmailError').textContent = '';
    document.getElementById('editProfileAuthError').textContent = '';
}

function showEditProfileError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

async function handleEditProfileSubmit(e) {
    e.preventDefault();

    clearEditProfileErrors();

    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const submitBtn = document.getElementById('submitEditProfileBtn');

    // Validation
    if (!firstName) {
        showEditProfileError('editFirstNameError', 'First name is required');
        return;
    }

    if (!lastName) {
        showEditProfileError('editLastNameError', 'Last name is required');
        return;
    }

    if (!email || !email.includes('@')) {
        showEditProfileError('editEmailError', 'Valid email is required');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const response = await fetch('http://localhost:8080/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update profile');
        }

        const updatedUser = await response.json();

        // Update user in session storage
        setUser({
            ...getUser(),
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email
        });
        // Update UI
        setupUserInfo();
        updateSettingsUserInfo();

        // Close modal
        document.getElementById('editProfileModal').close();
        alert('Profile updated successfully!');

    } catch (error) {
        showEditProfileError('editProfileAuthError', error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';
    }
}

// Call this in your DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setupUserInfo();
    setupSettingsDropdown();
    setupLogout(); // Keep your existing logout for compatibility
    initTimerUI();
    initExerciseUI();
    routineUI();
});