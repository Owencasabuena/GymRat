import { createExercise, updateExercise, deleteExercise, getExercises } from './exerciseApi.js';

// ==========================================
// DOM SELECTORS
// ==========================================
const elements = {
    modal: () => document.getElementById("exerciseModal"),
    modalTitle: () => document.getElementById("exerciseModalTitle"),
    form: () => document.querySelector(".exercise-form"),
    nameInput: () => document.getElementById("exerciseName"),
    setsInput: () => document.getElementById("exerciseSets"),
    repsInput: () => document.getElementById("exerciseReps"),
    durationInput: () => document.getElementById("exerciseDuration"),
    repsGroup: () => document.getElementById("repsGroup"),
    durationGroup: () => document.getElementById("durationGroup"),
    typeRadios: () => document.querySelectorAll('input[name="exerciseType"]'),
    nameError: () => document.getElementById("exerciseNameError"),
    setsError: () => document.getElementById("exerciseSetsError"),
    repsError: () => document.getElementById("exerciseRepsError"),
    durationError: () => document.getElementById("exerciseDurationError"),
    deleteModal: () => document.getElementById("deleteExerciseModal"),
    deleteModalText: () => document.querySelector("#deleteExerciseModal .modal__text"),
};

// ==========================================
// STATE
// ==========================================
let state = {
    currentRoutineId: null,
    isEditing: false,
    editingExerciseId: null,
    currentExerciseToDelete: null,
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.form-group__error');
    errors.forEach(err => err.textContent = '');
}

// ==========================================
// VALIDATION
// ==========================================

function validateExerciseForm(name, sets, type, reps, duration) {
    clearErrors();
    let isValid = true;

    if (!name || name.trim().length === 0) {
        showError(elements.nameError(), "Exercise name is required.");
        isValid = false;
    } else if (name.length > 50) {
        showError(elements.nameError(), "Name must be 50 characters or less.");
        isValid = false;
    }

    if (!sets || sets < 1) {
        showError(elements.setsError(), "Sets must be at least 1.");
        isValid = false;
    }

    if (type === 'reps') {
        if (!reps || reps < 1) {
            showError(elements.repsError(), "Reps must be at least 1.");
            isValid = false;
        }
    } else {
        if (!duration || duration < 1) {
            showError(elements.durationError(), "Duration must be at least 1 second.");
            isValid = false;
        }
    }

    return isValid;
}

// ==========================================
// DOM MANIPULATION
// ==========================================

function createExerciseItem(exercise, routineId) {
    const div = document.createElement('div');
    div.className = 'exercise-item';
    div.dataset.exerciseId = exercise.id;
    div.dataset.routineId = routineId;

    const detailText = exercise.reps
        ? `${exercise.sets} sets × ${exercise.reps} reps`
        : `${exercise.sets} sets × ${exercise.duration}s`;

    const weightText = exercise.weight ? ` @ ${exercise.weight}kg` : '';

    div.innerHTML = `
        <div class="exercise-item__content">
            <p class="exercise-item__name">${escapeHtml(exercise.name)}</p>
            <p class="exercise-item__details">${detailText}${weightText}</p>
        </div>
        <div class="exercise-item__actions">
            <button class="btn btn--icon btn--edit-exercise"
                    aria-label="Edit ${escapeHtml(exercise.name)}"
                    data-routine-id="${routineId}"
                    data-exercise-id="${exercise.id}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                    </path>
                </svg>
            </button>
            <button class="btn btn--icon btn--delete-exercise"
                    aria-label="Delete ${escapeHtml(exercise.name)}"
                    data-routine-id="${routineId}"
                    data-exercise-id="${exercise.id}">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                </svg>
            </button>
        </div>
    `;

    return div;
}

export function renderExercises(routineId, exercises) {
    const container = document.getElementById(`exercises-list-${routineId}`);
    if (!container) return;

    if (!exercises || exercises.length === 0) {
        container.innerHTML = '<p class="exercises-empty">No exercises yet. Add your first one!</p>';
        return;
    }

    container.innerHTML = '';
    exercises.forEach(exercise => {
        const item = createExerciseItem(exercise, routineId);
        container.appendChild(item);
    });
}

// ==========================================
// MODAL CONTROLS
// ==========================================

