import { html, map } from "../../js/om.compact.js";
import { WebIcon } from "../helper/web-icon.js";
import { Cookie, setCookie } from "../../js/Cookie.js";
import { formatValue } from "./value-format-popup.js";

export class CookieRow extends HTMLTableRowElement {
	/** @param {Cookie} cookie*/
	constructor(cookie) {
		super();
		this.cookie = cookie;
	}

	async deleteCookie() {
		await chrome.cookies.remove({ name: this.cookie.name, url: this.cookie.url });
		this.remove();
	}

	onPaste(inputName, evt) {
		const pasteText = evt.clipboardData.getData("text");
		const updateCookie = async (name, value) => {
			if (inputName === "name") {
				evt.target.value = name;
				this.cells[2].firstElementChild["value"] = value;
			} else if (inputName === "value") {
				evt.target.value = value;
				this.cells[1].firstElementChild["value"] = name;
			}
			await chrome.cookies.remove({ name: this.cookie.name, url: this.cookie.url });
			this.cookie.name = name;
			this.cookie.value = value;
			setCookie(this.cookie);
		};
		const appendCookie = async (name, value) => {
			const url = this.cookie.url;
			await chrome.cookies.remove({ name, url: this.cookie.url });
			// @ts-ignore
			const cookie = new Cookie({ name, value, domain: this.cookie.domain }, url);
			this.after(new CookieRow(cookie));
			setCookie(cookie);
		};
		if (pasteText.includes(";") || pasteText.includes("=")) {
			const cookiesData = pasteText.split(";");
			cookiesData.forEach((cookieData, index) => {
				const [name, value] = cookieData.trim().split("=");
				if (!name || !value) return;
				index === 0 ? updateCookie(name, value) : appendCookie(name, value);
			});
			evt.preventDefault();
		}
	}

	async onValueChange({ target }) {
		await chrome.cookies.remove({ name: this.cookie.name, url: this.cookie.url });
		if (target.name === "expire-date") this.cookie[this.cookie.name] = new Date(target.value).getTime();
		else this.cookie[target.name] = target.type === "checkbox" ? target.checked : target.value;
		if (!this.cookie.name || !this.cookie.value) return;
		if (target.name === "enable") {
			const urlCookies = (await getStore(this.cookie.url))[this.cookie.url] ?? {};
			target.checked ? delete urlCookies[this.cookie.name] : (urlCookies[this.cookie.name] = this.cookie);
			setStore({ [this.cookie.url]: urlCookies });
			if (!target.checked) return;
		}
		//add next row
		target.name === "name" && this.after(new CookieRow(new Cookie(null, this.cookie.url)));

		const cookie = structuredClone(this.cookie);
		setCookie(cookie);
	}

	createDomainInput(value) {
		const input = document.createElement("input");
		input.type = "text";
		input.name = "domain";
		input.value = value;
		return input;
	}

	createSelect(value) {
		const options = [
			{ name: "None", value: "unspecified" },
			//{ name: "no_restriction", value: "No Restriction" },
			{ name: "Strict", value: "strict" },
			{ name: "Lax", value: "lax" },
		];
		const select = document.createElement("select");
		select.name = "SameSite";
		select.value = value;
		for (const option of options) select.add(new Option(option.name, option.value));
		return select;
	}

	createTextarea(value) {
		const textarea = document.createElement("textarea");
		textarea.name = "value";
		textarea.placeholder = "value";
		textarea.value = value;
		$on(textarea, "paste", this.onPaste.bind(this, "value"));
		$on(textarea, "contextmenu", formatValue);
		return textarea;
	}

	createDateInput(value) {
		const expirationDate = value ? new Date(value).toISOString().slice(0, -8) : null;
		const input = document.createElement("input");
		input.type = "datetime-local";
		input.name = "expire-date";
		input.value = expirationDate;
		return input;
	}

	createInput(value) {
		const input = document.createElement("input");
		input.type = "text";
		input.name = "name";
		input.placeholder = "name";
		input.value = value;
		$on(input, "paste", this.onPaste.bind(this, "name"));
		return input;
	}

	createCheckBox(name, checked) {
		const checkBox = document.createElement("input");
		checkBox.type = "checkbox";
		checkBox.name = name;
		checkBox.checked = checked;
		return checkBox;
	}

	render() {
		this.insertCell().appendChild(this.createCheckBox("enable", this.cookie.enable ?? true));
		this.insertCell().appendChild(this.createInput(this.cookie.name));
		this.insertCell().appendChild(this.createTextarea(this.cookie.value));
		this.insertCell().appendChild(this.createDateInput(this.cookie.expirationDate));
		this.insertCell().appendChild(this.createCheckBox("HttpOnly", this.cookie.httpOnly));
		this.insertCell().appendChild(this.createCheckBox("Secure", this.cookie.secure));
		this.insertCell().appendChild(this.createSelect(this.cookie.sameSite));
		this.insertCell().appendChild(this.createDomainInput(this.cookie.domain));
		this.insertCell().appendChild(new WebIcon("delete"));
	}

	connectedCallback() {
		this.title = this.cookie.name;
		this.render();
		$on(this, "change", this.onValueChange);
		$on(this, "paste", this.onPaste);
		$on(this.lastElementChild, "click", this.deleteCookie.bind(this));
	}
}

customElements.define("cookie-row", CookieRow, { extends: "tr" });

export class CookieTable extends HTMLElement {
	/** @param {Cookie[]} [cookies]*/
	constructor(cookies) {
		super();
		this.cookies = cookies;
	}

	render() {
		return html`<table>
			<thead>
				<tr>
					<th></th>
					<th>${i18n("name")}</th>
					<th>${i18n("value")}</th>
					<th>${i18n("expires_max_age")}</th>
					<th>${i18n("httponly")}</th>
					<th>${i18n("secure")}</th>
					<th>${i18n("samesite")}</th>
					<th data-name="domain"></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				${map(this.cookies, (cookie) => new CookieRow(cookie))}
			</tbody>
		</table>`;
	}

	connectedCallback() {
		this.appendChild(this.render());
	}
}

customElements.define("cookie-table", CookieTable);

/**@returns {CookieRow[]} */
export function getCookieRows() {
	if (location.hash === "#all-open-tabs") {
		const cookieTable = $("all-open-tabs").shadowRoot.querySelectorAll("table");
		return Array.from(cookieTable).flatMap((table) => Array.from(table.tBodies[0].rows));
	} else if (location.hash === "#all-cookies") {
		return $("table", $("all-cookies").shadowRoot).tBodies[0].rows;
	} else {
		return $("table", $("current-tab").shadowRoot).tBodies[0].rows;
	}
}
