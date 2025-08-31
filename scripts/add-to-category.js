const getCategories = async () => {
  try {
    const categories = await chrome.runtime.sendMessage({
      type: "getCategories",
    });
    return categories;
  } catch (error) {
    return [];
  }
};

const closePopup = () => {
  const popup = document.querySelector(".cg-category-popup-background");
  const popupContent = document.querySelector(".cg-popup");
  if (popup) popup.remove();
  if (popupContent) popupContent.remove();
};

const createClosePopupButton = () => {
  const btn = document.createElement("button");
  btn.id = "cg-close-popup-btn";
  btn.onclick = closePopup;
  btn.textContent = "×";
  return btn;
};

const createNoCategoriesText = () => {
  const text = document.createElement("div");
  text.classList.add("cg-no-categories-text");
  text.textContent = "No categories created yet.";
  return text;
};

const MessageType = Object.freeze({
  error: Symbol(),
  success: Symbol(),
});

const showMessage = (messageType, text) => {
  const divClass =
    messageType === MessageType.success
      ? "cg-success-message"
      : "cg-error-message";

  const popup = document.createElement("div");
  popup.classList.add(divClass);
  popup.textContent = text;
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 3000);
};

const addChatToCategory = (category, chatData) => {
  chrome.runtime
    .sendMessage({
      type: "addToCategory",
      categoryId: category.id,
      chat: chatData,
    })
    .then((res) => {
      if (res.success) {
        showMessage(MessageType.success, `Added to "${category.name}"`);
        closePopup();
      } else if (res.errorCode === "already_in_category") {
        showMessage(
          MessageType.error,
          `"${chatData.title}" is already in ${category.name} category.`,
        );
        closePopup();
      }
    });
};

const createCategoryContainer = (category, chatData) => {
  const li = document.createElement("li");

  li.onclick = () => addChatToCategory(category, chatData);

  const name = document.createElement("span");
  name.textContent = `📁 ${category.name}`;

  li.appendChild(name);
  return li;
};
const createCategoriesContainer = async (chatData) => {
  const categories = await getCategories();

  if (categories.length === 0) {
    return createNoCategoriesText();
  }

  const ul = document.createElement("ul");
  ul.classList.add("cg-categories-list");

  const categoryContainers = categories.map((category) =>
    createCategoryContainer(category, chatData),
  );

  ul.append(...categoryContainers);
  return ul;
};

const createPopup = async (chatData) => {
  const popup = document.createElement("div");
  popup.classList.add("cg-popup");

  const title = document.createElement("h2");
  title.textContent = "Add to Category";

  const chatTitle = document.createElement("span");
  chatTitle.classList.add("cg-chat-title");
  chatTitle.textContent = `"${chatData.title}"`;

  popup.appendChild(createClosePopupButton());
  popup.appendChild(title);
  popup.appendChild(chatTitle);
  popup.appendChild(await createCategoriesContainer(chatData));

  return popup;
};
const createPopupBackground = () => {
  const popupBackground = document.createElement("div");
  popupBackground.classList.add("cg-category-popup-background");
  popupBackground.onclick = closePopup;
  popupBackground.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(5px);
		z-index: 10000;
		display: flex;
		justify-content: center;
		align-items: center;
	`;
  return popupBackground;
};

const createCategoryButton = (chatData) => {
  const button = document.createElement("button");
  button.textContent = "+";
  button.title = "Add to Category";
  button.classList.add("cg-add-category-btn");

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const popup = await createPopup(chatData);
    document.body.appendChild(popup);
  });

  return button;
};
const extractChatData = (chatElement) => {
  const titleElement = chatElement.querySelector('span[dir="auto"]');
  const title = titleElement
    ? titleElement.textContent.trim()
    : "Untitled Chat";

  const href = chatElement.getAttribute("href");
  const url = href ? `https://chatgpt.com${href}` : window.location.href;

  // Extract chat ID from URL
  const chatId = href ? href.split("/c/")[1] : "unknown";

  return {
    id: chatId,
    title: title,
    url: url,
    timestamp: new Date().toISOString(),
  };
};

const addCategoryButtons = () => {
  // Find all chat links that don't already have category buttons
  const chatLinks = document.querySelectorAll(
    'a[href^="/c/"]:not(.cg-processed)',
  );

  chatLinks.forEach((chatLink, index) => {
    // Mark as processed
    chatLink.classList.add("cg-processed");

    // Find the trailing button container (where the ... menu is)
    const trailingContainer = chatLink.querySelector(".trailing");
    if (!trailingContainer) {
      return;
    }

    const chatData = extractChatData(chatLink);

    const categoryBtn = createCategoryButton(chatData);

    // Show button on hover of the entire chat link
    chatLink.addEventListener("mouseenter", () => {
      categoryBtn.style.opacity = "1";
      categoryBtn.style.transform = "scale(1.1)";
    });

    chatLink.addEventListener("mouseleave", () => {
      categoryBtn.style.opacity = "1";
      categoryBtn.style.transform = "scale(1)";
    });

    // Insert before the menu button
    trailingContainer.insertBefore(categoryBtn, trailingContainer.firstChild);
  });
};

// Wait for the page to be ready
const waitForChatList = () => {
  const sidebar = document.querySelector("aside");
  if (sidebar) {
    addCategoryButtons();
    setupObserver();
  } else {
    setTimeout(waitForChatList, 1000);
  }
};

// Setup mutation observer
const setupObserver = () => {
  // Watch for new chats being loaded
  const chatObserver = new MutationObserver((mutations) => {
    let shouldUpdate = false;

    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node contains chat links or is a chat link itself
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches('a[href^="/c/"]')) {
              shouldUpdate = true;
            } else if (
              node.querySelector &&
              node.querySelector('a[href^="/c/"]')
            ) {
              shouldUpdate = true;
            }
          }
        });
      }
    });

    if (shouldUpdate) {
      // Small delay to ensure DOM is fully updated
      setTimeout(addCategoryButtons, 100);
    }
  });

  // Observe the sidebar and main content area for changes
  const sidebar = document.querySelector("aside");
  const mainContent = document.querySelector("main");

  if (sidebar) {
    chatObserver.observe(sidebar, {
      childList: true,
      subtree: true,
    });
  }

  if (mainContent) {
    chatObserver.observe(mainContent, {
      childList: true,
      subtree: true,
    });
  }

  // Also observe the entire body as fallback
  chatObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// Initial run with delay
setTimeout(waitForChatList, 2000);
