import "./filter-menu.js";
import "./search-input.js";
import { html, map } from "../../js/om.compact.js";
import { CookieRow, getCookieRows } from "./cookie-table.js";

export class FilterHeader extends HTMLElement {
	/** @param {string[]} [domains]*/
	constructor(domains) {
		super();
		this.domains = domains;
	}

	/** @type {CookieRow[]} */
	cookieRows;

	filterDomainCookies({ target }) {
		this.cookieRows ??= getCookieRows();
		const domain = target.value;
		if (domain === "all-domains") {
			for (const cookieRow of this.cookieRows) {
				cookieRow.hidden = false;
				cookieRow.cells[7].hidden = false;
			}
		} else {
			for (const cookieRow of this.cookieRows) {
				cookieRow.hidden = cookieRow.cookie.domain !== target.value;
				cookieRow.cells[7].hidden = true;
			}
		}
	}

	render() {
		return html`<select name="filter-domains" @change=${this.filterDomainCookies.bind(this)}>
				<option value="all-domains">${i18n("all_domains")}</option>
				${map(this.domains, (domain) => html`<option value="${domain}">${domain}</option>`)}
			</select>
			<search-input></search-input>
			<filter-menu></filter-menu>`;
	}

	connectedCallback() {
		this.replaceChildren(this.render());
	}
}

customElements.define("filter-header", FilterHeader);
