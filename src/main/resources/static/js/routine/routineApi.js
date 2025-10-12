export async function getAllRoutines() {
    const response = await fetch('http://localhost:8080/routines');

    if (!response.ok) {
        throw new Error(`Failed to fetch routines: ${response.status}`);
    }
    return await response.json();
}

export async function createRoutine(routineData) {
    const response = await fetch('http://localhost:8080/routines',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routineData)
    });

    if(!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
}

export async function deleteRoutine(routineId) {
    const response = await fetch(`http://localhost:8080/routines/${routineId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete routine: ${res.status}`);
    }
}

export async function updateRoutine(id, updatedData) {
    const response = await fetch(`/api/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
        throw new Error('Failed to update routine');
    }
    return await response.json();
}
