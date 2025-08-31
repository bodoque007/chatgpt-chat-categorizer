const openCategoriesPage = () =>
  chrome.tabs.create({
    url: chrome.runtime.getURL("/categories/categories.html"),
  });

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  switch (message.type) {
    case "openExtensionPage":
      openCategoriesPage();
      break;

    case "getCategories":
      chrome.storage.local.get({ categories: [] }).then(({ categories }) => {
        sendResponse(categories);
      });
      break;

    case "addToCategory":
      chrome.storage.local.get({ categories: [] }).then(({ categories }) => {
        const categoryIndex = categories.findIndex(
          (category) => category.id === message.categoryId,
        );

        if (categoryIndex === -1) {
          sendResponse({ success: false, error: "Category not found" });
          return;
        }

        // Check if chat already exists in this category
        const existingChat = categories[categoryIndex].chats.find(
          (chat) => chat.id === message.chat.id,
        );
        if (existingChat) {
          sendResponse({
            success: false,
            error: "Chat already in this category",
            errorCode: "already_in_category",
          });
          return;
        }

        const newChatId = self.crypto.randomUUID();

        categories[categoryIndex].chats = [
          ...categories[categoryIndex].chats,
          { id: newChatId, ...message.chat },
        ];

        chrome.storage.local.set({ categories }).then(() => {
          sendResponse({ success: true });
        });
      });
      break;

    case "deleteCategory":
      const { id } = message;
      chrome.storage.local.get({ categories: [] }).then(({ categories }) => {
        const updatedCategories = categories.filter(
          (category) => category.id !== id,
        );
        chrome.storage.local.set({ categories: updatedCategories }).then(() => {
          sendResponse(updatedCategories);
        });
      });
      break;

    case "createCategory":
      const { name } = message;
      chrome.storage.local.get({ categories: [] }).then(({ categories }) => {
        const newId = self.crypto.randomUUID();

        const newCategory = [...categories, { id: newId, name, chats: [] }];
        chrome.storage.local.set({ categories: newCategory }).then(() => {
          sendResponse(newCategory);
        });
      });
      break;

    case "removeFromCategory":
      const { categoryId, chatId } = message;
      chrome.storage.local.get({ categories: [] }).then(({ categories }) => {
        const categoryIndex = categories.findIndex(
          (category) => category.id === categoryId,
        );
        if (categoryIndex !== -1) {
          categories[categoryIndex].chats = categories[
            categoryIndex
          ].chats.filter((chat) => chat.id !== chatId);
          chrome.storage.local.set({ categories }).then(() => {
            sendResponse({ success: true });
          });
        }
      });
      break;

    case "openChat":
      const { url } = message;
      chrome.tabs.create({
        url: url,
      });
      break;
  }
  return true;
});

chrome.action.onClicked.addListener(() => {
  openCategoriesPage();
});
