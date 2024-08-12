import "./export-cookie.js";
import { html } from "../../js/om.compact.js";
// @ts-ignore
import topbarCss from "../../style/top-bar.css" with { type: "css" };

export class TopBar extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this.shadowRoot.adoptedStyleSheets = [topbarCss];
	}
	allTabs;
	allCookies;

	async importCookies({ currentTarget }) {
		const { ImportCookie } = await import("./import-cookie.js");
		currentTarget.after(new ImportCookie());
	}

	async switchTab({ target }) {
		location.hash = target.value;
		if (target.value === "all-open-tabs" && !this.allTabs) {
			const { AllOpenTabs } = await import("../tabs/all-open-tabs.js");
			this.allTabs = this.nextElementSibling.firstElementChild.after(
				new AllOpenTabs(),
			);
			await new Promise((r) => setTimeout(r, 100));
		} else if (target.value === "all-cookies" && !this.allCookies) {
			const { AllCookies } = await import("../cookies/all-cookies.js");
			this.allCookies = this.nextElementSibling.lastElementChild.after(
				new AllCookies(),
			);
			await new Promise((r) => setTimeout(r, 100));
		}

		eId(target.value).scrollIntoView({ behavior: "smooth" });
	}

	render() {
		return html`<tab-row @change=${this.switchTab.bind(this)}>
				<label>
					<web-icon ico="tab"></web-icon>
					<input type="radio" name="view-cookies" value="current-tab" hidden checked />
					<span>${i18n("current_tab")}</span>
				</label>
				<label>
					<web-icon ico="tabs"></web-icon>
					<input type="radio" name="view-cookies" value="all-open-tabs" hidden />
					<span>${i18n("all_tabs")}</span>
				</label>
				<label>
					<web-icon ico="cookie"></web-icon>
					<input type="radio" name="view-cookies" value="all-cookies" hidden />
					<span>${i18n("all_cookies")}</span>
				</label>
			</tab-row>
			<span>Modify Cookies</span>
			<div class="import-cookies">
				<web-icon ico="cookie-plus" title="" @click=${this.importCookies.bind(this)}></web-icon>
			</div>
			<export-cookie></export-cookie>`;
	}

	connectedCallback() {
		this.shadowRoot.replaceChildren(this.render());
	}
}

customElements.define("top-bar", TopBar);
