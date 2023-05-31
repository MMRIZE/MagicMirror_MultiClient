const fs = require("fs");
const path = require("path");
const Log = require("logger");
const fetch = require("./fetch");

/**
 * Gets the config.
 * @param {Request} req - the request
 * @param {Response} res - the result
 */
function getConfig(req, res) {
	let configFile = req?.param?.configFile || null;
	if (!configFile) {
		res.send(config);
	} else {
		const configPath = path.resolve(configFile);
		if (fs.existsSync(configPath)) {
			Log.info(`Using config file: ${configPath}`);
			const clientConfig = require(configPath);
			res.send(clientConfig);
		} else {
			Log.warn(`Config file not found: ${configPath}`);
			res.send(config);
		}
	}
}

/**
 * A method that forwards HTTP Get-methods to the internet to avoid CORS-errors.
 *
 * Example input request url: /cors?sendheaders=header1:value1,header2:value2&expectedheaders=header1,header2&url=http://www.test.com/path?param1=value1
 *
 * Only the url-param of the input request url is required. It must be the last parameter.
 * @param {Request} req - the request
 * @param {Response} res - the result
 */
async function cors(req, res) {
	try {
		const urlRegEx = "url=(.+?)$";
		let url;

		const match = new RegExp(urlRegEx, "g").exec(req.url);
		if (!match) {
			url = `invalid url: ${req.url}`;
			Log.error(url);
			res.send(url);
		} else {
			url = match[1];

			const headersToSend = getHeadersToSend(req.url);
			const expectedRecievedHeaders = geExpectedRecievedHeaders(req.url);

			Log.log(`cors url: ${url}`);
			const response = await fetch(url, { headers: headersToSend });

			for (const header of expectedRecievedHeaders) {
				const headerValue = response.headers.get(header);
				if (header) res.set(header, headerValue);
			}
			const data = await response.text();
			res.send(data);
		}
	} catch (error) {
		Log.error(error);
		res.send(error);
	}
}

/**
 * Gets headers and values to attach to the web request.
 * @param {string} url - The url containing the headers and values to send.
 * @returns {object} An object specifying name and value of the headers.
 */
function getHeadersToSend(url) {
	const headersToSend = { "User-Agent": `Mozilla/5.0 MagicMirror/${global.version}` };
	const headersToSendMatch = new RegExp("sendheaders=(.+?)(&|$)", "g").exec(url);
	if (headersToSendMatch) {
		const headers = headersToSendMatch[1].split(",");
		for (const header of headers) {
			const keyValue = header.split(":");
			if (keyValue.length !== 2) {
				throw new Error(`Invalid format for header ${header}`);
			}
			headersToSend[keyValue[0]] = decodeURIComponent(keyValue[1]);
		}
	}
	return headersToSend;
}

/**
 * Gets the headers expected from the response.
 * @param {string} url - The url containing the expected headers from the response.
 * @returns {string[]} headers - The name of the expected headers.
 */
function geExpectedRecievedHeaders(url) {
	const expectedRecievedHeaders = ["Content-Type"];
	const expectedRecievedHeadersMatch = new RegExp("expectedheaders=(.+?)(&|$)", "g").exec(url);
	if (expectedRecievedHeadersMatch) {
		const headers = expectedRecievedHeadersMatch[1].split(",");
		for (const header of headers) {
			expectedRecievedHeaders.push(header);
		}
	}
	return expectedRecievedHeaders;
}

/**
 * Gets the HTML to display the magic mirror.
 * @param {Request} req - the request
 * @param {Response} res - the result
 */
function getHtml(req, res) {
	let html = fs.readFileSync(path.resolve(`${global.root_path}/index.html`), { encoding: "utf8" });
	html = html.replace("#VERSION#", global.version);
	let { client = "default", config, layout, css } = req?.query || {};
	config = config || (client !== "default" ? client : "config");
	layout = layout || (client !== "default" ? client : "default");
	css = css || layout;

	//let configFile = "config/config.js";
	let configFile = `config/${config}.js`;

	if (typeof global.configuration_file !== "undefined") {
		configFile = global.configuration_file;
	}
	html = html.replace("#CONFIG_FILE#", configFile).replace("#CLIENT#", client).replace("#LAYOUT#", layout).replace("#CSS#", css).replace("#CONFIG#", config);
	res.send(html);
	Log.log(`Serving HTML with configuration: ${configFile}`);
}

/**
 * Gets the MagicMirror version.
 * @param {Request} req - the request
 * @param {Response} res - the result
 */
function getVersion(req, res) {
	res.send(global.version);
}

/**
 * Serve CSS files
 * @param {*} req - the request
 * @param {*} res - the result
 */
function getCSS(req, res) {
	let cssFile = req?.param?.cssFile || null;
	let cssPath = path.resolve(`${global.root_path}/css/${cssFile}.css`);
	if (fs.existsSync(cssPath)) {
		res.send(fs.readFileSync(cssPath, { encoding: "utf8" }));
	} else {
		const message = `/* CSS file not found: ${cssPath} */`;
		res.send(message);
		Log.warn(message);
	}
}

module.exports = { cors, getConfig, getHtml, getVersion, getCSS };
