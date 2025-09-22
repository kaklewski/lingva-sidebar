const sourceLangSelect = document.getElementById('source-language');
const targetLangSelect = document.getElementById('target-language');
const swapButton = document.getElementById('swap-languages');
const sourceTextArea = document.getElementById('source-text');
const targetTextArea = document.getElementById('target-text');
const clearButton = document.getElementById('clear-source-text');
const copyButton = document.getElementById('copy-target-text');
const API_URL_DOMAIN = 'https://lingva.ml';
let translationTimeout;

function clearSourceText() {
    sourceTextArea.value = '';
    scheduleTranslation();
}

function copyTargetText() {
    if (!targetTextArea.value) return;

    navigator.clipboard.writeText(targetTextArea.value);
}

async function saveConfigurationInStorage() {
    const config = {
        sourceLang: sourceLangSelect.value,
        targetLang: targetLangSelect.value,
    };
    await browser.storage.local.set({ config });
}

async function loadConfigurationFromStorage() {
    const { config } = await browser.storage.local.get('config');

    sourceLangSelect.value = config?.sourceLang || 'auto';
    targetLangSelect.value = config?.targetLang || 'en';
}

async function fetchLanguages(type) {
    const response = await fetch(`${API_URL_DOMAIN}/api/v1/languages/${type}`);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.languages;
}

function appendOptions(selectElement, languages) {
    for (const language of languages) {
        const option = document.createElement('option');
        option.value = language.code;
        option.textContent = language.name;
        selectElement.appendChild(option);
    }
}

async function populateLanguageSelects() {
    try {
        const { languages: languagesInStorage } =
            await browser.storage.session.get('languages');

        const sourceLanguages =
            languagesInStorage?.source || (await fetchLanguages('source'));
        const targetLanguages =
            languagesInStorage?.target || (await fetchLanguages('target'));

        appendOptions(sourceLangSelect, sourceLanguages);
        appendOptions(targetLangSelect, targetLanguages);

        if (!languagesInStorage) {
            const languages = {
                source: sourceLanguages,
                target: targetLanguages,
            };
            await browser.storage.session.set({ languages });
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
    }
}

function updateSwapButtonState() {
    swapButton.disabled = sourceLangSelect.value === 'auto';
}

async function fetchTranslation(text, sourceLang, targetLang) {
    const query = encodeURIComponent(text.trim());
    if (!query) return '';

    const url = `${API_URL_DOMAIN}/api/v1/${sourceLang}/${targetLang}/${query}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.translation;
}

async function translateText() {
    const text = sourceTextArea.value.trim();

    if (!text) {
        targetTextArea.value = '';
        return;
    }

    try {
        targetTextArea.value += '...';
        copyButton.disabled = true;
        clearButton.disabled = true;

        const translation = await fetchTranslation(
            text,
            sourceLangSelect.value,
            targetLangSelect.value,
        );

        targetTextArea.value = translation;
        copyButton.disabled = false;
        clearButton.disabled = false;
    } catch (error) {
        console.error('Error fetching translation:', error);
        targetTextArea.value = 'Error fetching translation.';
    }
}

function scheduleTranslation() {
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(translateText, 750);
}

function swapLanguages() {
    const tempLang = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = tempLang;

    sourceTextArea.value = targetTextArea.value;
    targetTextArea.value = '';

    scheduleTranslation();
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'translate-text' && message.text) {
        sourceTextArea.value = message.text;
        scheduleTranslation();
    }
});

[sourceLangSelect, targetLangSelect].forEach((select) => {
    select.addEventListener('change', () => {
        translateText();
        updateSwapButtonState();
        saveConfigurationInStorage();
    });
});

swapButton.addEventListener('click', swapLanguages);
sourceTextArea.addEventListener('input', scheduleTranslation);
clearButton.addEventListener('click', clearSourceText);
copyButton.addEventListener('click', copyTargetText);

await populateLanguageSelects();
await loadConfigurationFromStorage();
updateSwapButtonState();
