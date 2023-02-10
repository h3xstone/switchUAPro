'use strict';

const objUAL = {};
const objSettings = {};

const getList = fetch("listAgent.json").then((resp) => {return resp.json();}).then((json_data) => {Object.assign(objUAL, json_data);});

const getOpts = chrome.storage.local.get().then((items) => {Object.assign(objSettings,items);});

/****** CODE RUN AT INIT *******/

async function init(){
	await getList;
	await getOpts;
	updateRules();
}
init();

/***** CODE BROWSER OPENED *******/

chrome.runtime.onStartup.addListener(()=>{ 
	init();
});

/********* CODE KEEP LISTEN ***********/

chrome.webRequest.onSendHeaders.addListener(async ()=>{
	if(!objSettings.hasOwnProperty("ua_rc")){
		try {
			await getOpts;
		} catch (e){
			// debug console.log("ERROR",e);
		}
	}
	
	if(objSettings.hasOwnProperty("ua_rc") && !(isNaN(objSettings.ua_rc) || objSettings.ua_rc==undefined)){
		objSettings.ua_rc++;
		chrome.storage.local.set({ua_rc: objSettings.ua_rc});
	}
},
{urls: ["<all_urls>"]}
);

chrome.storage.onChanged.addListener((ch, ns) => {
	for (let [k, {oldValue, newValue}] of Object.entries(ch)){
		objSettings[k] = newValue;
		if(k === 'ua_rc'){
			checkRandom();
		}else if (k === 'uav' || k === 'uapl' || k === 'uaps'){
			updateRules();			
		}
	}
});

chrome.alarms.onAlarm.addListener(async()=>{
	await getList;
	await getOpts;
	checkRandom();
});

/*********** MAIN FUNCTIONS **********/

function updateRules(){
	if(objSettings.uaps === 'on'){
		chrome.action.setBadgeText({text: 'ON'});
		chrome.action.setBadgeBackgroundColor({color: '#008000'});
		enableRules();
	} else if(objSettings.uaps === 'off'){
		chrome.action.setBadgeText({text: 'OFF'});
		chrome.action.setBadgeBackgroundColor({color: '#FF6550'});
		disableRules();
	}
}

function enableRules(){
	let ua = (objSettings.uav) ? objSettings.uav : '';
	let plat = (objSettings.uapl) ? objSettings.uapl : '';
	let mob = (plat) ? ((plat === 'android' || plat === 'apple') ? '?1' : '?0') : '';
		
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [1],
		addRules: [{
			id: 1,
			priority: 1,
			action: {
				type: "modifyHeaders",
				requestHeaders: [
					{
						operation: "set",
						header: "User-Agent",
						value: ua
					},
					{
						operation: "set",
						header: "sec-ch-ua",
						value: ""
					},
					{
						operation: "set",
						header: "sec-ch-ua-mobile",
						value: mob
					},
					{
						operation: "set",
						header: "sec-ch-ua-platform",
						value: plat
					}
				]
			},
			condition: {
				"resourceTypes": ["main_frame", "sub_frame"]
			}
		}]
	});
	
	(async () => {
		await chrome.scripting.getRegisteredContentScripts({ids: ["inject"],})
			.then((res) => {
				if(res.length === 0 && res == ''){
					(async () => {
						try {
							await chrome.scripting.registerContentScripts([
									{
										id: "inject",
										matches: ["<all_urls>"],
										js: ["inject.js"],
										runAt: 'document_start',
										world: 'MAIN',
										allFrames: true,
									}
							]);
						} catch (e) {
							// debug console.log("regCS 1 - ERROR =>",e);
						}
					})();
				} else {
					(async () => {
						await chrome.scripting.unregisterContentScripts({ids: ["inject"],})
						.then(()=>{
							(async () => {
								try {
									await chrome.scripting.registerContentScripts([
										{
											id: "inject",
											matches: ["<all_urls>"],
											js: ["inject.js"],
											runAt: 'document_start',
											world: 'MAIN',
											allFrames: true,
										}
									]);
								} catch (e) {
									// debug console.log("regCS 2 - ERROR =>",e);
								}						
							})();
						});
					})();
				}
			});
	})();
}

function disableRules(){
	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [1]
	});
	
	(async () => {
		await chrome.scripting.getRegisteredContentScripts({ids: ["inject"],})
			.then((res) => {
				if(res.length > 0 && res !== ''){
					(async () => {
						await chrome.scripting.unregisterContentScripts({ids: ["inject"],});
					})();
				} else {
					// debug console.log("no script to unregister");
				}
			});
	})();
}

function checkRandom(){
	let ua_rp = JSON.parse(objSettings.uars);
	let r_tot = ua_rp.nr;
	let r_state = ua_rp.flag;
	let r_type = ua_rp.type;
	if(!r_state){
		return;
	}
	if(r_type === "requests"){
		if(r_tot && objSettings.ua_rc && objSettings.ua_rc >= r_tot){	
			let new_ua = loop();
			chrome.storage.local.set({uav: new_ua, ua_rc: 0});
		}
	} else if(r_type === "minutes"){
		if (objSettings.uaps === 'on') {
			chrome.alarms.clearAll();
			let new_ua = loop();
			chrome.storage.local.set({uav: new_ua});
			chrome.alarms.create({delayInMinutes: r_tot});
		} else if(objSettings.uaps === 'off'){
			chrome.alarms.clearAll();
		}
	}
}

function loop(){
	let r_os;
	let r_osSel = JSON.parse(objSettings.uars).osRsel;
	
	if(r_osSel){
		r_os = r_osSel;
	} else {
		let klos = Object.keys(objUAL).length;
		r_os = Object.keys(objUAL)[Math.floor(Math.random()*klos)];
	}

	let klbr = Object.keys(objUAL[r_os]).length;
	let r_br = Object.values(objUAL[r_os])[Math.floor(Math.random()*klbr)];
	let r_ua = r_br[Math.floor(Math.random()*r_br.length)];

	return r_ua;	
}