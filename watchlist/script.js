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

const createWatchlistContainer = watchlist => {
	const container = document.createElement("div");
	container.classList.add("watchlist-container");

	const title = document.createElement("h2");
	title.classList.add("title");
	title.textContent = watchlist.name;

	const elementsContainer = document.createElement("div");
	elementsContainer.classList.add("elements-container");

	const cards = watchlist.elements.length > 0 ? watchlist.elements.map(element => createWatchlistCard(element)) : [createEmptyWatchlistCard()];

	elementsContainer.append(...cards);
	container.appendChild(title);
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
