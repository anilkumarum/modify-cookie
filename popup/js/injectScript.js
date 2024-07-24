globalThis.windowId = (await chrome.windows.getLastFocused({ windowTypes: ["normal"] })).id;
export const crtTabId = async () => (await chrome.tabs.query({ windowId: windowId, active: true }))[0].id;
export const crtTabUrl = async () => (await chrome.tabs.query({ windowId: windowId, active: true }))[0].url;

export async function extractAllFrameUrls(tabId) {
	function getUrl() {
		return location.href;
	}

	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId, allFrames: true },
			func: getUrl,
		});
		return results.map((frame) => frame.result).filter((url) => url);
	} catch (error) {
		console.info(error);
	}
}
