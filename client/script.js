// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const progressBar = document.getElementById('progressBar');
const progress = progressBar.querySelector('.progress');
const contentSection = document.getElementById('content-section');
const summaryDiv = document.getElementById('summary');
const flashcardsDiv = document.getElementById('flashcards');

// Drag & Drop Events
dropArea.addEventListener('click', () => fileElem.click());

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileElem.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file || file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
    }
    uploadPDF(file);
}

function uploadPDF(file) {
    progressBar.style.display = 'block';
    progress.style.width = '0%';
    summaryDiv.innerHTML = '<p>Processing your PDF...</p>';
    flashcardsDiv.innerHTML = '';
    contentSection.style.display = 'block';

    const formData = new FormData();
    formData.append('pdf', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/upload', true);

    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            progress.style.width = percent + '%';
        }
    };

    xhr.onload = function () {
        progressBar.style.display = 'none';
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);

                // Show summary
                if (data.summary) {
                    summaryDiv.innerHTML = `<p>${data.summary}</p>`;
                } else {
                    summaryDiv.innerHTML = `<span style="color:red;">No summary found.</span>`;
                }

                // Show flashcards (with 3D flip)
                if (data.flashcards && data.flashcards.length > 0) {
                    flashcardsDiv.innerHTML = '';
                    data.flashcards.forEach(card => {
                        const cardDiv = document.createElement('div');
                        cardDiv.className = 'flashcard';
                        cardDiv.innerHTML = `
                            <div class="flashcard-inner">
                                <div class="flashcard-front">
                                    <div class="question">${card.question}</div>
                                </div>
                                <div class="flashcard-back">
                                    <div class="answer">${card.answer}</div>
                                </div>
                            </div>
                        `;
                        cardDiv.addEventListener('click', () => {
                            cardDiv.classList.toggle('flipped');
                        });
                        flashcardsDiv.appendChild(cardDiv);
                    });
                } else {
                    flashcardsDiv.innerHTML = '<p>No flashcards generated.</p>';
                }

            } catch (err) {
                summaryDiv.innerHTML = '<span style="color:red;">Failed to parse server response.</span>';
            }
        } else {
            summaryDiv.innerHTML = '<span style="color:red;">Failed to process PDF. Please try again.</span>';
        }
        
        contentSection.style.display = 'block';
    };

    xhr.onerror = function () {
        console.error('Network error occurred');
        progressBar.style.display = 'none';
        summaryDiv.innerHTML = '<span style="color:red;">Network error. Please check if the server is running.</span>';
        contentSection.style.display = 'block';
    };

    xhr.ontimeout = function () {
        console.error('Request timed out');
        progressBar.style.display = 'none';
        summaryDiv.innerHTML = '<span style="color:red;">Request timed out. Please try again.</span>';
        contentSection.style.display = 'block';
    };

    // Set timeout to 2 minutes
    xhr.timeout = 120000;
    
    xhr.send(formData);
}

// Function to flip flashcards
function flipCard(cardElement) {
    cardElement.classList.toggle('flipped');
}

// Test server connection on page load
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/health')
        .then(response => response.json())
        .then(data => {
            console.log('✅ Server connection successful:', data);
        })
        .catch(error => {
            console.error('❌ Server connection failed:', error);
            console.log('Make sure to run: node index.js');
        });
});


