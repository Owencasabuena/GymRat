const API_BASE_URL = 'http://localhost:8080';
const API_TIMEOUT = 10000;

async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
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

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    try {
        const text = await response.text();
        return text && text.trim() ? JSON.parse(text) : null;
    } catch (error) {
        console.warn('Failed to parse response:', error);
        return null;
    }
}

export async function getExercises(routineId) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routine/${routineId}/exercises`
    );
    return handleResponse(response);
}

export async function getExercise(routineId, exerciseId) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routine/${routineId}/exercises/${exerciseId}`
    );
    return handleResponse(response);
}

export async function createExercise(routineId, exerciseData) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routine/${routineId}/exercises`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exerciseData)
        }
    );
    return handleResponse(response);
}

export async function updateExercise(routineId, exerciseId, updatedData) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routine/${routineId}/exercises/${exerciseId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: routineId,
                ...updatedData
            })
        }
    );
    return handleResponse(response);
}

export async function deleteExercise(routineId, exerciseId) {
    const response = await fetchWithTimeout(
        `${API_BASE_URL}/routine/${routineId}/exercises/${exerciseId}`,
        { method: 'DELETE' }
    );
    return handleResponse(response);
}