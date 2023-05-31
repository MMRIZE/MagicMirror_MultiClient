console.log(config.layout, config.client);
const body = document.getElementsByTagName("body")[0];
body.innerHTML = "Loading template...";
fetch(config.layout || "/layout/default.html")
	.then((response) => response.text())
	.then((data) => {
		body.innerHTML = data;
		console.info(`Loaded layout: ${config.layout || "/layout/default.html"}`);
	});
if (config.client !== "default" || !config.client) {
	console.info(`Loading client css: /css/${config.client}.css`);
	let css = document.createElement("link");
	css.onerror = (event) => {
		console.warn(`Failed to load client css: /css/${config.client}.css`);
	};
	css.rel = "stylesheet";
	css.href = "/css/" + config.client + ".css";
	document.head.appendChild(css);
}
