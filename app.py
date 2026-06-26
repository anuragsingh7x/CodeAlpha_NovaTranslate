# ============================================================
# CodeAlpha Language Translator - Flask Backend
# Author: CodeAlpha Intern
# Description: A web-based language translation tool using
#              Flask and the deep-translator library.
# ============================================================

from flask import Flask, render_template, request, jsonify
from deep_translator import GoogleTranslator
from deep_translator.exceptions import NotValidPayload, RequestError

# Initialize the Flask application
app = Flask(__name__)
app.secret_key = "codealpha_translator_secret_key"

# ────────────────────────────────────────────────────────────
# Supported languages: display name → language code
# These codes are recognized by Google Translate via
# the deep-translator library.
# ────────────────────────────────────────────────────────────
LANGUAGES = {
    "Auto Detect": "auto",
    "English": "en",
    "Hindi": "hi",
    "French": "fr",
    "German": "de",
    "Spanish": "es",
    "Japanese": "ja",
    "Chinese (Simplified)": "zh-CN",
    "Arabic": "ar",
    "Russian": "ru",
    "Korean": "ko",
    "Portuguese": "pt",
    "Italian": "it",
    "Dutch": "nl",
    "Turkish": "tr",
    "Swedish": "sv",
    "Polish": "pl",
    "Bengali": "bn",
    "Urdu": "ur",
    "Greek": "el",
}

# Target languages exclude "Auto Detect" (can't translate *to* auto)
TARGET_LANGUAGES = {k: v for k, v in LANGUAGES.items() if k != "Auto Detect"}


# ────────────────────────────────────────────────────────────
# Route: Home page  (GET)
# ────────────────────────────────────────────────────────────
@app.route("/")
def index():
    """Render the main translation page."""
    return render_template(
        "index.html",
        languages=LANGUAGES,
        target_languages=TARGET_LANGUAGES,
    )


# ────────────────────────────────────────────────────────────
# Route: Translate API  (POST, JSON)
# Receives JSON: { text, source_lang, target_lang }
# Returns  JSON: { translated_text } or { error }
# ────────────────────────────────────────────────────────────
@app.route("/translate", methods=["POST"])
def translate():
    """
    Handle the translation request sent as JSON from the frontend.
    Steps:
      1. Parse the JSON body.
      2. Validate inputs.
      3. Call GoogleTranslator.
      4. Return the result or a descriptive error.
    """
    data = request.get_json(silent=True)

    # ── 1. Validate that we got a JSON body ──────────────────
    if not data:
        return jsonify({"error": "Invalid request. Please send JSON data."}), 400

    text        = data.get("text", "").strip()
    source_lang = data.get("source_lang", "auto").strip()
    target_lang = data.get("target_lang", "en").strip()

    # ── 2. Input validation ──────────────────────────────────
    if not text:
        return jsonify({"error": "Please enter some text to translate."}), 400

    if len(text) > 5000:
        return jsonify({"error": "Text is too long. Maximum 5000 characters allowed."}), 400

    if target_lang not in TARGET_LANGUAGES.values():
        return jsonify({"error": "Invalid target language selected."}), 400

    if source_lang == target_lang and source_lang != "auto":
        return jsonify({"error": "Source and target languages are the same."}), 400

    # ── 3. Perform translation ───────────────────────────────
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated_text = translator.translate(text)

        if not translated_text:
            return jsonify({"error": "Translation returned empty. Please try again."}), 500

        return jsonify({"translated_text": translated_text})

    except NotValidPayload:
        return jsonify({"error": "The text provided is not valid for translation."}), 400

    except RequestError:
        return jsonify({
            "error": "Could not reach the translation service. "
                     "Please check your internet connection and try again."
        }), 503

    except Exception as e:
        # Generic fallback — log the real error on the server side
        app.logger.error(f"Unexpected translation error: {e}")
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500


# ────────────────────────────────────────────────────────────
# Run the Flask dev server
# ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # debug=True gives helpful error pages during development.
    # Set debug=False before deploying to production.
    app.run(debug=True)
