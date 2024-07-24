import { getCookieRows } from "../cookies/cookie-table.js";
import { crtTabUrl } from "../../js/injectScript.js";
import { html } from "../../js/om.compact.js";

export class ExportCookie extends HTMLElement {
	constructor() {
		super();
		this.exportType = "copy";
		this.format = "json";
	}

	async downloadCookies(cookieData) {
		const tabUrl = await crtTabUrl();
		const domain = URL.canParse(tabUrl) && new URL(tabUrl).host;
		const mimeType =
			this.format === "json" ? "application/json" : this.format === "csv" ? "text/csv" : "text/plain";
		const fileExt = this.format === "json" ? ".json" : this.format === "csv" ? ".csv" : ".txt";
		const fileBlob = new Blob([cookieData], { type: mimeType });
		const a = document.createElement("a");
		a.setAttribute("href", URL.createObjectURL(fileBlob));
		a.setAttribute("download", (domain ?? new Date().toISOString()) + fileExt);
		a.click();
	}

	copyCookies(cookieData) {
		navigator.clipboard
			.writeText(cookieData)
			.then(() => toast("Copied"))
			.catch((err) => console.error(err));
	}

	formats = {
		json: (cookies) => JSON.stringify(cookies),
		headerstring: (cookies) => cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
		netscape: (cookies) => {
			const cookie = (cookie) =>
				`${cookie.domain}\tTRUE\t${cookie.path}\t${cookie.secure}\t${cookie.expirationDate}\t${cookie.name}\t${cookie.value}`;
			return cookies.map(cookie).join("\n");
		},
		csv: (cookies) => {
			const header = `Name,Value,Domain,Path,Expires/Max-Age,HttpOnly,Secure,SameSite\n`;
			const cookieStr = (cookie) =>
				`${cookie.name},${cookie.value},${cookie.domain},${cookie.path},${cookie.expirationDate},${cookie.httpOnly},${cookie.secure},${cookie.sameSite}`;
			const cookieData = cookies.map(cookieStr).join("\n");
			return header + cookieData;
		},
	};

	exportCookie({ target }) {
		const cookieRows = getCookieRows();
		const cookies = Array.from(cookieRows)
			.filter((row) => !row.hidden)
			.map((row) => row.cookie);
		target.tagName === "SELECT" && (this.exportType = target.value);
		if (target.name === "cookie-format")
			(this.format = target.value), localStorage.setItem("cookie-format", this.format);
		const cookieData = this.formats[this.format](cookies);
		this.exportType === "copy" ? this.copyCookies(cookieData) : this.downloadCookies(cookieData);
	}

	render() {
		return html`<web-icon ico="export" title="" @click=${this.exportCookie.bind(this)}></web-icon>
			<web-icon ico="chev-down" title="" style="margin-left: -8px;"></web-icon>
			<menu @change=${this.exportCookie.bind(this)}>
				<li>
					<select name="exportType" title="exportType">
						<option value="copy">${i18n("copy")}</option>
						<option value="download">${i18n("download")}</option>
					</select>
				</li>
				<li>
					<label><input type="radio" name="cookie-format" value="json" checked /> <span>json</span> </label>
				</li>
				<li>
					<label>
						<input type="radio" name="cookie-format" value="headerstring" /> <span>Header String</span>
					</label>
				</li>
				<li>
					<label><input type="radio" name="cookie-format" value="netscape" /> <span>Netscape</span> </label>
				</li>
				<li>
					<label><input type="radio" name="cookie-format" value="csv" /> <span>CSV</span> </label>
				</li>
			</menu>`;
	}

	connectedCallback() {
		this.tabIndex = 0;
		this.replaceChildren(this.render());
		const format = localStorage.getItem("cookie-format");
		if (format) (this.format = format), ($(`input[value="${format}"]`, this).checked = true);
	}
}

customElements.define("export-cookie", ExportCookie);
