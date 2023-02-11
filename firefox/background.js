"use strict";

var selOS;
var selBRO;
var status;
var UA_list;
var ua;
var initw = null;
var rnd_c = 0;
var rnd_nr;
var rnd_flag;
var rnd_t = "requests";
var last_type = null;
var rndOsSel = null;

fetch("listAgent.json")
.then(response=> response.json())
.then(json_data => {UA_list = json_data});

browser.runtime.onMessage.addListener((msg, sender, sendResp) => {
	if (msg.cmdCS === 'setOS'){
		setOS(msg.opt);
	} else if (msg.cmdCS === 'setBRO'){
		setBrowser(msg.opt);
	} else if (msg.cmdCS === 'setSELUA'){
		setSELUA(msg.opt);
	} else if (msg.cmdCS === 'setUA'){
		setUA(msg.opt);
	} else if (msg.cmdCS === 'setRndUA'){
		setRandomUA(msg.opt[0],msg.opt[1],msg.opt[2],msg.opt[3]);
	} else if (msg.cmdCS === 'reset'){
		resetALL();
	} else if (msg.cmdCS === 'setPow'){
		setPower(msg.opt);
	} else if (msg.cmdCS === 'getPow'){
		getPower();
	} else if (msg.cmdCS === 'getUA'){
		getUA();
	} else if (msg.cmdCS === 'clearQ'){
		clearQuery();
	} else if (msg.cmdCS === 'getRndUA'){
		getRandomUA();
	}
	else {
		return;
	}
});

function rewriteUAHeader(e) {
	for (let hdr of e.requestHeaders) {
		if (hdr.name.toLowerCase() === "user-agent") {
			hdr.value = ua;
		}
	}
	
	if(rnd_flag && (rnd_t === "requests")) {
		if(rnd_c < rnd_nr){
			rnd_c += 1;	
		} else {
			loop();
			rnd_c = 0;
		}
	}
	return {requestHeaders: e.requestHeaders};
}

function setOS(par){
	selOS = par;
	updateList();
}

function setBrowser(par){
	if(par === 'all'){
		selBRO = null;
	} else {
		selBRO = par;
	}
	updateList();
}

function setSELUA(par){
	browser.runtime.sendMessage({cmd: "showSel", sel: par});
}

function setUA(par){
	ua = par;
	localStorage.setItem("ualv",ua);
}

function resetALL(){
	ua = navigator.userAgent;
	localStorage.setItem("ualv",ua);
	rnd_flag = false;
	rnd_nr = null;
	rnd_c = 0;
	rndOsSel = null;
	last_type = null;
	
	unsetTimer();
	localStorage.removeItem("uars");
}

function updateList(){
	if(!selOS){
		return;
	}			
	let res = '<select name="slua" id="slua" size="10">';
	let cont = 0;
	if(selBRO){
		const arr = UA_list[selOS][selBRO];
		arr.forEach(function(el) {
			cont++;
			res = res.concat('<option class="optua">',el,'</option>');
		});
	} else {
		const arr = UA_list[selOS];
		for(const bro in arr){
			arr[bro].forEach(function(el){
				cont++;
				res = res.concat('<option class="optua">',el,'</option>');
			});
		}
	}
	res = res.concat('</select>');
	
	browser.runtime.sendMessage({cmd: "buildList", list: res});
}

function getUA(){
	if(!ua){
		if(localStorage.getItem("ualv")) {
			ua = localStorage.getItem("ualv");
		} else {
			ua = navigator.userAgent;
		}
	}
	if(initw) {
		return ua;
	} else {
		browser.runtime.sendMessage({cmd: "showUA", currUA: ua});	
	}	
}

function clearQuery(){
	selOS = null;
	selBRO = null;
}

function setPower(v){
	if(v){
		status = "on";
		browser.webRequest.onBeforeSendHeaders.addListener(rewriteUAHeader, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);

		browser.browserAction.setBadgeText({text: 'ON'});
		browser.browserAction.setBadgeBackgroundColor({color: '#008000'});

		if(rnd_flag && rnd_t==="minutes"){
			setTimer(rnd_nr);
		}
	}else{
		status = "off";
		browser.webRequest.onBeforeSendHeaders.removeListener(rewriteUAHeader, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);

		browser.browserAction.setBadgeText({text: 'OFF'});
		browser.browserAction.setBadgeBackgroundColor({color: '#FF6550'});
		
		if(rnd_flag && rnd_t==="minutes") {
			unsetTimer();
		}
	}
	localStorage.setItem("uaps",status);
}

function getPower(){
	if(!status){
		if (localStorage.getItem("uaps")) {
			status = localStorage.getItem("uaps");
		}
	}
	if (initw) {
		if(status==="on"){
			setPower(true);
		} else {
			setPower(false);
		} 
	} else {
		browser.runtime.sendMessage({cmd: "power", pow: status});
	}
}

window.addEventListener('load', function () {
	initw = true;
	getPower();
	getUA();
	getRandomUA();
	initw = false;
});

function setRandomUA(s,n,t,o) {
	rnd_flag = s;
	rnd_nr = parseInt(n);
	rnd_t = t;
	rnd_c = 0;
	rndOsSel = o;

	localStorage.setItem("uars",JSON.stringify({"state":rnd_flag,"tot":rnd_nr,"type":rnd_t,"los":rndOsSel}));
	
	if(status === "off"){
		return;
	}

	if(!last_type){
		last_type = rnd_t;
	}

	if(rnd_t === "minutes") {
		last_type = rnd_t;
		if(rnd_flag) {
			setTimer(rnd_nr);
		} else {
			unsetTimer();
		}
	} else if (rnd_t === "requests" && last_type === "minutes") {
		unsetTimer();
		last_type = rnd_t;
	}
}

function getRandomUA() {
	if (initw) {
		if(!rnd_flag || !rnd_nr || !rnd_t || !rndOsSel) {
			let rndSettings = localStorage.getItem("uars");
			
			if (rndSettings && rndSettings !== '{}'){
				rndSettings = JSON.parse(rndSettings);
				rnd_flag = rndSettings.state;
				rnd_nr = rndSettings.tot;
				rnd_t = rndSettings.type;
				rndOsSel = rndSettings.los;

				setRandomUA(rnd_flag,rnd_nr,rnd_t,rndOsSel);
			}
		}
	} else {
		browser.runtime.sendMessage({cmd: "random", state: rnd_flag, nrup: rnd_nr, type: rnd_t, showRndOs: rndOsSel});
	}
}

function loop(){
	let rndos;
	if(rndOsSel) {
		rndos = rndOsSel;
	} else {
		let klos = Object.keys(UA_list).length;
		rndos = Object.keys(UA_list)[Math.floor(Math.random()*klos)];
	}	
	let klbr = Object.keys(UA_list[rndos]).length;
	let rndbr = Object.values(UA_list[rndos])[Math.floor(Math.random()*klbr)];
	let rndua = rndbr[Math.floor(Math.random()*rndbr.length)];
	
	setUA(rndua);
}

function setTimer(t) {
	if(browser.alarms.onAlarm.hasListener(loop)){
		browser.alarms.clearAll();
	} else {
		browser.alarms.onAlarm.addListener(loop);
	}
	browser.alarms.create("rndUAtimer", {periodInMinutes: t});
}

function unsetTimer() {
	browser.alarms.clearAll();
	browser.alarms.onAlarm.removeListener(loop);
}