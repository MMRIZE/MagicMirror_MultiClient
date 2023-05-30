const body = document.getElementsByTagName("body")[0];
body.innerHTML = "Loading template...";
fetch(config.layout || "/layout/default.html")
	.then((response) => response.text())
	.then((data) => {
		body.innerHTML = data;
	});
