// Listen for mouseup event to capture selected text
document.addEventListener('mouseup', function() {
    var selection = window.getSelection().toString().trim();
    if (selection) {
        // Send the selected text to the background script
        chrome.runtime.sendMessage({ action: 'highlight', word: selection });
    }
});
