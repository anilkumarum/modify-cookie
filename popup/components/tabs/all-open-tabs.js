import "../cookies/cookie-table.js";
import { extractAllFrameUrls } from "../../js/injectScript.js";
import { FilterHeader } from "../cookies/filter-header.js";
import { CookieTable } from "../cookies/cookie-table.js";
import { html } from "../../js/om.compact.js";
import { Cookie } from "../../js/Cookie.js";
// @ts-ignore
import filterHeaderCss from "../../style/filter-header.css" with {
	type: "css",
};
import cookieTableCss from "../../style/cookie-table.css" with { type: "css" };
import allTabsCss from "../../style/all-tabs.css" with { type: "css" };

export class TabItem extends HTMLElement {
	constructor(tab) {
		super();
		this.tab = tab;
	}

	toggleTableView({ target }) {
		this.lastElementChild["hidden"] = target.checked;
	}

	render() {
		return html`<header>
			<web-icon ico="chev-right" title="" @change=${this.toggleTableView.bind(this)} toggle></web-icon>
			<img src="${this.tab.favIconUrl}" />
			<div>
				<div class="tab-title">${this.tab.title}</div>
				<div class="tab-url">${this.tab.url}</div>
			</div>
		</header>`;
	}

	async connectedCallback() {
		const urls = await extractAllFrameUrls(this.tab.id).catch((err) => {});
		if (!urls) return;
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
		this.replaceChildren(this.render(), new CookieTable(cookies));
	}
}

customElements.define("tab-item", TabItem);

export class AllOpenTabs extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [
			filterHeaderCss,
			cookieTableCss,
			allTabsCss,
		];
	}

	render(tabList) {
		return Array.from(tabList).map((tab) => new TabItem(tab));
	}

	async connectedCallback() {
		this.id = "all-open-tabs";
		const tabList = new Map();
		const tabs = await chrome.tabs.query({ currentWindow: true });
		for (const tab of tabs) {
			if (!URL.canParse(tab.url)) continue;
			const domain = new URL(tab.url).host;
			if (domain === "chromewebstore.google.com") continue;
			tabList.has(domain) ||
				tabList.set(domain, {
					id: tab.id,
					title: tab.title,
					url: tab.url,
					favIconUrl: tab.favIconUrl,
				});
		}
		const domains = Array.from(tabList.keys());
		this.shadowRoot.replaceChildren(
			new FilterHeader(domains),
			...this.render(tabList.values()),
		);
	}
}

customElements.define("all-open-tabs", AllOpenTabs);
