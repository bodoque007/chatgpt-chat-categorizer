document.querySelector("#create-watchlist-btn").addEventListener("click", async () => {
	const name = prompt("Enter new watchlist name:");
	if (!name) return;
	const watchlists = await chrome.runtime.sendMessage({ type: "createWatchlist", name });
	loadMyLists(watchlists);
});

const createWatchlistCard = element => {
	const img = document.createElement("img");
	img.classList.add("element-card-image");
	img.src = element.img;
	img.onclick = () => chrome.runtime.sendMessage({ type: "playElement", link: element.playLink });
	return img;
};

const createEmptyWatchlistCard = () => {
	const div = document.createElement("div");
	div.classList.add("element-card-text");
	div.textContent = "Empty Watchlist";
	return div;
};

const createWatchlistTitleContainer = watchlist => {
	const titleContainer = document.createElement("div");
	titleContainer.classList.add("watchlist-title-container");

	const title = document.createElement("h2");
	title.classList.add("title");
	title.textContent = watchlist.name;

	const deleteBtn = document.createElement("button");
	deleteBtn.classList.add("delete-watchlist-btn");
	deleteBtn.textContent = "Delete";
	deleteBtn.onclick = async () => {
		if (confirm(`Are you sure you want to delete the watchlist "${watchlist.name}"?`)) {
			const watchlists = await chrome.runtime.sendMessage({ type: "deleteWatchlist", id: watchlist.id });
			loadMyLists(watchlists);
		}
	};

	titleContainer.appendChild(title);
	titleContainer.appendChild(deleteBtn);
	return titleContainer;
};

const createWatchlistContainer = watchlist => {
	const container = document.createElement("div");
	container.classList.add("watchlist-container");

	const titleContainer = createWatchlistTitleContainer(watchlist);

	const elementsContainer = document.createElement("div");
	elementsContainer.classList.add("elements-container");

	const cards = watchlist.elements.length > 0 ? watchlist.elements.map(element => createWatchlistCard(element)) : [createEmptyWatchlistCard()];

	elementsContainer.append(...cards);
	container.appendChild(titleContainer);
	container.appendChild(elementsContainer);

	return container;
};

const loadMyLists = async watchlists => {
	if (!watchlists) watchlists = await chrome.runtime.sendMessage({ type: "getWatchlists" });
	document.querySelector("#lists-container").innerHTML = "";
	const elements = watchlists.map(watchlist => createWatchlistContainer(watchlist));

	document.querySelector("#lists-container").append(...elements);
};

loadMyLists();
