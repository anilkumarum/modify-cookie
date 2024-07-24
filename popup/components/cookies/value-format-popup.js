import { html } from "../../js/om.compact.js";

export class ValueFormatPopup extends HTMLElement {
	constructor() {
		super();
	}

	show(evt) {
		this.targetField = evt.target;
		this.style.left = evt.pageX + "px";
		this.style.top = evt.pageY + "px";
		this.showPopover();
		evt.preventDefault();
	}

	setValue(value) {
		this.targetField.value = value;
		this.targetField.closest("tr").cookie.value = value;
	}

	encodeBase64() {
		this.setValue(btoa(this.targetField.value));
	}

	decodeBase64() {
		this.setValue(atob(this.targetField.value));
	}

	encodeUrl() {
		this.setValue(encodeURI(this.targetField.value));
	}

	decodeUrl() {
		this.setValue(decodeURI(this.targetField.value));
	}

	render() {
		return html`<li><span @click=${this.encodeBase64.bind(this)}>encode base64</span></li>
			<li><span @click=${this.decodeBase64.bind(this)}>decode base64</span></li>
			<li><span @click=${this.encodeUrl.bind(this)}>encode url</span></li>
			<li><span @click=${this.decodeUrl.bind(this)}>decode url</span></li> `;
	}

	connectedCallback() {
		this.setAttribute("popover", "");
		this.replaceChildren(this.render());
	}
}

customElements.define("value-format-popup", ValueFormatPopup);

const formatPopup = new ValueFormatPopup();
document.body.appendChild(formatPopup);
export const formatValue = formatPopup.show.bind(formatPopup);
