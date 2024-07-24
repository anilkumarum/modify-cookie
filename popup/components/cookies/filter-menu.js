import { CookieRow, getCookieRows } from "./cookie-table.js";
import { html } from "../../js/om.compact.js";

export class FilterMenu extends HTMLElement {
	constructor() {
		super();
	}

	/** @type {CookieRow[]} */
	cookieRows;

	filterCookie({ target }) {
		this.cookieRows ??= getCookieRows();
		switch (target.name) {
			case "SameSite":
				for (const cookieRow of this.cookieRows) cookieRow.hidden = cookieRow.cookie.sameSite !== target.value;
				break;

			/* case "expired":
				for (const cookieRow of this.cookieRows) {
					const expired = new Date(cookieRow.cookie.expirationDate).getTime() > Date.now();
					cookieRow.hidden = cookieRow.cookie[target.name] === !expired;
				}
				break; */

			default:
				for (const cookieRow of this.cookieRows)
					cookieRow.hidden = cookieRow.cookie[target.name] === !target.checked;
				break;
		}
	}

	render() {
		const menuItems = ["hostOnly", "httpOnly", "secure", "session"];
		const menuItem = (menu) => `<li>
			<label><input type="checkbox" name="${menu}" value="${menu}" /> <span>${menu}</span> </label>
		</li>`;

		return html`<web-icon ico="filter" title=""></web-icon>
			<menu @change=${this.filterCookie.bind(this)}>
				${menuItems.map(menuItem).join("")}
				<li>
					<cite style="font-size:small">sameSite</cite>
					<select name="SameSite" title="SameSite">
						<option value="unspecified">None</option>
						<option value="strict">Strict</option>
						<option value="lax">Lax</option>
					</select>
				</li>
			</menu>`;
	}

	connectedCallback() {
		this.tabIndex = 0;
		this.replaceChildren(this.render());
	}
}

customElements.define("filter-menu", FilterMenu);
