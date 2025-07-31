# 🌸 PinkTasks

A lightweight VS Code extension for managing TODOs and other tasks.

## 💡 Why This Project?

I built this as a fun learning project to explore the VS Code extension API and improve my JavaScript skills.  
I often use TODO-style comments while working, and wanted a clean, visual way to manage them directly in the editor.

## ✨ Features

### 🎯 Smart Task Management
- **Auto-scan** all project files for TODO, FIXME, NOTE, HACK, and BUG comments  
- **Custom tags** – Add your own keywords (saved between sessions)  
- **Multi-language support** – Works with JS, TS, Python, CSS, HTML, Markdown, JSON, and more  
- **Live updates** – Automatically refreshes when files are saved  

### 🖱️ Intuitive Interface
- **Click to navigate** – Jump directly to any task in your code  
- **Mark as done** – Right-click to complete tasks (removes comment from code)  
- **Smart deletion** – Only removes the comment, preserves your code  
- **Pink highlighting** – Visual feedback when opening tasks  
- **Status bar counter** – Shows total task count  

### 📤 Export Options
- **JSON export** – Structured data for external tools  
- **Markdown export** – Shareable checklist format  
- **Save anywhere** – Choose your own file location  

## 🔧 Tech Stack

- VS Code Extension API  
- JavaScript (Node.js)  
- Tree View (TreeDataProvider)  
- File system access (fs & vscode.workspace.fs)

## 🎨 Why Pink?

The pink adds a bit of fun and personality while keeping the workflow clean and efficient — and honestly, just because I felt like it.
