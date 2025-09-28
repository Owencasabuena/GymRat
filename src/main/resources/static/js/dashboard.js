(() => {
    const logoutBtn = document.getElementById("logoutBtn");
    const programForm = document.querySelector(".programForm");
    const programList = document.querySelector(".programList");

    // Check logged-in user
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    if (!loggedUser) {
        window.location.href = "/login.html";
        return;
    }

    // Logout
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "/login.html";
    });

    // Fetch programs for the user
    async function loadPrograms() {
        try {
            const res = await fetch(`/programs/user/${loggedUser.id}`);
            const programs = await res.json();
            programList.innerHTML = "";

            programs.forEach(p => {
                const li = document.createElement("li");
                li.textContent = p.name;

                // Edit button
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", () => editProgram(p));

                // Delete button
                const delBtn = document.createElement("button");
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", () => deleteProgram(p.id));

                li.appendChild(editBtn);
                li.appendChild(delBtn);
                programList.appendChild(li);
            });
        } catch (err) {
            console.error("Error loading programs:", err);
        }
    }

    loadPrograms();

    // Add program
    programForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = programForm.querySelector("input[name='name']").value;

        try {
            const res = await fetch("/programs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, user: { id: loggedUser.id } })
            });
            if (res.ok) {
                programForm.reset();
                loadPrograms();
            }
        } catch (err) {
            console.error("Error adding program:", err);
        }
    });

    // Edit program (simple prompt version)
    async function editProgram(program) {
        const newName = prompt("Edit program name:", program.name);
        if (!newName) return;

        try {
            await fetch(`/programs/${program.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...program, name: newName })
            });
            loadPrograms();
        } catch (err) {
            console.error("Error editing program:", err);
        }
    }

    // Delete program
    async function deleteProgram(id) {
        try {
            await fetch(`/programs/${id}`, { method: "DELETE" });
            loadPrograms();
        } catch (err) {
            console.error("Error deleting program:", err);
        }
    }
})();
