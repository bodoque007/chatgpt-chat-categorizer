const getWatchlists = async () => await chrome.runtime.sendMessage({ type: "getWatchlists" });

const closePopup = () => {
	document.querySelector(".cw-watchlist-popup-background").remove();
	document.querySelector(".cw-popup").remove();
};

const createClosePopupButton = () => {
	const btn = document.createElement("button");
	btn.id = "cw-close-popup-btn";
	btn.onclick = closePopup;
	btn.textContent = "X";
	return btn;
};

const createNoWatchlistText = () => {
	const text = document.createElement("i");
	text.classList.add("cw-no-watchlist-text");
	text.textContent = "No watchlists created yet.";
	return text;
};

const addElementToWatchList = (watchlist, element) => {
	chrome.runtime.sendMessage({ type: "addToWatchlist", watchlistId: watchlist.id, element }).then(res => {
		closePopup();
	});
};

const createWatchlistContainer = (watchlist, element) => {
	const li = document.createElement("li");
	const name = document.createElement("span");

	li.onclick = () => addElementToWatchList(watchlist, element);
	name.textContent = `+ ${watchlist.name}`;
	li.appendChild(name);
	return li;
};

const createListsContainer = async element => {
	const watchlists = await getWatchlists();
	if (watchlists.length === 0) return createNoWatchlistText();

	const ul = document.createElement("ul");
	ul.classList.add("cw-watchlists-list");

	const watchlistsContainers = watchlists.map(watchlist => createWatchlistContainer(watchlist, element));

	ul.append(...watchlistsContainers);

	return ul;
};

const createPopup = async data => {
	const popup = document.createElement("div");
	popup.classList.add("cw-popup");

	const title = document.createElement("h2");
	title.textContent = "My Lists";

	const img = document.createElement("img");
	img.src = data.img;

	popup.appendChild(img);
	popup.appendChild(title);
	popup.appendChild(await createListsContainer(data));
	return popup;
};

const createPopupBackground = () => {
	const popupBackground = document.createElement("div");
	popupBackground.classList.add("cw-watchlist-popup-background");
	popupBackground.onclick = closePopup;
	return popupBackground;
};

const createAddButton = () => {
	const btn = document.createElement("button");
	btn.classList.add("cw-custom-watchlists-btn");
	btn.textContent = "CW";
	return btn;
};

const waitForElm = (parent, selector) => {
	return new Promise(resolve => {
		if (parent.querySelector(selector)) {
			return resolve(parent.querySelector(selector));
		}

		const observer = new MutationObserver(mutations => {
			if (parent.querySelector(selector)) {
				observer.disconnect();
				resolve(parent.querySelector(selector));
			}
		});

		observer.observe(parent, {
			childList: true,
			subtree: true,
		});
	});
};

const observer = new MutationObserver(mutations => {
	if (mutations[0].addedNodes.length == 0) return;

	(async () => {
		const img = (await waitForElm(mutations[0].addedNodes[0], "img")).src;
		const info = (await waitForElm(mutations[0].addedNodes[0], ".previewModal--info a")).href;
		const playLink = (await waitForElm(mutations[0].addedNodes[0], "a.playLink")).href;

		const addButton = createAddButton();

		addButton.onclick = async () => {
			document.body.appendChild(createPopupBackground());
			document.body.appendChild(await createPopup({ img, info, playLink }));
		};

		(await waitForElm(mutations[0].addedNodes[0], ".buttonControls--expand-button")).prepend(addButton);
	})();
});

observer.observe(document.querySelector("#appMountPoint > div > .netflix-sans-font-loaded > div > div > div:nth-child(2)"), { childList: true });
