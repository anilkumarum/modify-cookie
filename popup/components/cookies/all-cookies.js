import { FilterHeader } from "../cookies/filter-header.js";
import { CookieTable } from "../cookies/cookie-table.js";
import { crtTabUrl } from "../../js/injectScript.js";
import { Cookie } from "../../js/Cookie.js";
// @ts-ignore
import filterHeaderCss from "../../style/filter-header.css" assert { type: "css" };
import cookieTableCss from "../../style/cookie-table.css" assert { type: "css" };

export class AllCookies extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [filterHeaderCss, cookieTableCss];
	}

	render(cookies) {
		const domains = [...new Set(cookies.map((cookie) => cookie.domain))];
		return [new FilterHeader(domains), new CookieTable(cookies)];
	}

	async connectedCallback() {
		this.id = "all-cookies";
		const tabUrl = await crtTabUrl();
		const allCookies = await chrome.cookies.getAll({});
		const cookies = allCookies.map((cookie) => new Cookie(cookie, "https://" + cookie.domain + cookie.path));
		cookies.push(new Cookie(null, tabUrl));
		this.shadowRoot.replaceChildren(...this.render(cookies));
	}
}

customElements.define("all-cookies", AllCookies);
