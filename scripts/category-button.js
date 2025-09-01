function renderCategoryButton() {
  // Look for existing button to avoid duplicates
  if (document.getElementById("cg-categories-btn")) {
    return;
  }

  // Use the "Explore GPTs" as anchor for the button
  const gptsButtonAnchor = document.querySelector(
    '[data-testid="explore-gpts-button"]',
  );

  // Should not happen unless OpenAI change the site.
  if (!gptsButtonAnchor) {
    return;
  }

  // We'll use an <a> tag to try mimic the other menu items.
  const myCategoriesLink = document.createElement("a");
  myCategoriesLink.id = "cg-categories-btn";
  myCategoriesLink.className = "group __menu-item hoverable"; // Use the same classes OpenAI uses
  myCategoriesLink.href = "#"; // Set a dummy href

  // Recreate the inner structure of the native buttons
  myCategoriesLink.innerHTML = `
    <div class="flex min-w-0 items-center gap-1.5">
      <div class="flex items-center justify-center icon">
        <span style="font-size: 18px;">📁</span>
      </div>
      <div class="flex min-w-0 grow items-center gap-2.5">
        <div class="truncate">My Categories</div>
      </div>
    </div>
  `;

  myCategoriesLink.onclick = (e) => {
    e.preventDefault(); // Prevent the link from trying to navigate
    chrome.runtime.sendMessage({ type: "openExtensionPage" });
  };

  if (gptsButtonAnchor.parentElement) {
    gptsButtonAnchor.parentElement.insertBefore(
      myCategoriesLink,
      gptsButtonAnchor,
    );
  }
}

// Observer made to watch for navigation and UI changes to re-render the button if needed.
const observer = new MutationObserver(() => {
  setTimeout(renderCategoryButton, 500);
});

// Observe the main app container for changes
const appContainer = document.querySelector("#__next") || document.body;
observer.observe(appContainer, {
  childList: true,
  subtree: true,
});

setTimeout(renderCategoryButton, 1000);

// Initial render
renderCategoryButton();
