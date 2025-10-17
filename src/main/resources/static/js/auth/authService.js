// ==========================================
// AUTH SERVICE
// ==========================================

const API_BASE_URL = 'http://localhost:8080/auth';

// ==========================================
// TOKEN MANAGEMENT
// ==========================================

function setToken(token) {
    sessionStorage.setItem('authToken', token);
}

function getToken() {
    return sessionStorage.getItem('authToken');
}

function clearToken() {
    sessionStorage.removeItem('authToken');
}

function isAuthenticated() {
    return getToken() !== null;
}

// ==========================================
// USER MANAGEMENT
// ==========================================

function setUser(user) {
    sessionStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function clearUser() {
    sessionStorage.removeItem('user');
}

// ==========================================
// API CALLS
// ==========================================

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();

        setToken(data.token);
        setUser({
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
        });

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function register(firstName, lastName, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                email,
                password
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();

        setToken(data.token);
        setUser({
            id: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
        });

        return data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
}

function logout() {
    clearToken();
    clearUser();
    window.location.href = '/login.html';
}

// ==========================================
// EXPORTS
// ==========================================

export {
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    getUser,
    setToken,
    clearToken,
    setUser,
    clearUser
};