function openAddExerciseModal(routineId) {
    state.currentRoutineId = routineId;
    state.isEditing = false;
    state.editingExerciseId = null;

    elements.modalTitle().textContent = 'Add Exercise';
    elements.form().reset();
    clearErrors();

    // Reset to reps by default
    const repsRadio = document.querySelector('input[name="exerciseType"][value="reps"]');
    if (repsRadio) repsRadio.checked = true;

    // Call handleTypeChange to show/hide correct inputs
    handleTypeChange();

    elements.modal().showModal();
    setTimeout(() => elements.nameInput().focus(), 100);
}

function openEditExerciseModal(routineId, exercise) {
    state.currentRoutineId = routineId;
    state.isEditing = true;
    state.editingExerciseId = exercise.id;

    elements.modalTitle().textContent = 'Edit Exercise';

    // Populate form
    elements.nameInput().value = exercise.name;
    elements.setsInput().value = exercise.sets;

    if (exercise.reps) {
        const repsRadio = document.querySelector('input[name="exerciseType"][value="reps"]');
        if (repsRadio) repsRadio.checked = true;
        elements.repsInput().value = exercise.reps;
        elements.repsGroup().removeAttribute('hidden');
        elements.durationGroup().setAttribute('hidden', '');
    } else {
        const durationRadio = document.querySelector('input[name="exerciseType"][value="duration"]');
        if (durationRadio) durationRadio.checked = true;
        elements.durationInput().value = exercise.duration;
        elements.repsGroup().setAttribute('hidden', '');
        elements.durationGroup().removeAttribute('hidden');
    }

    clearErrors();
    elements.modal().showModal();
    setTimeout(() => elements.nameInput().focus(), 100);
}

// ==========================================
// API INTERACTIONS
// ==========================================

async function handleCreateExercise(routineId, exerciseData) {
    try {
        const newExercise = await createExercise(routineId, exerciseData);

        // Update DOM
        const container = document.getElementById(`exercises-list-${routineId}`);
        if (container) {
            // Remove empty message if exists
            const emptyMsg = container.querySelector('.exercises-empty');
            if (emptyMsg) emptyMsg.remove();

            const item = createExerciseItem(newExercise, routineId);
            container.appendChild(item);
        }

        return true;
    } catch (error) {
        console.error('Failed to create exercise:', error);
        return false;
    }
}

async function handleUpdateExercise(routineId, exerciseId, exerciseData) {
    try {
        const updatedExercise = await updateExercise(routineId, exerciseId, exerciseData);

        // Update DOM
        const item = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        if (item) {
            const detailText = updatedExercise.reps
                ? `${updatedExercise.sets} sets × ${updatedExercise.reps} reps`
                : `${updatedExercise.sets} sets × ${updatedExercise.duration}s`;

            const weightText = updatedExercise.weight ? ` @ ${updatedExercise.weight}kg` : '';

            item.querySelector('.exercise-item__name').textContent = updatedExercise.name;
            item.querySelector('.exercise-item__details').textContent = detailText + weightText;
        }

        return true;
    } catch (error) {
        console.error('Failed to update exercise:', error);
        return false;
    }
}

