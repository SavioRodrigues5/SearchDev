# 🔍 SearchDev

A clean, dark-themed web app that lets you instantly look up any GitHub user's profile, repositories, and README — built with vanilla HTML, CSS, and JavaScript.

---

## 🚀 Features

- Search any GitHub username and view their profile instantly
- Displays avatar, bio, location, and stats (repos, followers, following)
- Lists all public repositories with language and star count
- Renders the user's profile README with full markdown support (including emojis)
- XSS-protected input handling
- Fully responsive — works on mobile, tablet, and desktop
- No frameworks, no build tools, no dependencies

---

## 🛠️ Tech Stack

- HTML5
- CSS3 (CSS Grid, custom properties, sticky layout)
- Vanilla JavaScript (ES6+)
- [GitHub REST API](https://docs.github.com/en/rest) — no API key required
- [Marked.js](https://marked.js.org/) — for markdown rendering

---

## 📁 Project Structure

📁 Project Structure
SearchDev/
│
├── index.html      # App structure and search UI
├── style.css       # Dark theme, layout, responsive breakpoints
└── app.js          # API calls, DOM rendering, event listeners

---

## ⚙️ How It Works

1. User enters a GitHub username and clicks **Analyze** (or presses Enter)
2. The app makes two parallel API calls to fetch the user's profile and repositories
3. A third call attempts to fetch the profile README — if none exists, a fallback message is shown
4. The README is decoded from Base64, parsed as markdown, and rendered on the right-hand side
5. All user-supplied content is sanitised before being injected into the DOM

---

## 🏃 Getting Started

No install needed. Just clone and open:

```bash
git clone https://github.com/SavioRodrigues5/SearchDev.git
cd SearchDev
```

Then open `index.html` in your browser — or drag the folder into [Netlify Drop](https://app.netlify.com/drop) to deploy instantly.

---

## 📸 Preview

> Search for `Saviorodrigues5`, `gaearon`, or your own username to see it in action.

---

## ⚠️ Limitations

- The GitHub API allows **60 unauthenticated requests per hour** per IP. For higher limits, you can add a personal access token.
- Profile READMEs only exist for users who have created a repository with the same name as their username.

---
