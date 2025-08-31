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
  btn.style.cssText = `
		position: absolute;
		top: 10px;
		right: 15px;
		background: transparent;
		border: none;
		color: #ececf1;
		font-size: 24px;
		cursor: pointer;
		z-index: 1000;
	`;
  return btn;
};

const createNoCategoriesText = () => {
  const text = document.createElement("div");
  text.classList.add("cg-no-categories-text");
  text.textContent = "No categories created yet.";
  text.style.cssText = `
		color: #8e8ea0;
		font-style: italic;
		text-align: center;
		padding: 20px;
	`;
  return text;
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
        closePopup();

        // Show success message
        const successMsg = document.createElement("div");
        successMsg.textContent = `Added to "${category.name}"`;
        successMsg.style.cssText = `
				position: fixed;
				top: 20px;
				right: 20px;
				background: #10a37f;
				color: white;
				padding: 10px 20px;
				border-radius: 6px;
				z-index: 10000;
				font-size: 14px;
			`;
        document.body.appendChild(successMsg);

        setTimeout(() => successMsg.remove(), 3000);
      }
    });
};

const createCategoryContainer = (category, chatData) => {
  const li = document.createElement("li");
  li.style.cssText = `
		padding: 12px 16px;
		border-radius: 6px;
		transition: all 0.2s;
		cursor: pointer;
		border: 1px solid #4a4a4a;
		margin-bottom: 8px;
		background: #2d2d30;
	`;

  li.onmouseover = () => {
    li.style.backgroundColor = "#10a37f";
    li.style.transform = "scale(1.02)";
  };

  li.onmouseout = () => {
    li.style.backgroundColor = "#2d2d30";
    li.style.transform = "scale(1)";
  };

  li.onclick = () => addChatToCategory(category, chatData);

  const name = document.createElement("span");
  name.textContent = `📁 ${category.name}`;
  name.style.color = "#ececf1";

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
  ul.style.cssText = `
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 300px;
		overflow-y: auto;
	`;

  const categoryContainers = categories.map((category) =>
    createCategoryContainer(category, chatData),
  );

  ul.append(...categoryContainers);
  return ul;
};

const createPopup = async (chatData) => {
  const popup = document.createElement("div");
  popup.classList.add("cg-popup");
  popup.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: #212121;
		border: 1px solid #4a4a4a;
		border-radius: 8px;
		padding: 24px;
		width: 400px;
		max-width: 90vw;
		z-index: 10001;
		box-shadow: 0 10px 25px rgba(0,0,0,0.5);
	`;

  const title = document.createElement("h2");
  title.textContent = "Add to Category";
  title.style.cssText = `
		color: #ececf1;
		margin: 0 0 20px 0;
		font-size: 20px;
		text-align: center;
	`;

  const chatTitle = document.createElement("div");
  chatTitle.textContent = `"${chatData.title}"`;
  chatTitle.style.cssText = `
		color: #8e8ea0;
		font-size: 14px;
		margin-bottom: 20px;
		padding: 10px;
		background: #1a1a1a;
		border-radius: 6px;
		border-left: 3px solid #10a37f;
	`;

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
  const btn = document.createElement("button");
  btn.classList.add("cg-add-category-btn");
  btn.textContent = "📁";
  btn.title = "Add to category";
  btn.style.cssText = `
		background: #2d2d30;
		border: 1px solid #565869;
		color: #ececf1;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 14px;
		margin-left: 8px;
		opacity: 1;
		transition: all 0.2s;
		min-width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	`;

  btn.onmouseenter = () => {
    btn.style.opacity = "1";
    btn.style.backgroundColor = "#10a37f";
    btn.style.borderColor = "#10a37f";
    btn.style.transform = "scale(1.1)";
  };

  btn.onmouseleave = () => {
    btn.style.opacity = "1";
    btn.style.backgroundColor = "#2d2d30";
    btn.style.borderColor = "#565869";
    btn.style.transform = "scale(1)";
  };

  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const popup = await createPopup(chatData);
    const background = createPopupBackground();

    document.body.appendChild(background);
    document.body.appendChild(popup);
  };

  return btn;
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

    // Extract chat data
    const chatData = extractChatData(chatLink);

    // Create and add category button
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
  } else {
    setTimeout(waitForChatList, 1000);
  }
};

// Initial run with delay
setTimeout(waitForChatList, 2000);

// Watch for new chats being loaded
const chatObserver = new MutationObserver((mutations) => {
  addCategoryButtons();
});

// Observe the sidebar for changes
const observeTarget = document.querySelector("aside") || document.body;
chatObserver.observe(observeTarget, {
  childList: true,
  subtree: true,
});
