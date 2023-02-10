(async ()=>{
	await chrome.storage.local.get().then((items) => {
		for(const [k,v] of Object.entries(items)) {
			localStorage.setItem(k,v);
		}
	});
})();