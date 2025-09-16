async function loadLingva(text) {
  const iframe = document.getElementById('lingva');
  const languageCodeLong = await browser.i18n.getUILanguage();
  const languageCodeShort = languageCodeLong.split('-')[0];
  const textToTranslate = encodeURIComponent(text);
  iframe.src = `https://lingva.thedaviddelta.com/auto/${languageCodeShort}/${textToTranslate}`;
}

function onVisibilityChange() {
  switch (document.visibilityState) {
    case 'visible':
      browser.storage.local.get('textToTranslate').then((data) => {
        if (data.textToTranslate) {
          loadLingva(data.textToTranslate);
        }
      });
      break;
    case 'hidden':
      browser.storage.local.remove('textToTranslate');
      break;
    default:
      break;
  }
}

function onStorageChange(changes, area) {
  if (area === 'local' && changes.textToTranslate) {
    const newText = changes.textToTranslate.newValue;
    if (newText) {
      loadLingva(newText);
    }
  }
}

document.addEventListener('visibilitychange', onVisibilityChange);
browser.storage.onChanged.addListener(onStorageChange);
