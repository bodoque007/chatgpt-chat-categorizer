const openWatchListPage = () =>
	chrome.tabs.create({
		url: chrome.runtime.getURL("/watchlist/watchlist.html"),
	});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.type) {
		case "openExtensionPage":
			openWatchListPage();
			break;

		case "getWatchlists":
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				sendResponse(watchlists);
			});
			break;
		case "addToWatchlist":
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				const watchlistIndex = watchlists.findIndex(watchlist => watchlist.id === message.watchlistId);

				if (watchlists[watchlistIndex].elements.find(element => element.playLink === message.element.playLink) != undefined) {
					return sendResponse({ status: "failed", code: "element_already_exists" });
				}

				const newElementId = watchlists[watchlistIndex].elements.length > 0 ? watchlists[watchlistIndex].elements.at(-1).id + 1 : 0;

				watchlists[watchlistIndex].elements = [...watchlists[watchlistIndex].elements, { id: newElementId, ...message.element }];

				chrome.storage.local.set({ watchlists }).then(() => {
					sendResponse({ status: "success" });
				});
			});
			break;

		case "deleteWatchlist":
			const { id } = message;
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				const updatedWatchlists = watchlists.filter(watchlist => watchlist.id !== id);
				chrome.storage.local.set({ watchlists: updatedWatchlists }).then(() => {
					sendResponse(updatedWatchlists);
				});
			});
			break;

		case "createWatchlist":
			const { name } = message;
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				const newId = watchlists.length > 0 ? watchlists.at(-1).id + 1 : 0;

				const newWatchList = [...watchlists, { id: newId, name, elements: [] }];
				chrome.storage.local.set({ watchlists: newWatchList }).then(() => {
					sendResponse(newWatchList);
				});
			});
			break;

		case "removeFromWatchlist":
			const { watchlistId, elementId } = message;
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				const watchlistIndex = watchlists.findIndex(watchlist => watchlist.id === watchlistId);
				if (watchlistIndex === -1) return sendResponse({ status: "failed", code: "watchlist_not_found" });

				const elementIndex = watchlists[watchlistIndex].elements.findIndex(element => element.id === elementId);
				if (elementIndex === -1) return sendResponse({ status: "failed", code: "element_not_found" });

				watchlists[watchlistIndex].elements.splice(elementIndex, 1);

				chrome.storage.local.set({ watchlists }).then(() => {
					console.log("back", watchlists);
					sendResponse(watchlists);
				});
			});
			break;
		case "playElement":
			const { link } = message;
			chrome.tabs.create({
				url: link,
			});
			break;
	}
	return true;
});

chrome.action.onClicked.addListener(() => {
	openWatchListPage();
});
