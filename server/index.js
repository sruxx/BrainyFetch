// Import required packages
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up file upload with multer
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to parse flashcards from text
function parseFlashcards(text) {
  const flashcards = [];
  const lines = text.split('\n');
  let currentQ = '';
  let currentA = '';
  
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('Q:') || line.startsWith('**Q:')) {
      if (currentQ && currentA) {
        flashcards.push({ question: currentQ, answer: currentA });
      }
      currentQ = line.replace(/^\*?\*?Q:\s*/, '').replace(/\*?\*?$/, '');
      currentA = '';
    } else if (line.startsWith('A:') || line.startsWith('**A:')) {
      currentA = line.replace(/^\*?\*?A:\s*/, '').replace(/\*?\*?$/, '');
    } else if (currentA && line && !line.startsWith('Q:') && !line.startsWith('**Q:')) {
      currentA += ' ' + line;
    }
  }
  
  // Add the last flashcard
  if (currentQ && currentA) {
    flashcards.push({ question: currentQ, answer: currentA });
  }
  
  return flashcards;
}

// Upload endpoint for PDF
app.post('/upload', upload.single('pdf'), async (req, res) => {
  console.log('📄 PDF upload received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  const filePath = req.file.path;
  console.log('📁 File saved at:', filePath);

  try {
    // Step 1: Read and extract text from uploaded PDF
    console.log('🔍 Extracting text from PDF...');
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const fullText = pdfData.text;
    
    console.log('📝 Extracted text length:', fullText.length);
    
    if (!fullText.trim()) {
      throw new Error('No text content found in PDF');
    }

    // Step 2: Prepare Gemini prompt for summary
    console.log('🤖 Generating summary with Gemini...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const summaryPrompt = `
Please provide a comprehensive summary of the following PDF content in 150-200 words. Focus on the main points, key concepts, and important details:

Content:
${fullText.substring(0, 8000)} // Limit text to avoid token limits
    `;

    // Step 3: Generate summary
    const summaryResult = await model.generateContent(summaryPrompt);
    const summary = summaryResult.response.text();
    
    console.log('✅ Summary generated');

    // Step 4: Generate flashcards
    console.log('🎴 Generating flashcards...');
    const flashcardPrompt = `
Based on the following content, create exactly 5 flashcards for studying. Format each flashcard as:

Q: [Question]
A: [Answer]

Make sure the questions test important concepts and the answers are concise but informative.

Content:
${fullText.substring(0, 6000)}
    `;

    const flashcardResult = await model.generateContent(flashcardPrompt);
    const flashcardText = flashcardResult.response.text();
    const flashcards = parseFlashcards(flashcardText);
    
    console.log('✅ Flashcards generated:', flashcards.length);

    // Step 5: Clean up the uploaded file
    fs.unlinkSync(filePath);
    console.log('🗑️ Temporary file cleaned up');

    // Step 6: Send response back to frontend
    res.json({ 
      summary: summary,
      flashcards: flashcards,
      success: true
    });

  } catch (err) {
    console.error('❌ Error processing PDF:', err.message);
    
    // Clean up file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ 
      error: 'Failed to process the PDF: ' + err.message,
      success: false 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not found in environment variables');
  } else {
    console.log('✅ Gemini API key configured');
  }
});