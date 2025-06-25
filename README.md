# 🧠 BrainyFetch

**BrainyFetch** is an AI-powered web app that transforms your PDF notes into **concise summaries**, **interactive flashcards**, and **practice quizzes**—all inside a sleek, glassmorphic interface. Perfect for students and lifelong learners who want to **study smarter, not harder**.

---

## ✨ Features

- ⚡ **AI-Powered Summarization**  
  Upload a PDF and get a clear, digestible summary in seconds.

- 🧠 **Auto-Generated Flashcards**  
  Review key concepts with Q&A cards designed to reinforce memory.

- 📝 **Practice Quizzes**  
  Test your understanding with AI-generated multiple-choice questions.

- 💎 **Modern Glassmorphic UI**  
  Responsive, gradient-rich interface with smooth transitions and soft shadows.

- 📥 **Drag & Drop Upload**  
  Seamlessly upload your PDF notes by dropping or clicking.

---

## 🚀 Getting Started

### 🧰 Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/)
- A [Gemini API key](https://makersuite.google.com/app/apikey)

---

### 🔧 Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/brainyfetch.git
cd brainyfetch

# 2. Install backend dependencies
cd server
npm install

# 3. Set up environment variables
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# 4. Start the backend server
node index.js
```

> 💡 Then open `client/index.html` in your browser to use the app.

---

## 🧪 How to Use

1. **Upload PDF:** Drag & drop or click the upload box.
2. **Let AI Work:** See your content processed into a clean summary.
3. **Study Visually:** Flip through flashcards, take quizzes, and boost retention.

---

## 📁 Project Structure

```
brainyfetch/
├── client/            # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/            # Backend (Node.js, Express, Gemini API)
│   ├── index.js
│   └── .env
└── README.md
```

---

## 🛠️ Tech Stack

| Layer     | Tech                                 |
|-----------|--------------------------------------|
| Frontend  | HTML, CSS (Glassmorphism), JavaScript |
| Backend   | Node.js, Express                     |
| AI Engine | Google Gemini API                    |

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss what you'd like to improve.

---

## 📄 License

Licensed under the [MIT License](LICENSE).

---

## 🙌 Acknowledgements

- Inspired by modern learning tools and glassmorphism UI trends.
- Powered by Google’s Gemini API.
- Designed for focused, effective, and beautiful studying.

---

**Study smarter. Study beautifully. BrainyFetch.**
