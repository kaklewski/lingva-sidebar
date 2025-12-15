<p align="center">
  <img src="logo.svg" alt="Amnesia Logo" width="128"/>
</p>

# Lingva Translate in Sidebar

A **Firefox extension** that lets you use [**Lingva Translate**](https://github.com/thedaviddelta/lingva-translate) right in your browser’s sidebar. You can quickly translate text without leaving the page you’re on.

This add-on is an unofficial client for **Lingva**, an open-source alternative front-end for Google Translate that works without ads or tracking.

## ✨ Features

-   Works directly in the Firefox sidebar — always accessible
-   Translate text between over 100 languages via Lingva
-   Translate selected text directly from any webpage
-   Lightweight, simple, and privacy-friendly

## 📦 Installation

Amnesia is available on the official Mozilla Add-ons store:  
[**Get it on Firefox Add-ons**](https://addons.mozilla.org/addon/lingva-in-sidebar/)

## 🤝 Contributing

Contributions are welcome! You can help by:

### 📝 Code & UI

-   Fixing bugs or improving the UI.
-   Suggesting new features or reporting issues via the [issue tracker](https://github.com/kaklewski/lingva-sidebar/issues).

Please follow **Conventional Commits** when creating commits.

### 🌐 Translations

The extension currently supports **English 🇬🇧**, **Polish 🇵🇱** and **French 🇫🇷**. Contributions for additional languages are welcome!

To add a translation:

1. Fork this repository.
2. Copy the file `_locales/en/messages.json` into a new folder named after your target locale code (for example: `_locales/de/messages.json` for German, `_locales/it/messages.json` for Italian).
3. Translate the values of the `"message"` and `"description"` fields for each entry.
4. You can translate language names by adding them to the new locale file. Use the language code as the key (for example: `"de": { "message": "Deutsch"}`). You can find the full list of language codes in the Polish translation file `_locales/pl/messages.json`.
5. Submit a pull request.

For reference, see [MDN – Internationalization in extensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization).

## 💻 Development

### Setup (for contributors)

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Install [web-ext](https://github.com/mozilla/web-ext) globally:

    ```bash
    npm install --global web-ext
    ```

3. Clone and open the repository:
    ```bash
    git clone https://github.com/kaklewski/amnesia
    cd amnesia
    ```
4. Run the extension in Firefox using `web-ext`:

    ```bash
    web-ext run
    ```

    On Linux, if you use the [Flatpak](https://flatpak.org/) version of Firefox, run:

    ```bash
    web-ext run --firefox=flatpak:org.mozilla.firefox
    ```

### Linting

Before building the extension, check for common issues:

```bash
web-ext lint
```

### Building

To create a distributable package:

```bash
web-ext build
```

This will generate a `.zip` file in the `web-ext-artifacts` folder.

## 🎨 Credits

-   **Main icon** – [Lingva Translate Logo](https://github.com/thedaviddelta/lingva-translate/blob/main/public/logo.svg) (AGPL v3 License)
-   **UI icons** – [Arrows Right Left](https://tabler.io/icons/icon/arrows-right-left), [X](https://tabler.io/icons/icon/x) & [Copy](https://tabler.io/icons/icon/copy) from [Tabler Icons](https://tabler.io/icons) (MIT License)
