export function timer() {
    const customBtn = document.querySelector(".custom-btn");
    const customInputContainer = document.querySelector(".custom-input-container");
    const customForm = document.querySelector(".custom-input-form");
    const errorMessage = document.querySelector(".custom-error");

    customBtn.addEventListener('click', () => {
        const isVisible = customInputContainer.classList.toggle('show');
        customBtn.textContent = isVisible ? 'Hide' : 'Custom';
    });

    customForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customMinutes = parseInt(document.querySelector("#customMinutes").value) || 0;
        const customSeconds = parseInt(document.querySelector("#customSeconds").value) || 0;

        const isMinutesValid = customMinutes >= 0;
        const isSecondsValid = customSeconds >= 0 && customSeconds < 60;

        if (!isMinutesValid || !isSecondsValid || (customMinutes === 0 && customSeconds === 0)) {
            if (customMinutes === 0 && customSeconds === 0) {
                errorMessage.textContent = "Time should be greater than zero.";
            } else if (customSeconds >= 60) {
                errorMessage.textContent = "Seconds must be less than 60.";
            } else if (customMinutes < 0 || customSeconds < 0) {
                errorMessage.textContent = "Time cannot be negative.";
            } else {
                errorMessage.textContent = "Invalid time input.";
            }
            errorMessage.classList.add("show");
        } else {
            errorMessage.classList.remove("show");
        }
    });

}
