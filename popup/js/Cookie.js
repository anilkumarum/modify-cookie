export class Cookie {
	/** @param {chrome.cookies.Cookie} cookie, @param {string} url*/
	constructor(cookie, url) {
		let expirationDate = cookie ? cookie?.expirationDate : Date.now() + 86400;
		expirationDate = cookie?.expirationDate
			? String(Math.trunc(cookie.expirationDate)).length < 13
				? Date.now() + +cookie.expirationDate
				: +cookie.expirationDate
			: null;
		this.enable = true;
		this.name = cookie?.name ?? "";
		this.value = cookie?.value ?? "";
		this.expirationDate = expirationDate;
		this.httpOnly = cookie?.httpOnly ?? false;
		this.secure = cookie?.secure ?? false;
		this.sameSite = cookie?.sameSite ?? "unspecified";
		this.url = url;
		this.domain = cookie?.domain ?? (URL.canParse(url) && new URL(url).host);
		this.path = cookie?.path ?? "/";
		this.session = cookie?.session ?? !expirationDate;
		this.hostOnly = cookie?.hostOnly ?? false;
	}
}

/** @param {Cookie} cookie*/
export async function setCookie(cookie) {
	try {
		const setDetails = {
			name: cookie.name,
			value: cookie.value,
			domain: cookie.domain,
			path: cookie.path,
			expirationDate: cookie.expirationDate,
			httpOnly: cookie.httpOnly,
			secure: cookie.secure,
			sameSite: cookie.sameSite,
			url: cookie.url,
		};
		await chrome.cookies.set(setDetails);
	} catch (error) {
		console.error(error);
		notify(error.message, "error");
	}
}
