(() => {
    const form = document.querySelector(".registerForm");

    console.log("JS loaded. Form found:", form);

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = form.querySelector("input[name='username']").value;
            const password = form.querySelector("input[name='password']").value;

            if (!username || !password) {
                alert("Please fill in all fields!");
                return;
            }

            try {
                const response = await fetch("/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("User registered:", data);
                    alert("Registration successful!");
                } else {
                    console.error("Server error:", response.status);
                    alert("Failed to register user.");
                }

            } catch (error) {
                console.error("Request error:", error);
                alert("Could not connect to the server.");
            }
        });
    } else {
        console.error("Register form not found in DOM!");
    }
})();
