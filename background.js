chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'highlight') {
        chrome.storage.local.get(['words'], (result) => {
            const words = result.words || [];
            if (!words.some(wordObj => wordObj.word === message.word)) {
                words.push({ word: message.word, definition: null });
                chrome.storage.local.set({ words: words }, () => {
                    console.log('Word saved:', message.word);
                });
            }
        });
    } else if (message.action === 'getWords') {
        chrome.storage.local.get(['words'], (result) => {
            sendResponse({ words: result.words || [] });
        });
        return true; // Will respond asynchronously
    } else if (message.action === 'clearWords') {
        chrome.storage.local.set({ words: [] }, () => {
            console.log('Words cleared.');
            sendResponse();
        });
        return true; // Will respond asynchronously
    } else if (message.action === 'saveDefinition') {
        chrome.storage.local.get(['words'], (result) => {
            const words = result.words || [];
            const wordObj = words.find(w => w.word === message.word);
            if (wordObj) {
                wordObj.definition = message.definition;
                chrome.storage.local.set({ words: words }, () => {
                    console.log('Definition saved for:', message.word);
                });
            }
        });
    }
});
