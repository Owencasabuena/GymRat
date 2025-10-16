import { getAllRoutines, getRoutine, createRoutine, deleteRoutine, updateRoutine } from '/js/routine/routineApi.js';
import { renderExercises } from '/js/exercise/exerciseUi.js';
import { startWorkout } from '../workout/workoutManager.js';

// ==========================================
// DOM SELECTORS (cached for performance)
// ==========================================
const elements = {
    addBtn: () => document.querySelector(".btn--add-routine"),
    modal: () => document.getElementById("routineModal"),
    modalTitle: () => document.getElementById("routineModalTitle"),
    form: () => document.querySelector(".routine-form"),
    nameInput: () => document.getElementById("routineName"),
    descInput: () => document.getElementById("routineDescription"),
    nameError: () => document.getElementById("nameError"),
    descError: () => document.getElementById("descError"),
    routinesList: () => document.getElementById("routinesList"),
    deleteModal: () => document.getElementById("deleteRoutineModal"),
    deleteModalText: () => document.querySelector("#deleteRoutineModal .modal__text"),
    deleteForm: () => document.querySelector("#deleteRoutineModal .delete-form"),
};

// ==========================================
// STATE MANAGEMENT
// ==========================================
let state = {
    routines: [],
    currentRoutineToDelete: null,
    expandedRoutineId: null,
    isEditing: false,
    editingRoutineId: null
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Clear all error messages
function clearErrors() {
    const errors = document.querySelectorAll('.form-group__error');
    errors.forEach(err => err.textContent = '');
}

// Show loading state
function setLoadingState(isLoading) {
    const list = elements.routinesList();
    if (isLoading) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Loading routines...</p>';
    }
}

// ==========================================
// VALIDATION
// ==========================================
function validateRoutineForm(name, description) {
    clearErrors();
    let isValid = true;

    if (!name || name.trim().length === 0) {
        showError(elements.nameError(), "Name is required.");
        isValid = false;
    } else if (name.length > 50) {
        showError(elements.nameError(), "Name must be 50 characters or less.");
        isValid = false;
    }

    if (description && description.length > 200) {
        showError(elements.descError(), "Description must be 200 characters or less.");
        isValid = false;
    }

    return isValid;
}

// ==========================================
// DOM MANIPULATION
// ==========================================

