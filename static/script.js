// ============================================================
// CodeAlpha Language Translator – Frontend JavaScript
// Handles: translation fetch, counters, swap, copy,
//          text-to-speech, dark mode toggle, keyboard shortcut
// ============================================================

// ── Grab DOM elements ────────────────────────────────────────
const inputText    = document.getElementById("inputText");
const outputText   = document.getElementById("outputText");
const sourceLang   = document.getElementById("sourceLang");
const targetLang   = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const clearBtn     = document.getElementById("clearBtn");
const copyBtn      = document.getElementById("copyBtn");
const ttsBtn       = document.getElementById("ttsBtn");
const swapBtn      = document.getElementById("swapBtn");
const charCount    = document.getElementById("charCount");
const wordCount    = document.getElementById("wordCount");
const outCharCount = document.getElementById("outCharCount");
const errorBox     = document.getElementById("errorBox");
const errorMsg     = document.getElementById("errorMsg");
const loadingOverlay = document.getElementById("loadingOverlay");
const themeToggle  = document.getElementById("themeToggle");
const themeIcon    = document.getElementById("themeIcon");
const htmlRoot     = document.documentElement;

// ── 1. Character & Word Counter ──────────────────────────────
/**
 * Update the character and word counters below the input textarea
 * every time the user types.
 */
function updateInputCounters() {
  const text   = inputText.value;
  const chars  = text.length;
  const words  = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  charCount.textContent = `${chars} / 5000 chars`;
  wordCount.textContent = `${words} word${words !== 1 ? "s" : ""}`;

  // Warn user when approaching limit
  charCount.style.color = chars > 4800 ? "var(--clr-error-text)" : "";
}

inputText.addEventListener("input", updateInputCounters);

// ── 2. Show / Hide error box ─────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
  errorMsg.textContent = "";
}

// ── 3. Translation (AJAX fetch to /translate) ────────────────
/**
 * Send text + language codes to the Flask backend,
 * then populate the output textarea with the result.
 */
async function translateText() {
  const text   = inputText.value.trim();
  const source = sourceLang.value;
  const target = targetLang.value;

  // Basic frontend validation
  if (!text) {
    showError("Please enter some text before translating.");
    inputText.focus();
    return;
  }

  // Hide previous errors, disable button, show spinner
  hideError();
  translateBtn.disabled = true;
  loadingOverlay.classList.remove("hidden");
  outputText.value = "";
  copyBtn.disabled = true;
  ttsBtn.disabled  = true;
  outCharCount.textContent = "";

  try {
    // POST request to Flask /translate endpoint
    const response = await fetch("/translate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        text:        text,
        source_lang: source,
        target_lang: target,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // The server returned an error (4xx or 5xx)
      showError(data.error || "Translation failed. Please try again.");
      return;
    }

    // Success – populate the output area
    outputText.value = data.translated_text;
    copyBtn.disabled = false;
    ttsBtn.disabled  = false;
    outCharCount.textContent = `${data.translated_text.length} chars`;

  } catch (networkError) {
    // Network issue (no internet, server down, etc.)
    showError("Network error: could not reach the server. Please check your connection.");
  } finally {
    // Always hide the spinner and re-enable the button
    loadingOverlay.classList.add("hidden");
    translateBtn.disabled = false;
  }
}

translateBtn.addEventListener("click", translateText);

// ── 4. Keyboard Shortcut: Ctrl+Enter to translate ────────────
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    translateText();
  }
});

// ── 5. Clear Button ──────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  inputText.value   = "";
  outputText.value  = "";
  copyBtn.disabled  = true;
  ttsBtn.disabled   = true;
  outCharCount.textContent = "";
  hideError();
  updateInputCounters();
  inputText.focus();
});

// ── 6. Copy Output Button ────────────────────────────────────
copyBtn.addEventListener("click", async () => {
  const text = outputText.value;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    // Brief visual feedback on the button
    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
    copyBtn.style.color = "var(--clr-success)";
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
      copyBtn.style.color = "";
    }, 2000);
  } catch {
    // Fallback for older browsers
    outputText.select();
    document.execCommand("copy");
  }
});

// ── 7. Text-to-Speech Button ─────────────────────────────────
/**
 * Use the browser's built-in Web Speech API to read the
 * translated text aloud in the target language.
 */
ttsBtn.addEventListener("click", () => {
  const text = outputText.value;
  if (!text) return;

  // Stop any currently playing speech
  window.speechSynthesis.cancel();

  const utterance   = new SpeechSynthesisUtterance(text);
  utterance.lang    = targetLang.value;   // e.g. "hi", "fr", "de"
  utterance.rate    = 0.95;
  utterance.pitch   = 1;

  utterance.onstart = () => {
    ttsBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
    ttsBtn.style.color = "var(--clr-error-text)";
  };

  utterance.onend = utterance.onerror = () => {
    ttsBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
    ttsBtn.style.color = "";
  };

  // If already speaking, the button acts as Stop
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    return;
  }

  window.speechSynthesis.speak(utterance);
});

// ── 8. Swap Languages Button ─────────────────────────────────
/**
 * Exchange the source and target language selections.
 * If source is "auto", we only swap the UI dropdowns
 * (we can't meaningfully swap text back from auto).
 */
swapBtn.addEventListener("click", () => {
  const sourceVal = sourceLang.value;
  const targetVal = targetLang.value;

  // Find the matching option in the source dropdown for target's value
  const sourceOptions = Array.from(sourceLang.options).map((o) => o.value);
  if (sourceOptions.includes(targetVal)) {
    sourceLang.value = targetVal;
  }

  // Find the matching option in the target dropdown for source's value
  const targetOptions = Array.from(targetLang.options).map((o) => o.value);
  if (targetOptions.includes(sourceVal)) {
    targetLang.value = sourceVal;
  }

  // Also swap the textarea text if both are populated
  const inputVal  = inputText.value;
  const outputVal = outputText.value;

  if (outputVal) {
    inputText.value  = outputVal;
    outputText.value = inputVal;
    updateInputCounters();
    if (!outputVal) {
      copyBtn.disabled = true;
      ttsBtn.disabled  = true;
      outCharCount.textContent = "";
    }
  }
});

// ── 9. Dark Mode Toggle ──────────────────────────────────────
/**
 * Toggle between light and dark themes.
 * The chosen preference is saved to localStorage so it
 * persists across page loads.
 */
function applyTheme(theme) {
  htmlRoot.setAttribute("data-theme", theme);
  if (theme === "dark") {
    themeIcon.className = "fa-solid fa-sun";
  } else {
    themeIcon.className = "fa-solid fa-moon";
  }
  localStorage.setItem("ca_theme", theme);
}

// Load saved theme on page start (default: light)
const savedTheme = localStorage.getItem("ca_theme") || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = htmlRoot.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

// ── Initialise counters on page load ────────────────────────
updateInputCounters();
