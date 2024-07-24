const eId = document.getElementById.bind(document);
const setLang = (/** @type {string} */ key) => (eId(key).textContent = chrome.i18n.getMessage(key));
setLang("open_modifycookie_in");
setLang("popup_panel");
setLang("separate_popup_window");

const openPanelConfig = eId("open_panel_config");
openPanelConfig.addEventListener("change", ({ target }) => {
	const html = target.value === "popupWindow" ? "" : "popup/index.html";
	chrome.action.setPopup({ popup: html });
});

const openPopupPanel = await chrome.action.getPopup({});
openPopupPanel || (document.querySelector('input[value="popupWindow"]').checked = true);