// Create routine card element
function createRoutineCard(routine) {
    const article = document.createElement('article');
    article.className = 'routine-card';
    article.dataset.id = routine.id;

    article.innerHTML = `
        <div class="routine-card__header">
            <div class="routine-card__content">
                <h3 class="routine-card__name">${escapeHtml(routine.name)}</h3>
                <p class="routine-card__description">${escapeHtml(routine.description || 'No description')}</p>
                <p class="routine-card__hint">Click to view exercises</p>
            </div>
            <div class="routine-card__actions">
                <button class="btn btn--icon btn--edit" aria-label="Edit ${escapeHtml(routine.name)}" data-id="${routine.id}">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                        </path>
                    </svg>
                </button>
                <button class="btn btn--icon btn--delete" aria-label="Delete ${escapeHtml(routine.name)}" data-id="${routine.id}">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    return article;
}

// Render all routines
function renderRoutines(routines) {
    const list = elements.routinesList();
    list.innerHTML = '';

    if (routines.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No routines yet. Create your first one!</p>';
        return;
    }

    routines.forEach(routine => {
        const card = createRoutineCard(routine);
        list.appendChild(card);
    });
}

// Remove routine from DOM
function removeRoutineFromDOM(routineId) {
    const card = document.querySelector(`[data-id="${routineId}"]`);
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-20px)';
        setTimeout(() => card.remove(), 200);
    }
}

// Expand/Collapse card
async function handleRoutineCardClick(e) {
    const card = e.target.closest('.routine-card');
    if (!card) return;

    // Don't expand if clicking action buttons
    if (e.target.closest('.routine-card__actions')) return;
    if (e.target.closest('.routine-card__expanded')) return;

    const routineId = card.dataset.id;
    const isExpanded = card.classList.contains('routine-card--expanded');

    if (isExpanded) {
        collapseCard(card);
    } else {
        await expandCard(card, routineId);
    }
}

async function expandCard(card, routineId) {
    // Close other expanded cards
    document.querySelectorAll('.routine-card--expanded').forEach(c => {
        if (c !== card) collapseCard(c);
    });

    try {
        card.classList.add('routine-card--loading');

        // Fetch full routine with exercises
        const routine = await getRoutine(routineId);

        // Create expanded section
        const expandedDiv = document.createElement('div');
        expandedDiv.className = 'routine-card__expanded';
        expandedDiv.innerHTML = `
            <div class="routine-card__exercises">
                <div class="routine-card__exercises-header">
                    <h4>Exercises</h4>
                    <div style="display: flex; gap: var(--space-sm);">
                        <button class="btn btn--primary btn--sm btn--start-workout" data-routine-id="${routineId}">
                            Start Workout
                        </button>
                        <button class="btn btn--primary btn--sm btn--add-exercise" data-routine-id="${routineId}">
                            Add Exercise
                        </button>
                    </div>
                </div>
                <div class="exercises-list" id="exercises-list-${routineId}"></div>
            </div>
        `;

        card.appendChild(expandedDiv);
        card.classList.add('routine-card--expanded');
        card.classList.remove('routine-card--loading');

        state.expandedRoutineId = routineId;

        // Render exercises using exerciseUi module
        renderExercises(routineId, routine.exercises || []);

    } catch (error) {
        console.error('Failed to load routine details:', error);
        alert('Failed to load routine details');
        card.classList.remove('routine-card--loading');
    }
}

function collapseCard(card) {
    card.classList.remove('routine-card--expanded');
    const expandedContent = card.querySelector('.routine-card__expanded');
    if (expandedContent) {
        expandedContent.style.opacity = '0';
        expandedContent.style.transform = 'translateY(-10px)';
        setTimeout(() => expandedContent.remove(), 200);
    }
    state.expandedRoutineId = null;
}

// ==========================================
// API INTERACTIONS
// ==========================================

async function loadRoutines() {
    try {
        setLoadingState(true);
        const routines = await getAllRoutines();
        state.routines = routines;
        renderRoutines(routines);
    } catch (error) {
        console.error('Failed to load routines:', error);
        const list = elements.routinesList();
        list.innerHTML = '<p style="text-align: center; color: red;">Failed to load routines. Please refresh the page.</p>';
    }
}

async function handleCreateRoutine(name, description) {
    try {
        const newRoutine = await createRoutine({
            name: name.trim(),
            description: description.trim() || ""
        });

        state.routines.push(newRoutine);

        // Remove empty message if exists
        const emptyMessage = elements.routinesList().querySelector('p');
        if (emptyMessage) {
            emptyMessage.remove();
        }

        const card = createRoutineCard(newRoutine);
        elements.routinesList().appendChild(card);

        return true;
    } catch (error) {
        console.error('Failed to create routine:', error);
        return false;
    }
}

async function handleUpdateRoutine(routineId, name, description) {
    try {
        const updatedRoutine = await updateRoutine(routineId, {
            name: name.trim(),
            description: description.trim() || ""
        });

        // Update state
        const index = state.routines.findIndex(r => r.id == routineId);
        if (index !== -1) {
            state.routines[index] = { ...state.routines[index], ...updatedRoutine };
        }

        // Update DOM
        const card = document.querySelector(`[data-id="${routineId}"]`);
        if (card) {
            card.querySelector('.routine-card__name').textContent = updatedRoutine.name;
            card.querySelector('.routine-card__description').textContent = updatedRoutine.description || 'No description';
        }

        return true;
    } catch (error) {
        console.error('Failed to update routine:', error);
        return false;
    }
}

async function handleDeleteRoutine(routineId) {
    try {
        await deleteRoutine(routineId);

        state.routines = state.routines.filter(r => r.id !== routineId);
        removeRoutineFromDOM(routineId);

        elements.deleteModal().close();
        state.currentRoutineToDelete = null;

        return true;
    } catch (error) {
        console.error('Failed to delete routine:', error);
        alert('Failed to delete routine. Please try again.');
        return false;
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleAddRoutineClick() {
    // Reset to "Add" mode
    state.isEditing = false;
    state.editingRoutineId = null;

    elements.modalTitle().textContent = 'Add New Routine';
    elements.form().reset();
    clearErrors();

    elements.modal().showModal();
    setTimeout(() => elements.nameInput().focus(), 100);
}

function handleModalCancel(e) {
    e.preventDefault();
    elements.modal().close();
    elements.form().reset();
    clearErrors();

    // Reset editing state
    state.isEditing = false;
    state.editingRoutineId = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const name = elements.nameInput().value.trim();
    const description = elements.descInput().value.trim();

    if (!validateRoutineForm(name, description)) {
        return;
    }

    const submitBtn = elements.form().querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = state.isEditing ? 'Updating...' : 'Saving...';

    let success = false;

    // ✅ THIS IS THE FIX - Check if editing or creating
    if (state.isEditing) {
        success = await handleUpdateRoutine(state.editingRoutineId, name, description);
    } else {
        success = await handleCreateRoutine(name, description);
    }

    if (success) {
        elements.modal().close();
        elements.form().reset();
        clearErrors();

        // Reset editing state
        state.isEditing = false;
        state.editingRoutineId = null;
    } else {
        showError(elements.nameError(), 'Failed to save routine. Please try again.');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
}

function handleDeleteClick(e) {
    const deleteBtn = e.target.closest('.btn--delete');
    if (!deleteBtn) return;

    // Stop event from bubbling to card click
    e.stopPropagation();

    const routineId = deleteBtn.dataset.id;
    const card = deleteBtn.closest('.routine-card');
    const routineName = card.querySelector('.routine-card__name').textContent;

    state.currentRoutineToDelete = routineId;

    elements.deleteModalText().textContent = `Are you sure you want to delete "${routineName}"?`;
    elements.deleteModal().showModal();
}

function handleEditClick(e) {
    const editBtn = e.target.closest('.btn--edit');
    if (!editBtn) return;

    // Stop event from bubbling to card click
    e.stopPropagation();

    const routineId = editBtn.dataset.id;
    const routine = state.routines.find(r => r.id == routineId);

    if (!routine) return;

    // Set editing mode
    state.isEditing = true;
    state.editingRoutineId = routineId;

    // Populate form
    elements.nameInput().value = routine.name;
    elements.descInput().value = routine.description || '';

    // Update modal title
    elements.modalTitle().textContent = 'Edit Routine';

    clearErrors();
    elements.modal().showModal();
    setTimeout(() => elements.nameInput().focus(), 100);
}

async function handleDeleteConfirm(e) {
    e.preventDefault();

    if (!state.currentRoutineToDelete) return;

    const confirmBtn = elements.deleteModal().querySelector('.btn--danger');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';

    await handleDeleteRoutine(state.currentRoutineToDelete);

    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete';
}

function handleDeleteCancel(e) {
    e.preventDefault();
    elements.deleteModal().close();
    state.currentRoutineToDelete = null;
}

// Close modal when clicking backdrop
function handleModalBackdropClick(e) {
    if (e.target === e.currentTarget) {
        e.currentTarget.close();

        if (e.currentTarget === elements.modal()) {
            elements.form().reset();
            clearErrors();
            state.isEditing = false;
            state.editingRoutineId = null;
        }
    }
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================
function setupEventListeners() {
    elements.addBtn().addEventListener('click', handleAddRoutineClick);
    elements.form().addEventListener('submit', handleFormSubmit);

    const cancelBtn = elements.modal().querySelector('.btn--cancel');
    cancelBtn.addEventListener('click', handleModalCancel);

    const deleteForm = elements.deleteForm();
    deleteForm.addEventListener('submit', handleDeleteConfirm);

    const cancelDeleteBtn = deleteForm.querySelector('.btn--cancel');
    cancelDeleteBtn.addEventListener('click', handleDeleteCancel);

    // ✅ Event delegation for card clicks and buttons
    elements.routinesList().addEventListener('click', (e) => {
        handleDeleteClick(e);
        handleEditClick(e);
        handleRoutineCardClick(e); // ✅ THIS WAS MISSING!
    });

    elements.modal().addEventListener('click', handleModalBackdropClick);
    elements.deleteModal().addEventListener('click', handleModalBackdropClick);

    document.addEventListener('click', async (e) => {
        const startBtn = e.target.closest('.btn--start-workout');
        if (startBtn) {
            e.stopPropagation();
            const routineId = startBtn.dataset.routineId;

            try {
                // Fetch fresh routine data with exercises from API
                const routine = await getRoutine(routineId);

                if (!routine.exercises || routine.exercises.length === 0) {
                    showWorkoutError('No exercises in this routine! Add some exercises first.');
                    return;
                }

                startWorkout(routineId, routine.name, routine.exercises);
            } catch (error) {
                console.error('Failed to start workout:', error);
                showWorkoutError('Failed to start workout. Please try again.');
            }
            return;
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================
export function routineUI() {
    setupEventListeners();
    loadRoutines();
}