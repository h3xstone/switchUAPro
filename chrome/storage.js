(async ()=>{
	await chrome.storage.local.get().then((items) => {
		for(const [k,v] of Object.entries(items)) {
			try {
				localStorage.setItem(k,v);
			} catch (e) {
				// iframe behavior with incognito mode + chrome://settings/content/cookies (block 3rd) raise error
			}
		}
	});
})();