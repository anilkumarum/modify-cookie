import { Cookie, setCookie } from "../../js/Cookie.js";
import { crtTabUrl } from "../../js/injectScript.js";
import { html } from "../../js/om.compact.js";

export class ImportCookie extends HTMLDialogElement {
	constructor() {
		super();
	}

	placeholder = {
		json: `[{"name":"Cookie","value":"text",[...]}]`,
		headerString: "Name1=Value1;Name2=Value2;",
		netscape: `Domain\tHostOnly\tPath\tsecure\tExpires/Max-age\tName\tValue\n.stackoverflow.com\tTRUE\t/\ttrue\t1723553112911\tcookie-name\tcookie-value`,
		csv: `Name,Value,Domain,Path,Expires/Max-Age,HttpOnly,Secure,SameSite\ncookie-name,cookie-value,.stackoverflow.com,/,1723553112911,true,true,none`,
	};

	async insertCookie(cookieData) {
		if (!cookieData.name && !cookieData.value) return;
		cookieData.domain ??= this.domain;
		cookieData.path ??= "/";
		const url = "https://" + cookieData.domain + cookieData.path;
		const cookie = new Cookie(cookieData, url);
		setCookie(cookie);
	}

	async parseJsonCookie(jsonContent) {
		try {
			const jsonData = JSON.parse(jsonContent);
			Array.isArray(jsonData) ? jsonData.forEach(this.insertCookie) : this.insertCookie(jsonData);
		} catch (error) {
			console.error(error);
		}
	}

	parseHeaderString(cookieContent) {
		const cookieData = cookieContent.split(";");
		for (const cookie of cookieData) {
			const [name, value] = cookie.split("=");
			this.insertCookie({ name: name.trim(), value: value.trim() });
		}
	}

	parseNetscapeString(cookieContent) {
		const cookieData = cookieContent.split("\n");
		for (const cookie of cookieData) {
			const [domain, hostOnly, path, httpOnly, expirationDate, name, value] = cookie.split(/[\t ]/);
			this.insertCookie({
				name,
				value,
				domain,
				path,
				httpOnly: httpOnly.toLowerCase() === "true",
				expirationDate: +expirationDate,
				hostOnly: hostOnly.toLowerCase() === "true",
			});
		}
	}

	parseCSVString(cookieContent) {
		const index = cookieContent.indexOf("\n");
		const header = cookieContent.slice(0, index);
		const headerKeys = new Map(header.split(",").map((key, index) => [key.toLowerCase(), index]));

		const cookieArr = cookieContent.slice(index).split("\n");
		cookieArr.forEach((cookieData) => {
			cookieData = cookieData.trim();
			const cookie = cookieData.split(",");
			const name = cookie[headerKeys.get("name")];
			if (!name) return;
			const value = cookie[headerKeys.get("value")];
			const domain = cookie[headerKeys.get("domain")];
			const path = cookie[headerKeys.get("path")];
			const httpOnly = cookie[headerKeys.get("httpOnly")];
			const expirationDate = cookie[headerKeys.get("expirationDate")];
			this.insertCookie({ name, value, domain, path, httpOnly, expirationDate });
		});
	}

	parseCookies = {
		csv: this.parseCSVString.bind(this),
		headerString: this.parseHeaderString.bind(this),
		json: this.parseJsonCookie.bind(this),
		netscape: this.parseNetscapeString.bind(this),
	};

	onCookieEditDone() {
		const cookieContent = this.inputField.value;
		this.parseCookies[this.format](cookieContent);
		this.inputField.value = "";
	}

	inputFormatChange({ target }) {
		this.format = target.value;
		this.inputField.placeholder = this.placeholder[this.format];
	}

	onFileUpload(event) {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = async (evt) => {
			const textData = evt.target.result;
			if (typeof textData !== "string") return;
			//if (file.type === "application/json") this.parseJsonCookie(textData);
			//TODO
		};
		reader.onerror = (event) => console.error(event);
		reader.readAsText(file);
	}

	render() {
		return html` <label>
				<div>${i18n("upload_json_netscape_csv_file")}</div>
				<input type="file" accept="application/json,text/csv,text/plain" />
			</label>
			<label>
				<div class="textarea-label">
					<select name="format" title="format" @change=${this.inputFormatChange.bind(this)}>
						<option value="json">JSON</option>
						<option value="headerString">Header string</option>
						<option value="netscape">Netscape</option>
						<option value="csv">CSV</option>
					</select>
					<span> &nbsp;${i18n("format")}</span>
					<web-icon ico="done" title="" @click=${this.onCookieEditDone.bind(this)}></web-icon>
				</div>
				<textarea ref=${(node) => (this.inputField = node)}></textarea>
			</label>`;
	}

	async connectedCallback() {
		this.id = "import-cookie";
		this.replaceChildren(this.render());
		this.showModal();
		document.body.style.minHeight = "400px";
		const tabUrl = await crtTabUrl();
		this.inputField = this.placeholder.json;
		this.domain = URL.canParse(tabUrl) ? new URL(tabUrl).host : null;
	}
}

customElements.define("import-cookie", ImportCookie, { extends: "dialog" });
