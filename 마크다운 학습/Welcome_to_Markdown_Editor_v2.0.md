# Welcome to Markdown Editor v2.0

Markdown is a lightweight markup language with plain text formatting syntax.

## ✨ Features

- 📁 **Document Management** - Save, load, and organize multiple documents
- 🎨 **Clean UI** - Simple interface using DaisyUI components
- 💾 **Auto-save** - Never lose your work with automatic saving
- 📊 **Document Statistics** - Track character and line counts
- 🔄 **Import/Export** - Backup and restore all your documents

## 🚀 Getting Started

1. Click the **Documents** button to manage your files
2. Start typing - documents auto-save based on the first heading
3. Export to HTML or download as Markdown

```javascript
// Example: Auto-save functionality
const autoSave = () => {
  const content = editor.getValue();
  localStorage.setItem('currentDoc', content);
  console.log('Document saved!');
};

// Save every 30 seconds
setInterval(autoSave, 30000);
```

---

**Happy writing!** 📝
