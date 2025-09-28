(() => {
    const form = document.querySelector(".loginForm");

    if (!form) return console.error("Login form not found!");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = form.querySelector("input[name='username']").value;
        const password = form.querySelector("input[name='password']").value;

        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("loggedUser", JSON.stringify(data)); // <-- store user
                window.location.href = "/dashboard.html";
            } else if (response.status === 401) {
                alert("Invalid username or password");
            } else {
                alert("Login failed. Status: " + response.status);
            }

        } catch (err) {
            console.error("Login request error:", err);
            alert("Could not connect to server.");
        }
    });
})();
