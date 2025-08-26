function renderButton(navbar) {
	if (!navbar) return;

	const li = document.createElement("li");
	li.classList.add("navigation-tab");

	const btn = document.createElement("button");
	btn.textContent = "Custom Watchlists";
	btn.id = "cw-custom-watchlists-btn";

	btn.onclick = () => {
		chrome.runtime.sendMessage({ type: "openExtensionPage" });
	};

	li.appendChild(btn);

	navbar.appendChild(li);
}

renderButton(document.getElementsByClassName("tabbed-primary-navigation")[0]);
