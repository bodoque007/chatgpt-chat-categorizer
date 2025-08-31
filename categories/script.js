document
  .querySelector("#create-category-btn")
  .addEventListener("click", async () => {
    const name = prompt("Enter new category name:");
    if (!name) return;

    const categories = await chrome.runtime.sendMessage({
      type: "createCategory",
      name,
    });
    loadMyCategories(categories);
  });

const createChatCard = (chat, category) => {
  const div = document.createElement("div");
  div.classList.add("chat-card");

  const title = document.createElement("div");
  title.classList.add("chat-card-title");
  title.textContent = chat.title;

  const meta = document.createElement("div");
  meta.classList.add("chat-card-meta");
  const date = new Date(chat.timestamp).toLocaleDateString();
  meta.textContent = `Added: ${date}`;

  const actions = document.createElement("div");
  actions.classList.add("chat-card-actions");

  const openBtn = document.createElement("button");
  openBtn.classList.add("open-chat-btn");
  openBtn.textContent = "Open Chat";
  openBtn.onclick = (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: "openChat", url: chat.url });
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-chat-btn");
  deleteBtn.textContent = "Remove";
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (confirm(`Remove "${chat.title}" from this category?`)) {
      await chrome.runtime.sendMessage({
        type: "removeFromCategory",
        categoryId: category.id,
        chatId: chat.id,
      });
      loadMyCategories();
    }
  };

  actions.appendChild(openBtn);
  actions.appendChild(deleteBtn);

  div.appendChild(title);
  div.appendChild(meta);
  div.appendChild(actions);

  // Click to open chat
  div.onclick = () => {
    chrome.runtime.sendMessage({ type: "openChat", url: chat.url });
  };

  return div;
};

const createEmptyCategoryCard = () => {
  const div = document.createElement("div");
  div.classList.add("empty-category-text");
  div.textContent = "📭 No chats in this category yet";
  return div;
};

const createCategoryTitleContainer = (category) => {
  const titleContainer = document.createElement("div");
  titleContainer.classList.add("category-title-container");

  const title = document.createElement("h2");
  title.classList.add("title");
  title.textContent = `📁 ${category.name} `;

  const countSpan = document.createElement("span");
  countSpan.classList.add("cg-category-add-count");
  countSpan.textContent = `(${category.chats.length} chats)`;

  title.appendChild(countSpan);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-category-btn");
  deleteBtn.textContent = "Delete Category";
  deleteBtn.onclick = async () => {
    if (
      confirm(
        `Delete "${category.name}" category? This will remove all ${category.chats.length} chats from this category.`,
      )
    ) {
      const categories = await chrome.runtime.sendMessage({
        type: "deleteCategory",
        id: category.id,
      });
      loadMyCategories(categories);
    }
  };

  titleContainer.appendChild(title);
  titleContainer.appendChild(deleteBtn);
  return titleContainer;
};

const createCategoryContainer = (category) => {
  const categoryContainer = document.createElement("div");
  categoryContainer.classList.add("category-container");

  const titleContainer = createCategoryTitleContainer(category);
  categoryContainer.appendChild(titleContainer);

  const chatsContainer = document.createElement("div");
  chatsContainer.classList.add("chats-container");

  if (category.chats.length === 0) {
    chatsContainer.appendChild(createEmptyCategoryCard());
  } else {
    const chatCards = category.chats.map((chat) =>
      createChatCard(chat, category),
    );
    chatsContainer.append(...chatCards);
  }

  categoryContainer.appendChild(chatsContainer);
  return categoryContainer;
};

const createNoCategoriesContainer = () => {
  const container = document.createElement("div");
  container.classList.add("no-categories-container");

  const title = document.createElement("h2");
  title.textContent = "No Categories Yet";

  const description = document.createElement("p");
  description.textContent =
    "Create your first category to start organizing your ChatGPT conversations!";

  const createBtn = document.createElement("button");
  createBtn.id = "create-category-btn";
  createBtn.textContent = "+ Create Your First Category";
  createBtn.onclick = () => {
    document
      .querySelector("#create-category-btn")
      .dispatchEvent(new MouseEvent("click"));
  };

  container.appendChild(title);
  container.appendChild(description);
  container.appendChild(createBtn);

  return container;
};

const loadMyCategories = async (categories) => {
  const container = document.querySelector("#categories-container");

  if (!categories) {
    categories = await chrome.runtime.sendMessage({ type: "getCategories" });
  }

  container.replaceChildren();

  if (categories.length === 0) {
    container.appendChild(createNoCategoriesContainer());
    return;
  }

  const categoryContainers = categories.map((category) =>
    createCategoryContainer(category),
  );
  container.append(...categoryContainers);
};

// Load categories on page load
loadMyCategories();
