import { getToken } from '/js/auth/authService.js';

const API_BASE_URL = 'http://localhost:8080';
const API_TIMEOUT = 10000;

// Helper to get auth headers
function getAuthHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        // Merge auth headers with any provided headers
        const headers = {
            ...getAuthHeaders(),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return null;
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.warn('Failed to parse JSON response:', text);
        return null;
    }
}

export async function getAllRoutines() {
    const response = await fetchWithTimeout(`${API_BASE_URL}/routines`);
    return handleResponse(response);
}

export async function getRoutine(routineId) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routines/${routineId}`
    );
    return handleResponse(response);
}

export async function createRoutine(routineData) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/routines`, {
        method: 'POST',
        body: JSON.stringify(routineData)
    });
    return handleResponse(response);
}

export async function updateRoutine(routineId, updatedData) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routines/${routineId}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                id: routineId,
                ...updatedData
            })
        }
    );
    return handleResponse(response);
}

export async function deleteRoutine(routineId) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routines/${routineId}`,
        { method: 'DELETE' }
    );
    return handleResponse(response);
}