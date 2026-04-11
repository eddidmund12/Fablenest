
const counter = document.getElementById("counter");

if (counter instanceof HTMLSpanElement) {
  const counterElement = counter;

  const end = 10000;
  const duration = 1000;
  let startTime: number | null = null;

  function animateCounter(timestamp: number) {
    if (startTime === null) startTime = timestamp;

    const progress = timestamp - startTime;
    const percentage = Math.min(progress / duration, 1);
    const currentNumber = Math.floor(percentage * end);

    counterElement.textContent = currentNumber.toString();

    if (percentage < 1) {
      requestAnimationFrame(animateCounter);
    } else {
      counterElement.textContent = end.toString() + "+";
    }
  }

  window.addEventListener("load", () => {
    requestAnimationFrame(animateCounter);
  });
}


const form = document.getElementById("signup-form");

if (form instanceof HTMLFormElement) {

  const firstName = document.getElementById("first-name") as HTMLInputElement | null;
  const lastName = document.getElementById("last-name") as HTMLInputElement | null;
  const email = document.getElementById("email") as HTMLInputElement | null;
  const password = document.getElementById("password") as HTMLInputElement | null;
  const conPassword = document.getElementById("con-password") as HTMLInputElement | null;
  const agreeCheckbox = document.getElementById("agree") as HTMLInputElement | null;
  const signUpButton = document.getElementById("sign-up") as HTMLButtonElement | null;
  const toggleIcons = document.querySelectorAll<HTMLImageElement>(".toggle-password");


  function showError(input: HTMLInputElement, message: string): void {
    const errorText = input.parentElement?.querySelector<HTMLParagraphElement>(".error");

    if (errorText) {
      errorText.textContent = message;
      errorText.classList.remove("hidden");
    }

    input.classList.add("border-red-500");
  }

  function removeError(input: HTMLInputElement): void {
    const errorText = input.parentElement?.querySelector<HTMLParagraphElement>(".error");

    if (errorText) {
      errorText.textContent = "";
      errorText.classList.add("hidden");
    }

    input.classList.remove("border-red-500");
  }

  function validateName(input: HTMLInputElement): boolean {
    const value = input.value.trim();

    if (value === "") {
      showError(input, "This field is required");
      return false;
    }

    if (value.length < 2) {
      showError(input, "Must be at least 2 characters");
      return false;
    }

    if (/\d/.test(value)) {
      showError(input, "Cannot contain numbers");
      return false;
    }

    removeError(input);
    return true;
  }

  function validateEmail(input: HTMLInputElement): boolean {
    const value = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
      showError(input, "Email is required");
      return false;
    }

    if (!emailPattern.test(value)) {
      showError(input, "Invalid email format");
      return false;
    }

    removeError(input);
    return true;
  }

  function validatePassword(input: HTMLInputElement): boolean {
    const value = input.value;

    if (value === "") {
      showError(input, "Password is required");
      return false;
    }

    if (value.length < 8) {
      showError(input, "Must be at least 8 characters");
      return false;
    }

    removeError(input);
    return true;
  }

  function validateConfirmPassword(): boolean {
    if (!password || !conPassword) return true;

    if (conPassword.value === "") {
      showError(conPassword, "Please confirm your password");
      return false;
    }

    if (password.value !== conPassword.value) {
      showError(conPassword, "Passwords do not match");
      return false;
    }

    removeError(conPassword);
    return true;
  }

  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const parent = icon.parentElement;
      if (!parent) return;

      const input = parent.querySelector<HTMLInputElement>("input");
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        icon.src = "img/eye.webp";
      } else {
        input.type = "password";
        icon.src = "img/eye-blind.webp";
      }
    });
  });

  if (firstName) {
    firstName.addEventListener("blur", () => validateName(firstName));
  }

  if (lastName) {
    lastName.addEventListener("blur", () => validateName(lastName));
  }

  if (email) {
    email.addEventListener("blur", () => validateEmail(email));
  }

  if (password) {
    password.addEventListener("blur", () => validatePassword(password));
  }

  if (conPassword) {
    conPassword.addEventListener("blur", validateConfirmPassword);
  }

  form.addEventListener("submit", (e: Event) => {
    e.preventDefault();

    let isValid = true;

    if (firstName) isValid = validateName(firstName) && isValid;
    if (lastName) isValid = validateName(lastName) && isValid;
    if (email) isValid = validateEmail(email) && isValid;
    if (password) isValid = validatePassword(password) && isValid;
    if (conPassword) isValid = validateConfirmPassword() && isValid;

    if (isValid) {
      alert("Form submitted successfully!");
      form.reset();
    }
  });

}