async function handleDeleteExercise(routineId, exerciseId) {
    try {
        await deleteExercise(routineId, exerciseId);

        // Remove from DOM
        const item = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => item.remove(), 200);
        }

        return true;
    } catch (error) {
        console.error('Failed to delete exercise:', error);
        return false;
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleTypeChange() {
    const selectedType = document.querySelector('input[name="exerciseType"]:checked')?.value;

    if (selectedType === 'reps') {
        elements.repsGroup().removeAttribute('hidden');
        elements.durationGroup().setAttribute('hidden', '');
        elements.repsInput().required = true;
        elements.durationInput().required = false;
    } else {
        elements.repsGroup().setAttribute('hidden', '');
        elements.durationGroup().removeAttribute('hidden');
        elements.repsInput().required = false;
        elements.durationInput().required = true;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const name = elements.nameInput().value.trim();
    const sets = parseInt(elements.setsInput().value);
    const type = document.querySelector('input[name="exerciseType"]:checked')?.value || 'reps';

    let reps = null;
    let duration = null;

    if (type === 'reps') {
        reps = parseInt(elements.repsInput().value);
    } else {
        duration = parseInt(elements.durationInput().value);
    }

    if (!validateExerciseForm(name, sets, type, reps, duration)) {
        return;
    }

    const exerciseData = {
        id: state.editingExerciseId,
        name,
        sets,
        ...(type === 'reps' ? { reps } : { duration })
    };

    const submitBtn = elements.form().querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = state.isEditing ? 'Updating...' : 'Saving...';

    let success = false;

    if (state.isEditing) {
        success = await handleUpdateExercise(state.currentRoutineId, state.editingExerciseId, exerciseData);
    } else {
        success = await handleCreateExercise(state.currentRoutineId, exerciseData);
    }

    if (success) {
        elements.modal().close();
        elements.form().reset();
        clearErrors();
        state.isEditing = false;
        state.editingExerciseId = null;
    } else {
        showError(elements.nameError(), 'Failed to save exercise. Please try again.');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
}

function handleModalCancel() {
    elements.modal().close();
    elements.form().reset();
    clearErrors();
    state.isEditing = false;
    state.editingExerciseId = null;
}

function handleDeleteConfirm(e) {
    e.preventDefault();

    if (!state.currentExerciseToDelete) return;

    const { routineId, exerciseId } = state.currentExerciseToDelete;

    const confirmBtn = elements.deleteModal().querySelector('.btn--danger');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    handleDeleteExercise(routineId, exerciseId).then(success => {
        elements.deleteModal().close();
        state.currentExerciseToDelete = null;
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    });
}

function handleDeleteCancel() {
    elements.deleteModal().close();
    state.currentExerciseToDelete = null;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    // Type radio buttons
    elements.typeRadios().forEach(radio => {
        radio.addEventListener('change', handleTypeChange);
    });

    // Form submission
    elements.form().addEventListener('submit', handleFormSubmit);

    // Cancel button
    const cancelBtn = elements.modal().querySelector('.btn--cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleModalCancel);
    }

    // Delete confirmation
    const deleteForm = elements.deleteModal()?.querySelector('.delete-form');
    if (deleteForm) {
        deleteForm.addEventListener('submit', handleDeleteConfirm);

        const cancelDeleteBtn = deleteForm.querySelector('.btn--cancel');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', handleDeleteCancel);
        }
    }

    // Global click handler for Add/Edit/Delete buttons
    document.addEventListener('click', (e) => {
        // Add Exercise button
        const addBtn = e.target.closest('.btn--add-exercise');
        if (addBtn) {
            e.stopPropagation(); // ✅ Prevent card collapse
            const routineId = addBtn.dataset.routineId;
            openAddExerciseModal(routineId);
            return;
        }

        // Edit Exercise button
        const editBtn = e.target.closest('.btn--edit-exercise');
        if (editBtn) {
            e.stopPropagation(); // ✅ Prevent card collapse
            const routineId = editBtn.dataset.routineId;
            const exerciseId = editBtn.dataset.exerciseId;

            // Find exercise data from DOM
            const item = editBtn.closest('.exercise-item');
            const name = item.querySelector('.exercise-item__name').textContent;
            const detailsText = item.querySelector('.exercise-item__details').textContent;

            // Parse details (this is a simplified version - you might want to store full data)
            // For now, we'll need to fetch from API or store in data attributes
            const exerciseData = {
                id: exerciseId,
                name: name,
                // You might want to add data attributes to store full exercise data
            };

            openEditExerciseModal(routineId, exerciseData);
            return;
        }

        // Delete Exercise button
        const deleteBtn = e.target.closest('.btn--delete-exercise');
        if (deleteBtn) {
            e.stopPropagation(); // ✅ Prevent card collapse
            const routineId = deleteBtn.dataset.routineId;
            const exerciseId = deleteBtn.dataset.exerciseId;
            const item = deleteBtn.closest('.exercise-item');
            const name = item.querySelector('.exercise-item__name').textContent;

            state.currentExerciseToDelete = { routineId, exerciseId };
            elements.deleteModalText().textContent = `Are you sure you want to delete "${name}"?`;
            elements.deleteModal().showModal();
            return;
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

export function initExerciseUI() {
    setupEventListeners();
}