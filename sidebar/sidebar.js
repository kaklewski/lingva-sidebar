const sourceLangSelect = document.getElementById('source-language');
const targetLangSelect = document.getElementById('target-language');
const swapButton = document.getElementById('swap-languages');
const sourceTextArea = document.getElementById('source-text');
const targetTextArea = document.getElementById('target-text');
const API_URL_DOMAIN = 'https://lingva.ml';
let translationTimeout;

async function getLanguages(type) {
    try {
        const response = await fetch(
            `${API_URL_DOMAIN}/api/v1/languages/${type}`,
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const languages = data.languages;
        return languages;
    } catch (error) {
        console.error('Error fetching languages:', error);
    }
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
    const sourceLanguages = await getLanguages('source');
    const targetLanguages = await getLanguages('target');

    appendOptions(sourceLangSelect, sourceLanguages);
    appendOptions(targetLangSelect, targetLanguages);
}

function updateSwapButtonState() {
    swapButton.disabled = sourceLangSelect.value === 'auto';
}

async function handleTextTranslation() {
    const query = encodeURIComponent(sourceTextArea.value.trim());

    if (query.length === 0) {
        targetTextArea.value = '';
        return;
    }

    try {
        targetTextArea.value = 'Translating...';
        const url = `${API_URL_DOMAIN}/api/v1/${sourceLangSelect.value}/${targetLangSelect.value}/${query}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        targetTextArea.value = data.translation;
    } catch (error) {
        console.error('Error fetching translation:', error);
        targetTextArea.value = 'Error fetching translation.';
    }
}

function runTranslation() {
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(handleTextTranslation, 500);
}

function swapLanguages() {
    const tempLang = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = tempLang;

    sourceTextArea.value = targetTextArea.value;
    targetTextArea.value = '';

    runTranslation();
}

swapButton.addEventListener('click', swapLanguages);
sourceTextArea.addEventListener('input', runTranslation);
sourceLangSelect.addEventListener('change', () => {
    handleTextTranslation();
    updateSwapButtonState();
});
targetLangSelect.addEventListener('change', () => {
    handleTextTranslation();
    updateSwapButtonState();
});

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'translate-text' && message.text) {
        sourceTextArea.value = message.text;
        runTranslation();
    }
});

await populateLanguageSelects();
updateSwapButtonState();
