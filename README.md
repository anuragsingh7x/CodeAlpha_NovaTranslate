# 🌐 CodeAlpha Language Translator

> **AI Internship Project** — Task 2 | CodeAlpha

A beautiful, fully-functional **Language Translation Web App** built with **Python**, **Flask**, and the **deep-translator** library. Translate text across 19 languages instantly — right from your browser.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🌍 **19 Languages** | English, Hindi, French, German, Spanish, Japanese, Chinese, Arabic, Russian, Korean, and more |
| 🔄 **Swap Languages** | Instantly swap source ↔ target with one click |
| 🔊 **Text-to-Speech** | Listen to the translation using the browser's speech engine |
| 📋 **Copy to Clipboard** | One-click copy of the translated output |
| 🌙 **Dark Mode** | Toggle between light and dark themes (preference saved locally) |
| ⌨️ **Keyboard Shortcut** | Press `Ctrl + Enter` to translate quickly |
| 🔢 **Word & Char Count** | Live counters update as you type |
| ⚡ **Loading Spinner** | Visual feedback while translation is in progress |
| 📱 **Mobile Responsive** | Works on all screen sizes |
| 🛡️ **Error Handling** | Friendly messages for empty input, network errors, invalid languages |

---

## 🛠️ Technologies Used

- **Python 3.10+** — backend language
- **Flask 3.x** — web framework
- **Jinja2** — HTML templating (built into Flask)
- **deep-translator** — Google Translate API wrapper
- **HTML5 / CSS3** — frontend structure and styling
- **JavaScript (Vanilla)** — interactivity, fetch API, TTS
- **Font Awesome 6** — icons
- **Google Fonts** — Inter & Space Grotesk typefaces

---

## 📁 Folder Structure

```
CodeAlpha_LanguageTranslator/
│
├── app.py                  # Flask application (backend logic)
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation
├── .gitignore              # Files excluded from Git
│
├── templates/
│   └── index.html          # Jinja2 HTML template (main UI)
│
├── static/
│   ├── style.css           # All CSS styles
│   └── script.js           # Frontend JavaScript
│
└── screenshots/            # UI screenshots (add after running)
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_LanguageTranslator.git
cd CodeAlpha_LanguageTranslator
```

### 2. Create a virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask server
```bash
python app.py
```

### 5. Open in your browser
Navigate to: **http://127.0.0.1:5000**

---

## 🖼️ Screenshots

> *(Add screenshots to the `screenshots/` folder after running the app.)*

| Light Mode | Dark Mode |
|---|---|
| ![Light](screenshots/light_mode.png) | ![Dark](screenshots/dark_mode.png) |

---

## 📖 How Each File Works

### `app.py`
- The core Flask server.
- Defines two routes:
  - `GET /` — renders `index.html` with the language lists.
  - `POST /translate` — receives JSON `{text, source_lang, target_lang}`, calls `GoogleTranslator`, returns `{translated_text}` or `{error}`.
- Handles all error cases: empty text, oversized input, internet failures, invalid languages.

### `templates/index.html`
- Jinja2 template that Flask renders on page load.
- Uses `{{ url_for(...) }}` to link CSS/JS.
- Loops over the language dictionaries passed by Flask to build the `<select>` dropdowns.

### `static/style.css`
- CSS custom properties (variables) for the entire color and typography system.
- Separate `:root` vs `[data-theme="dark"]` blocks make dark mode a single attribute toggle.
- Fully responsive via CSS Grid and media queries.

### `static/script.js`
- **Translation**: `fetch("/translate", { method:"POST", ... })` — AJAX, no page reload.
- **Counters**: live character and word counts on every keystroke.
- **Swap**: exchanges the two `<select>` values and optionally the textarea contents.
- **Copy**: `navigator.clipboard.writeText(...)` with a fallback.
- **TTS**: `SpeechSynthesisUtterance` using the browser Web Speech API.
- **Dark Mode**: toggles `data-theme` on `<html>` and persists to `localStorage`.

---

## 🚀 Future Improvements

- [ ] Add support for file upload (translate `.txt` or `.pdf` files)
- [ ] Translation history / recent translations
- [ ] Auto-detect language name display (show what was detected)
- [ ] Share translation via link
- [ ] PWA support (offline mode)
- [ ] Rate limiting and usage analytics

---

## 🧑‍💻 Author

**CodeAlpha AI Internship — Task 2**  
Built as part of the Artificial Intelligence Internship program at [CodeAlpha](https://www.codealpha.tech).

---

## 📄 License

This project is created for educational/internship purposes. Feel free to use and modify it.
