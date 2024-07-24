import { html } from "../../js/om.compact.js";
import { getCookieRows } from "./cookie-table.js";

export class SearchInput extends HTMLElement {
	constructor() {
		super();
	}

	/**@param {string} searchQuery*/
	searchCookie(searchQuery) {
		for (const cookieRow of this.cookieRows) {
			const name = cookieRow.cookie.name;
			cookieRow.hidden = !name.includes(searchQuery);
		}
	}

	searchQuery() {
		const needle = this.inputField.value;
		needle ? this.searchCookie(needle) : this.reset();
	}

	reset() {
		for (const cookieRow of this.cookieRows) cookieRow.hidden && (cookieRow.hidden = false);
	}

	onInputFocus() {
		this.cookieRows = getCookieRows();
	}

	render() {
		return html`<input
			type="search"
			name="search-cookies"
			placeholder="🔎 ${i18n("search_cookies")}"
			ref=${(node) => (this.inputField = node)}
			@focus=${this.onInputFocus.bind(this)}
			@input=${this.searchQuery.bind(this)} />`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("search-input", SearchInput);
