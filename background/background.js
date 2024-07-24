chrome.action.onClicked.addListener(() => {
	chrome.windows.getAll({ windowTypes: ["popup"], populate: true }, (windows) => {
		if (windows.length !== 0) return chrome.windows.update(windows[0].id, { focused: true });
		chrome.windows.create({
			url: "popup/index.html",
			type: "popup",
			focused: true,
			height: 480,
			width: 870,
			top: 300,
			left: 500,
		});
	});
});

export const setInstallation = ({ reason }) => {
	async function oneTimeInstall() {
		chrome.tabs.create({ url: "/guide/welcome-guide.html" });
		//> uninstall survey setup
		const LAMBA_KD = crypto.randomUUID();
		chrome.storage.local.set({ modHeaderEnable: true, extUserId: LAMBA_KD });
		const SURVEY_URL = `https://uninstall-feedback.pages.dev/?e=${chrome.runtime.id}&u=${LAMBA_KD}`;
		chrome.runtime.setUninstallURL(SURVEY_URL);
	}
	reason === "install" && oneTimeInstall();
};

// installation setup
chrome.runtime.onInstalled.addListener(setInstallation);
