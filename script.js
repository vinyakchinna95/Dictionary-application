document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('inp_word');
    const button = document.querySelector('.search_box button');
    const wordElement = document.querySelector('.word h3');
    const posElement = document.querySelector('.details p:nth-child(1)');
    const phoneticElement = document.querySelector('.details p:nth-child(2)');
    const meaningElement = document.querySelector('.meaning');
    const exampleElement = document.querySelector('.example');
    const audioButton = document.querySelector('.word button');
    let voices = [];

    function loadVoices() {
        voices = speechSynthesis.getVoices();
        console.log(voices);
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }

    button.addEventListener('click', () => {
        const word = input.value.trim();
        if (word) {
            fetchMeaning(word);
        }
        // Remove the previous event listener for the audio button
        audioButton.removeEventListener('click', playAudio);
    });

    function playAudio() {
        const femaleVoice = voices.find(voice => voice.name === "Google italiano Female" || voice.name.includes("Female") || voice.gender === "female");

        let utterance = new SpeechSynthesisUtterance(`${wordElement.textContent} ${meaningElement.textContent}`);
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        } else {
            console.warn("Female voice not found. Using default voice.");
        }

        speechSynthesis.speak(utterance);
    }

    async function fetchMeaning(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) {
                throw new Error('Word not found');
            }
            const data = await response.json();
            const wordData = data[0];

            wordElement.textContent = wordData.word;
            posElement.textContent = wordData.meanings[0].partOfSpeech;
            phoneticElement.textContent = wordData.phonetics[0].text;
            meaningElement.textContent = wordData.meanings[0].definitions[0].definition;
            exampleElement.textContent = wordData.meanings[0].definitions[0].example || '';

            if (wordData.phonetics[0].audio) {
                audioButton.style.display = 'block';
                // Add a new event listener for the audio button
                audioButton.addEventListener('click', playAudio);
            } else {
                audioButton.style.display = 'none';
            }

        } catch (error) {
            wordElement.textContent = 'Not Found';
            posElement.textContent = '';
            phoneticElement.textContent = '';
            meaningElement.textContent = 'Sorry, we could not find the word you were looking for.';
            exampleElement.textContent = '';
            audioButton.style.display = 'none';
        }
    }
});
