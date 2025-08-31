function renderCategoryButton() {
  // Look for existing button to avoid duplicates
  if (document.getElementById("cg-categories-btn")) return;

  // Find the sidebar navigation area (where the "Chats" heading is)
  const chatsSection = document.querySelector("aside h2");
  if (!chatsSection || !chatsSection.textContent.includes("Chats")) return;

  // Create the button container
  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = `
		padding: 8px 12px;
		margin: 8px 0;
		border-bottom: 1px solid #4a4a4a;
	`;

  const btn = document.createElement("button");
  btn.textContent = "📁 My Categories";
  btn.id = "cg-categories-btn";
  btn.style.cssText = `
		background: transparent;
		border: 1px solid #565869;
		color: #ececf1;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		width: 100%;
		transition: all 0.2s;
	`;

  btn.onmouseover = () => {
    btn.style.backgroundColor = "#2d2d30";
    btn.style.borderColor = "#6e6e80";
  };

  btn.onmouseout = () => {
    btn.style.backgroundColor = "transparent";
    btn.style.borderColor = "#565869";
  };

  btn.onclick = () => {
    chrome.runtime.sendMessage({ type: "openExtensionPage" });
  };

  buttonContainer.appendChild(btn);

  // Insert the button after the "Chats" heading
  const parentSection = chatsSection.closest("aside");
  if (parentSection) {
    parentSection.insertBefore(buttonContainer, parentSection.children[1]);
  }
}

// Initial render
renderCategoryButton();

// Watch for navigation changes
const observer = new MutationObserver(() => {
  renderCategoryButton();
});

// Observe the main app container for changes
const appContainer = document.querySelector("#__next") || document.body;
observer.observe(appContainer, {
  childList: true,
  subtree: true,
});
