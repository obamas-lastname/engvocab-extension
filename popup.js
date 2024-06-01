// Function to fetch definition from the Dictionary API
async function fetchDefinition(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (data && data.length > 0) {
            const definitions = data[0].meanings.map(meaning => meaning.definitions.map(def => def.definition)).flat();
            // Join the definitions and split by semicolon to keep the first part only
            const firstDefinition = definitions.join('; ').split(';')[0];
            return firstDefinition;
        } else {
            throw new Error('No definitions found.');
        }
    } catch (error) {
        console.error('Definition fetch error:', error);
        return 'Definition not available';
    }
}

// Function to display words in the table
async function displayWords(words) {
    const tbody = document.getElementById('wordList');
    tbody.innerHTML = '';

    for (const wordObj of words) {
        const tr = document.createElement('tr');
        
        // Create cell for word
        const tdWord = document.createElement('td');
        tdWord.textContent = wordObj.word;
        tdWord.classList.add('word');
        tr.appendChild(tdWord);

        // Create cell for definition (initially empty)
        const tdDefinition = document.createElement('td');
        tdDefinition.textContent = wordObj.definition || 'Fetching definition...';
        tdDefinition.classList.add('definition');
        tr.appendChild(tdDefinition);
        
        // Add row to table
        tbody.appendChild(tr);

        // If the definition is not available, fetch the definition and update the definition cell
        if (!wordObj.definition) {
            const definition = await fetchDefinition(wordObj.word);
            tdDefinition.textContent = definition;
            // Save the definition
            chrome.runtime.sendMessage({
                action: 'saveDefinition',
                word: wordObj.word,
                definition: definition
            });
        }
    }
}

function convertToCSV(words) {
    const rows = [
        ["Word", "Definition"],
        ...words.map(wordObj => [wordObj.word, wordObj.definition || ''])
    ];

    return rows.map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup loaded.');

    // Load and display stored words
    chrome.runtime.sendMessage({ action: 'getWords' }, (response) => {
        console.log('Words received from background:', response.words);
        displayWords(response.words);
    });

    // Add event listener for clear button
    document.getElementById('clearButton').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearWords' }, () => {
            // Clear the table when words are cleared
            document.getElementById('wordList').innerHTML = '';
        });
    });

    // Add event listener for download button
    document.getElementById('downloadButton').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'getWords' }, (response) => {
            if (response.words) {
                const csvContent = convertToCSV(response.words);
                downloadCSV(csvContent, 'highlighted_words.csv');
            }
        });
    });
});
