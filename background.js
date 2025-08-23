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
				const watchlistId = watchlists.findIndex(watchlist => watchlist.id === message.watchlist.id);

				if (watchlists[watchlistId].elements.find(element => element.playLink === message.element.playLink) != undefined) {
					return sendResponse({ status: "failed", code: "element_already_exists" });
				}

				watchlists[watchlistId].elements = [...watchlists[watchlistId].elements, message.element];

				chrome.storage.local.set({ watchlists }).then(() => {
					sendResponse({ status: "success" });
				});
			});
			break;

		// case "addToList":
		// 	await chrome.storage.local.set({ watchlists: ["test"] });
		// 	sendResponse({ status: "OK" });
		// 	break;

		case "createWatchlist":
			const { name } = message;
			chrome.storage.local.get({ watchlists: [] }).then(({ watchlists }) => {
				const lastId = watchlists.length > 0 ? watchlists.at(-1).id : 0;
				console.log(watchlists, watchlists.at(-1));
				const newWatchList = [...watchlists, { id: lastId + 1, name, elements: [] }];
				chrome.storage.local.set({ watchlists: newWatchList }).then(() => {
					sendResponse(newWatchList);
				});
			});
			// const { watchlists } = await chrome.storage.local.get({ watchlists: [] });

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
