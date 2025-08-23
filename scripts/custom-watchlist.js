function removeUnnecessaryElements() {
	document.querySelector(".sub-header").remove();
	document.querySelector("#main-view").remove();
}

document.addEventListener("DOMContentLoaded", () => {
	removeUnnecessaryElements();
});
