import { crtTabId, extractAllFrameUrls } from "../../js/injectScript.js";
import { FilterHeader } from "../cookies/filter-header.js";
import { CookieTable } from "../cookies/cookie-table.js";
import { Cookie } from "../../js/Cookie.js";
// @ts-ignore
import filterHeaderCss from "../../style/filter-header.css" with {
	type: "css",
};
import cookieTableCss from "../../style/cookie-table.css" with { type: "css" };

export class CurrentTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [filterHeaderCss, cookieTableCss];
	}

	requestPermission() {
		const btn = document.createElement("button");
		btn.textContent = "Read httpOnly cookies";
		this.shadowRoot.appendChild(btn);
		$on(btn, "click", async () => {
			const granted = await chrome.permissions.request({
				origins: ["<all_urls>"],
			});
			granted ? this.connectedCallback() : notify("Permission denied");
		});
	}

	render(cookies) {
		const domains = [...new Set(cookies.map((cookie) => cookie.domain))];
		return [new FilterHeader(domains), new CookieTable(cookies)];
	}

	async connectedCallback() {
		this.id = "current-tab";
		const tabId = await crtTabId();
		const urls = await extractAllFrameUrls(tabId);
		const promises = urls.map((url) => chrome.cookies.getAll({ url }));
		const urlCookies = await Promise.all(promises);
		const cookies = [];
		for (let index = 0; index < urlCookies.length; index++) {
			const cookieArr = urlCookies[index];
			cookies.push(
				...cookieArr.map((cookie) => new Cookie(cookie, urls[index])),
			);
			const disabledCookies = (await getStore(urls[index]))[urls[index]];
			if (disabledCookies && disabledCookies?.length !== 0)
				cookies.push(...Object.values(disabledCookies));
		}

		cookies.push(new Cookie(null, urls[0]));
		this.shadowRoot.replaceChildren(...this.render(cookies));
	}
}

customElements.define("current-tab", CurrentTab);
