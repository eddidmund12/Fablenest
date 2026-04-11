
const form       = document.getElementById("username-form")   as HTMLFormElement  | null;
const input      = document.getElementById("username")        as HTMLInputElement  | null;
const feedback   = document.getElementById("feedback")        as HTMLParagraphElement | null;
const statusDot  = document.getElementById("status-dot")      as HTMLSpanElement  | null;
const spinner    = document.getElementById("spinner")         as HTMLDivElement   | null;
const submitBtn  = document.getElementById("submit-btn")      as HTMLButtonElement | null;
const btnText    = document.getElementById("btn-text")        as HTMLSpanElement  | null;
const btnSpinner = document.getElementById("btn-spinner")     as HTMLDivElement   | null;

const ruleLength = document.getElementById("rule-length") as HTMLLIElement | null;
const ruleChars  = document.getElementById("rule-chars")  as HTMLLIElement | null;
const ruleStart  = document.getElementById("rule-start")  as HTMLLIElement | null;

// ─── Rule checker ─────────────────────────────────────────────────────────────

function checkRules(value: string): boolean {
  const lengthOk = value.length >= 3 && value.length <= 30;
  const charsOk  = /^[a-zA-Z0-9_]+$/.test(value);
  const startOk  = /^[a-zA-Z]/.test(value);

  setRule(ruleLength, lengthOk);
  setRule(ruleChars,  charsOk);
  setRule(ruleStart,  startOk);

  return lengthOk && charsOk && startOk;
}

function setRule(el: HTMLLIElement | null, passed: boolean) {
  if (!el) return;
  const icon = el.querySelector(".rule-icon");
  if (passed) {
    el.classList.remove("text-slate-600");
    el.classList.add("text-emerald-400");
    if (icon) icon.textContent = "✓";
  } else {
    el.classList.remove("text-emerald-400");
    el.classList.add("text-slate-600");
    if (icon) icon.textContent = "○";
  }
}

// ─── UI state helpers ─────────────────────────────────────────────────────────

function setStatus(state: "idle" | "checking" | "available" | "taken", message: string) {
  if (statusDot) {
    statusDot.className = "status-dot " + state;
  }
  if (feedback) {
    feedback.textContent = message;
    feedback.className = "text-xs " + (
      state === "available" ? "text-emerald-400" :
      state === "taken"     ? "text-red-400"     :
      state === "checking"  ? "text-purple-400"  :
      "text-slate-500"
    );
  }
  if (spinner) {
    spinner.style.display = state === "checking" ? "inline-block" : "none";
  }
}

function setSubmitLoading(loading: boolean) {
  if (!submitBtn || !btnText || !btnSpinner) return;
  submitBtn.disabled = loading;
  btnText.textContent = loading ? "Setting username..." : "Continue";
  btnSpinner.style.display = loading ? "inline-block" : "none";
}

// ─── Debounced availability check ─────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastCheckedUsername = "";
let isAvailable = false;

function debounceCheck(value: string) {
  if (debounceTimer) clearTimeout(debounceTimer);

  const rulesPass = checkRules(value);

  if (!rulesPass) {
    setStatus("idle", "3\u201330 characters, letters, numbers and underscores only.");
    if (submitBtn) submitBtn.disabled = true;
    isAvailable = false;
    return;
  }

  setStatus("checking", "Checking availability...");
  if (submitBtn) submitBtn.disabled = true;

  debounceTimer = setTimeout(() => checkAvailability(value), 500);
}

async function checkAvailability(username: string) {
  if (username === lastCheckedUsername && isAvailable) return;
  lastCheckedUsername = username;

  try {
    const response = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(username)}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (data.available) {
      setStatus("available", "@" + username + " is available!");
      isAvailable = true;
      if (submitBtn) submitBtn.disabled = false;
    } else {
      setStatus("taken", "@" + username + " is already taken.");
      isAvailable = false;
      if (submitBtn) submitBtn.disabled = true;
    }
  } catch (err) {
    console.error("Username check failed:", err);
    setStatus("idle", "Could not check availability. Try again.");
    isAvailable = false;
    if (submitBtn) submitBtn.disabled = true;
  }
}

// ─── Input listener ───────────────────────────────────────────────────────────

input?.addEventListener("input", () => {
  const value = input.value.trim();
  if (value === "") {
    checkRules("");
    setStatus("idle", "3\u201330 characters, letters, numbers and underscores only.");
    if (submitBtn) submitBtn.disabled = true;
    isAvailable = false;
    return;
  }
  debounceCheck(value);
});

// ─── Form submit ──────────────────────────────────────────────────────────────

form?.addEventListener("submit", async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  const username = input?.value.trim();

  if (!username || !isAvailable) return;

  setSubmitLoading(true);

  try {
    const response = await fetch(`${API_BASE}/api/auth/set-username`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Username was just taken by someone else, or server error
      setStatus("taken", data.error || "Username unavailable. Please try another.");
      isAvailable = false;
      if (submitBtn) submitBtn.disabled = true;
    } else {
      // Success — go to home page
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error("Set username failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    alert(`Network error: ${msg}`);
  } finally {
    setSubmitLoading(false);
  }
});