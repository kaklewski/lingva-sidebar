function createContextMenu() {
    browser.contextMenus.create({
        id: 'translate-selection',
        title: 'Translate selected text',
        contexts: ['selection'],
    });
}

async function handleContextMenuClick({ menuItemId, selectionText }) {
    if (menuItemId !== 'translate-selection' || !selectionText) return;

    await browser.sidebarAction.open();

    setTimeout(() => {
        browser.runtime.sendMessage({
            action: 'translate-text',
            text: selectionText,
        });
    }, 250);
}

browser.runtime.onInstalled.addListener(createContextMenu);
browser.contextMenus.onClicked.addListener(handleContextMenuClick);
