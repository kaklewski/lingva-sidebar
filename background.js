function createContextMenu() {
    browser.contextMenus.create({
        id: 'translate-selection',
        title: 'Translate selection with Lingva',
        contexts: ['selection'],
    });
}

async function handleContextMenuClick({ menuItemId, selectionText }) {
    if (menuItemId !== 'translate-selection') return;

    if (selectionText) {
        browser.storage.local.set({ textToTranslate: selectionText });
        browser.sidebarAction.open();
    }
}

browser.runtime.onInstalled.addListener(createContextMenu);
browser.contextMenus.onClicked.addListener(handleContextMenuClick);
