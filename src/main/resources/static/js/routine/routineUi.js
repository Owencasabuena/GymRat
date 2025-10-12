import { getAllRoutines, createRoutine, deleteRoutine, updateRoutine } from '/js/routine/routineApi.js';

export function routineUI() {
    const addRoutineBtn = document.querySelector(".add-routine-btn");
    const routineModal = document.querySelector(".routine-modal");
    const cancelRoutineBtn = document.querySelector(".cancel-btn");
    const routineForm = document.querySelector(".routine-form");
    const routineNameInput = document.querySelector("#routineName");
    const routineDescInput = document.querySelector("#routineDescription");
    const errorMessages = document.querySelectorAll(".error-message");
    const deleteDialog = document.querySelector('.delete-confirmation');
    const deleteForm = deleteDialog.querySelector('.delete-form');
    const confirmDeleteBtn = deleteDialog.querySelector('.confirm-delete-btn');
    const cancelDeleteBtn = deleteDialog.querySelector('.cancel-delete-btn');
    let currentCardToDelete = null;

    function setupDeleteHandler(card) {
        const deleteBtn = card.querySelector(".delete-routine-btn");

        deleteBtn.addEventListener("click", () => {
            currentCardToDelete = card;
            deleteDialog.showModal();
        });
    }

    function addRoutineCard(routine) {
        const container = document.querySelector(".routine-container");
        const card = document.createElement("div");
        card.classList.add("card-routine");
        card.dataset.id = routine.id;
        card.innerHTML = `
            <div>
                <p class="routine-name">${routine.name}</p>
                <p class="routine-description">${routine.description}</p>
            </div>
            <div class="action-btn-container">
                <button class="edit-routine-btn">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                        </path>
                    </svg>
                </button>
                <button class="delete-routine-btn">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(card);
        setupDeleteHandler(card);
    }

    (async function loadRoutines() {
        try {
            const routines = await getAllRoutines();
            routines.forEach(routine => addRoutineCard(routine));
        } catch (err) {
            console.error('Failed to load routines:', err);
        }
    })();

    addRoutineBtn.addEventListener('click', () => {
        routineModal.showModal();
    });

    cancelRoutineBtn.addEventListener('click', () => {
        routineModal.close();
    });

    routineForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = routineNameInput.value.trim();
        const description = routineDescInput.value.trim();

        errorMessages.forEach((err) => err.textContent = '');

        if (name.length === 0) {
            errorMessages[0].textContent = "Name is required.";
            return;
        }

        if (name.length > 20) {
            errorMessages[0].textContent = "Name must be 20 characters or less.";
            return;
        }

        try {

            const newRoutine = await createRoutine({ name, description: description || "" });
            addRoutineCard(newRoutine);

            routineModal.close();
            routineForm.reset();
        } catch(err) {
            console.error('Failed to create routine:', err);
        }

    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!currentCardToDelete) return;

        const id = currentCardToDelete.dataset.id;
        try {
            await deleteRoutine(id);
            currentCardToDelete.remove();
        } catch (err) {
            console.error('Failed to delete routine:', err);
        } finally {
            deleteDialog.close();
            currentCardToDelete = null;
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteDialog.close();
        currentCardToDelete = null;
    });


}


