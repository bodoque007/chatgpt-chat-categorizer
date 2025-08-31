# ChatGPT Chat Categorizer

A Chrome extension that allows you to organize your ChatGPT conversations into custom categories for better organization and retrieval.

## Features

- 📁 Create custom categories for your ChatGPT chats
- 🏷️ Easily add chats to categories with one click
- 🔍 View all categorized chats in a dedicated interface
- 🚀 Quick access to your organized conversations

## How It Works

### 1. Install the Extension

- Lol

### 2. Create Categories

- Click the extension icon or the "📁 My Categories" button in ChatGPT's sidebar
- Create categories like "Work", "Personal", "Learning", etc.

### 3. Categorize Chats

- In ChatGPT, hover over any chat in your chat history
- Click the 📁 button that appears next to the menu (...)
- Select which category to add the chat to

### 4. Manage Your Categories

- View all your categorized chats in the extension page
- Remove chats from categories
- Delete entire categories
- Click any chat to open it directly in ChatGPT

## Technical Details

### Files Structure

```
├── manifest.json              # Extension configuration
├── background.js             # Service worker for data management
├── scripts/
│   ├── category-button.js    # Adds category button to ChatGPT sidebar
│   └── add-to-category.js    # Handles adding chats to categories
├── styles/
│   └── category-popup.css    # Styling for category selection popup
├── categories/
│   ├── categories.html       # Main extension page
│   ├── script.js            # Extension page functionality
│   └── styles.css           # Extension page styling
└── images/                   # Extension icons
```

### Data Structure

Categories are stored locally using Chrome's storage API:

```javascript
{
  id: 1,
  name: "Work Projects",
  chats: [
    {
      id: "unique-chat-id",
      title: "Chat Title",
      url: "https://chatgpt.com/c/...",
      timestamp: "2024-01-15T10:30:00Z"
    }
  ]
}
```

### ChatGPT Integration

The extension detects ChatGPT's chat list structure:

```html
<a href="/c/chat-id" class="group __menu-item hoverable">
  <div class="truncate">
    <span dir="auto">Chat Title</span>
  </div>
  <div class="trailing">
    <!-- Category button gets inserted here -->
    <button class="__menu-item-trailing-btn">...</button>
  </div>
</a>
```

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Your chat history and categories remain completely private

## Permissions

- `storage`: To save categories and chat references locally
- `unlimitedStorage`: To store large amounts of categorized chats
- Access to `chatgpt.com` and `chat.openai.com`: To integrate with ChatGPT interface

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers (such as Brave)
