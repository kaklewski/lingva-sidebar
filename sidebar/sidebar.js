const sourceLangSelect = document.getElementById('source-language');
const targetLangSelect = document.getElementById('target-language');
const swapButton = document.getElementById('swap-languages');
const sourceTextArea = document.getElementById('source-text');
const targetTextArea = document.getElementById('target-text');
const clearButton = document.getElementById('clear-source-text');
const copyButton = document.getElementById('copy-target-text');
const loading = document.getElementById('loading');
const API_URL_DOMAIN = 'https://lingva.ml';
let translationTimeout;
let copyTimeout;
let abortController;

function clearSourceText() {
    sourceTextArea.value = '';
    scheduleTranslation();
}

function handleCopying() {
    clearTimeout(copyTimeout);

    navigator.clipboard.writeText(targetTextArea?.value);

    copyButton.setAttribute('data-text-copied', 'true');

    copyTimeout = setTimeout(() => {
        copyButton.setAttribute('data-text-copied', 'false');
    }, 2000);
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
    const sortedLanguages = [...languages].sort((a, b) => {
        if (a.code === 'auto') return -1;
        if (b.code === 'auto') return 1;

        const nameA = browser?.i18n?.getMessage(a.code) || a.name;
        const nameB = browser?.i18n?.getMessage(b.code) || b.name;

        return nameA.localeCompare(nameB, navigator.language, {
            sensitivity: 'base',
        });
    });

    for (const language of sortedLanguages) {
        const option = document.createElement('option');
        option.value = language.code;
        option.textContent =
            browser?.i18n?.getMessage(language.code) || language.name;
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

    abortController = new AbortController();
    const signal = abortController.signal;

    const url = `${API_URL_DOMAIN}/api/v1/${sourceLang}/${targetLang}/${query}`;
    const response = await fetch(url, { signal });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.translation;
}

function setLoadingState(isLoading) {
    const buttons = document.querySelectorAll('button');
    const whitelist = [clearButton];

    buttons.forEach((button) => {
        if (!whitelist.includes(button)) button.disabled = isLoading;
    });
    updateSwapButtonState();

    loading.setAttribute('data-visible', isLoading ? 'true' : 'false');
}

async function translateText() {
    const text = sourceTextArea.value.trim();

    if (!text) {
        targetTextArea.value = '';
        return;
    }

    setLoadingState(true);

    try {
        const translation = await fetchTranslation(
            text,
            sourceLangSelect.value,
            targetLangSelect.value,
        );

        targetTextArea.value = translation;
    } catch (error) {
        if (error.name === 'AbortError') return;

        console.error('Error fetching translation:', error);
        targetTextArea.value = 'Error fetching translation.';
    } finally {
        setLoadingState(false);
    }
}

function scheduleTranslation() {
    abortController?.abort();
    clearTimeout(translationTimeout);
    translationTimeout = setTimeout(translateText, 500);
}

function swapLanguages() {
    const tempLang = sourceLangSelect.value;
    sourceLangSelect.value = targetLangSelect.value;
    targetLangSelect.value = tempLang;

    sourceTextArea.value = targetTextArea.value;
    targetTextArea.value = '';

    saveConfigurationInStorage();
    scheduleTranslation();
}

browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'translate-text' && message.text) {
        sourceLangSelect.value = 'auto';
        sourceTextArea.value = message.text;
        scheduleTranslation();
    }
});

[sourceLangSelect, targetLangSelect].forEach((select) => {
    select.addEventListener('change', () => {
        scheduleTranslation();
        updateSwapButtonState();
        saveConfigurationInStorage();
    });
});

function applyLocale() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const message = browser.i18n.getMessage(key);

        if (!message) return;

        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.hasAttribute('placeholder')) {
                el.placeholder = message;
                return;
            }
        }

        if (el.hasAttribute('title')) {
            el.title = message;
        } else {
            el.textContent = message;
        }
    });
}

swapButton.addEventListener('click', swapLanguages);
sourceTextArea.addEventListener('input', scheduleTranslation);
clearButton.addEventListener('click', clearSourceText);
copyButton.addEventListener('click', handleCopying);

await populateLanguageSelects();
await loadConfigurationFromStorage();
applyLocale();
updateSwapButtonState();
