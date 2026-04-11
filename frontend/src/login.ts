const API_BASE = window.location.hostname === "127.0.0.1" || 
                 window.location.hostname === "localhost"
  ? "http://127.0.0.1:5000"
  : "https://your-api.onrender.com";

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
  window.addEventListener("load", () => { requestAnimationFrame(animateCounter); });
}

document.querySelectorAll<HTMLImageElement>(".toggle-password").forEach((icon) => {
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

function showError(input: HTMLInputElement, message: string): void {
  const errorText = input.parentElement?.querySelector<HTMLParagraphElement>(".error");
  if (errorText) { errorText.textContent = message; errorText.classList.remove("hidden"); }
  input.classList.add("border-red-500");
}
function removeError(input: HTMLInputElement): void {
  const errorText = input.parentElement?.querySelector<HTMLParagraphElement>(".error");
  if (errorText) { errorText.textContent = ""; errorText.classList.add("hidden"); }
  input.classList.remove("border-red-500");
}
function validateName(input: HTMLInputElement): boolean {
  const value = input.value.trim();
  if (value === "") { showError(input, "This field is required"); return false; }
  if (value.length < 2) { showError(input, "Must be at least 2 characters"); return false; }
  if (/\d/.test(value)) { showError(input, "Cannot contain numbers"); return false; }
  removeError(input);
  return true;
}
function validateEmail(input: HTMLInputElement): boolean {
  const value = input.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value === "") { showError(input, "Email is required"); return false; }
  if (!emailPattern.test(value)) { showError(input, "Invalid email format"); return false; }
  removeError(input);
  return true;
}
function validatePassword(input: HTMLInputElement): boolean {
  const value = input.value;
  if (value === "") { showError(input, "Password is required"); return false; }
  if (value.length < 8) { showError(input, "Must be at least 8 characters"); return false; }
  removeError(input);
  return true;
}

const onLoginPage  = document.getElementById("first-name") === null
                  && document.getElementById("email") !== null;

const onSignupPage = document.getElementById("first-name") !== null;

if (onLoginPage) {
  const form     = document.getElementById("signup-form") as HTMLFormElement  | null;
  const email    = document.getElementById("email")       as HTMLInputElement  | null;
  const password = document.getElementById("password")    as HTMLInputElement  | null;
  const button   = document.getElementById("sign-up")     as HTMLButtonElement | null;

  if (!form || !email || !password) {
    console.error("Login: required elements not found");
    // return;
  } 
  else {
  
    form.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
    email.addEventListener("blur", () => validateEmail(email));
    password.addEventListener("blur", () => validatePassword(password));

    form.addEventListener("submit", async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      let isValid = true;
      isValid = validateEmail(email) && isValid;
      isValid = validatePassword(password) && isValid;
      if (!isValid) return;

      if (button) { button.disabled = true; button.textContent = "Logging in..."; }

      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.error || "Login failed. Please try again.");
        } else {
            window.location.href = "index.html";
        }
      } catch (err) {
        console.error("Login error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Network error: ${msg}`);
      } finally {
        if (button) { button.disabled = false; button.textContent = "Log in"; }
      }
    });
    })
  }
}
if (onSignupPage) {
  const form          = document.getElementById("signup-form")  as HTMLFormElement  | null;
  const firstName     = document.getElementById("first-name")   as HTMLInputElement  | null;
  const lastName      = document.getElementById("last-name")    as HTMLInputElement  | null;
  const emailInput    = document.getElementById("email")        as HTMLInputElement  | null;
  const password      = document.getElementById("password")     as HTMLInputElement  | null;
  const conPassword   = document.getElementById("con-password") as HTMLInputElement  | null;
  const agreeCheckbox = document.getElementById("agree")        as HTMLInputElement  | null;
  const signUpButton  = document.getElementById("sign-up")      as HTMLButtonElement | null;
  const otpInput      = form?.querySelector<HTMLInputElement>('input[maxlength="6"]');
  const getOtpBtn = document.getElementById("get-otp-btn") as HTMLButtonElement | null;

  function validateConfirmPassword(): boolean {
    if (!password || !conPassword) return true;
    if (conPassword.value === "") { showError(conPassword, "Please confirm your password"); return false; }
    if (password.value !== conPassword.value) { showError(conPassword, "Passwords do not match"); return false; }
    removeError(conPassword);
    return true;
  }

  firstName?.addEventListener("blur", () => validateName(firstName));
  lastName?.addEventListener("blur",  () => validateName(lastName));
  emailInput?.addEventListener("blur", () => validateEmail(emailInput));
  password?.addEventListener("blur",  () => validatePassword(password));
  conPassword?.addEventListener("blur", validateConfirmPassword);

  // OTP cooldown
  let otpCooldownTimer: ReturnType<typeof setInterval> | null = null;
  const OTP_COOLDOWN_SECONDS = 60;

  function startOtpCooldown() {
    if (!getOtpBtn) return;
    let secondsLeft = OTP_COOLDOWN_SECONDS;
    getOtpBtn.disabled = true;
    getOtpBtn.textContent = `Resend in ${secondsLeft}s`;
    otpCooldownTimer = setInterval(() => {
      secondsLeft--;
      if (getOtpBtn) getOtpBtn.textContent = `Resend in ${secondsLeft}s`;
      if (secondsLeft <= 0) {
        clearInterval(otpCooldownTimer!);
        otpCooldownTimer = null;
        if (getOtpBtn) { getOtpBtn.disabled = false; getOtpBtn.textContent = "Get OTP"; }
      }
    }, 1000);
  }

  // Get OTP
    
  getOtpBtn?.addEventListener("click", async (e: Event) => {
    e.preventDefault();
    e.stopImmediatePropagation()
    console.log("OTP btn clicked, default prevented:", e.defaultPrevented);
    if (!emailInput || !validateEmail(emailInput)) { emailInput?.focus(); return; }

    const email = emailInput.value.trim();
    getOtpBtn.disabled = true;
    getOtpBtn.textContent = "Sending...";
    try {
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to send OTP. Please try again.");
        getOtpBtn.disabled = false;
        getOtpBtn.textContent = "Get OTP";
      } else {
        startOtpCooldown();
        otpInput?.focus();
      }
    } catch (err: unknown) {
    console.error("OTP fetch failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    alert(`Network error: ${message}`);
    if (getOtpBtn) {          // ← make sure this always resets
      getOtpBtn.disabled = false;
      getOtpBtn.textContent = "Get OTP";
    }
    return; 
  }
  });

  // Signup submit
  form?.addEventListener("submit", async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("FORM SUBMITTED")
    let isValid = true;
    if (firstName)   isValid = validateName(firstName)    && isValid;
    if (lastName)    isValid = validateName(lastName)     && isValid;
    if (emailInput)  isValid = validateEmail(emailInput)  && isValid;
    if (password)    isValid = validatePassword(password) && isValid;
    if (conPassword) isValid = validateConfirmPassword()  && isValid;

    if (!otpInput || otpInput.value.trim().length !== 6) {
      alert("Please enter the 6-digit OTP sent to your email.");
      otpInput?.focus();
      isValid = false;
    }

    if (agreeCheckbox && !agreeCheckbox.checked) {
      alert("You must agree to the Terms & Conditions");
      isValid = false;
    }

    if (!isValid) return;

    if (signUpButton) { signUpButton.disabled = true; signUpButton.textContent = "Signing up..."; }

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname:       firstName?.value.trim(),
          lastname:        lastName?.value.trim(),
          middlename:      "",
          email:           emailInput?.value.trim(),
          password:        password?.value,
          confirmpassword: conPassword?.value,
          otp:             otpInput?.value.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Registration failed. Please try again.");
      } else {
        window.location.href = "set-username.html";
      }
    } catch (err) {
      console.error("Signup fetch failed:", err);
      alert("Network error. Please check your connection.");
    } finally {
      if (signUpButton) { signUpButton.disabled = false; signUpButton.textContent = "Sign Up"; }
    }
  });
  
}
