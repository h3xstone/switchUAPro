'use strict';

const ua_list = {};
let sel_os;
let sel_bro;
let status;
const objRand = {
	type: "requests",
	last_t: null,
	osRsel: null,
};

/******** CODE RUN AT INIT **********/

(async () => {
	await fetch("../listAgent.json")
			.then((resp) => {return resp.json();})
			.then((json_data) => {Object.assign(ua_list, json_data);});
})();

/********** CODE KEEP LISTEN ***********/

document.addEventListener('click', (e) => {
	if (e.target.classList.contains("radioOS")) {
		sel_os = e.target.value;
		updateList();
	} else if (e.target.classList.contains("radioBRO")) {
		if(e.target.value === 'all'){
			sel_bro = null;
		} else {
			sel_bro = e.target.value;	
		}
		updateList();
	} else if (e.target.classList.contains("optua")) {
		document.getElementById("currUA").value = e.target.textContent;
		if(document.getElementById("apply").hasAttribute("disabled")){
			document.getElementById("apply").removeAttribute("disabled");
		}
	} else if (e.target.classList.contains("sub")) {
		const form = document.querySelector("form");
		if (e.target.id === 'apply') {
			setUA(form[0].value);	
			let os = document.querySelector("input[type='radio'][class='radioOS']:checked");
			if(os) {
				os = os.value;
			}
			setRandomUA(form[3].checked, form[4].value, form[5].value, os);
			getRandomUA();
		} else if (e.target.id === 'reset') {
			resetAll();
		}
	} else if (e.target.id === 'togglePower') {
		setPower(e.target.checked);
		getPower();
	} else if (e.target.id === 'toggleRnd') {
		checkErr();
	} else {
		return;
	}
});

document.getElementById("infoPop").addEventListener("click", (e) => {
	document.getElementById("txtPop").classList.toggle("show");
});

document.getElementById("rndNum").addEventListener("change", checkErr);

document.getElementById("currUA").addEventListener("input", (e) => {
	if(e.target.value.trim() === ''){
		document.getElementById("apply").setAttribute("disabled",true);
	} else {
		if (document.getElementById("apply").hasAttribute("disabled"))
			document.getElementById("apply").removeAttribute("disabled");
	}
});

document.addEventListener('readystatechange',(e)=>{	
	getUA();
	getPower();
	getRandomUA();
});

/*********** MAIN FUNCTION ******************/

function updateList(){
	if(!sel_os){
		return;
	}
	let res = '<select name="slua" id="slua" size="10">';
	let cont = 0;
	if(sel_bro){
		const arr = ua_list[sel_os][sel_bro];
		arr.forEach(function(el) {
			cont++;
			res = res.concat('<option class="optua">',el,'</option>');
		});
	} else {
		const arr = ua_list[sel_os];
		for(const bro in arr){
			arr[bro].forEach(function(el){
				cont++;
				res = res.concat('<option class="optua">',el,'</option>');
			});
		}
	}
	res = res.concat('</select>');
	document.getElementById("result").innerHTML = res;
}

function setUA(p){
	chrome.storage.local.set({uav: p, uapl: sel_os});
	switchStorage();
}

function getUA(){
	chrome.storage.local.get(["uav"])
			.then((res) => {
				if (res.uav) {
					document.getElementById("currUA").value = res.uav;			
				} else {
					document.getElementById("currUA").value = navigator.userAgent;
				}
			});
}

function setPower(v){
	if(v){
		status = "on";
		chrome.storage.local.set({uaps: status});
		chrome.action.setBadgeText({text: 'ON'});
		chrome.action.setBadgeBackgroundColor({color: '#008000'});
		handleRandom(true);
	}else{
		status = "off";
		chrome.storage.local.set({uaps: status});
		chrome.action.setBadgeText({text: 'OFF'});
		chrome.action.setBadgeBackgroundColor({color: '#FF6550'});
		handleRandom(false);
	}

	switchStorage();
}

function getPower(){
	if(!status){
		chrome.storage.local.get(["uaps"])
			.then((res) => {
				if(res.uaps && res.uaps === "on"){
					status = "on";
					document.getElementById("togglePower").checked = true;
					document.getElementById("powerState").innerHTML = "ON";
					document.getElementById("powerState").setAttribute("style","color: #0000FF");
					chrome.action.setBadgeText({text: 'ON'});
					chrome.action.setBadgeBackgroundColor({color: '#008000'});
				} else {
					status = "off";
					document.getElementById("togglePower").checked = false;
					document.getElementById("powerState").innerHTML = "OFF";
					document.getElementById("powerState").setAttribute("style","color: #FF0000");
					chrome.action.setBadgeText({text: 'OFF'});
					chrome.action.setBadgeBackgroundColor({color: '#FF6550'});
				}
			});
	} else {
		if(status === "on") {
		document.getElementById("togglePower").checked = true;
		document.getElementById("powerState").innerHTML = "ON";
		document.getElementById("powerState").setAttribute("style","color: #0000FF");
		} else {
		document.getElementById("togglePower").checked = false;
		document.getElementById("powerState").innerHTML = "OFF";
		document.getElementById("powerState").setAttribute("style","color: #FF0000");
		}
	}
}

function setRandomUA(s,n,t,o) {
	objRand.flag = s;
	objRand.nr = parseInt(n);
	objRand.type = t;
	objRand.osRsel = o;

	chrome.storage.local.set({
		"uars": JSON.stringify({
			"flag": objRand.flag,
			"nr": objRand.nr,
			"type": objRand.type,
			"osRsel": objRand.osRsel
		})
	});
	
	if(status === "on")
		handleRandom(objRand.flag);
}

function getRandomUA() {
	if(!objRand.flag || !objRand.nr || !objRand.type || !objRand.osRsel) {
		chrome.storage.local.get(["uars"])
			.then((res) => {
				if(res.uars){
					Object.assign(objRand, JSON.parse(res.uars));
					document.getElementById("toggleRnd").checked = objRand.flag;
					document.getElementById("rndNum").value = objRand.nr;
					document.getElementById("rndType").value = objRand.type;
					if(objRand.flag && objRand.osRsel){
						document.querySelector("label[for='" + document.querySelector(`input[type='radio'][class='radioOS'][value="${objRand.osRsel}"`).id + "']").setAttribute("style","text-decoration: underline double #0000FF;");
 					}
				}
			});
	}else{
		document.getElementById("toggleRnd").checked = objRand.flag;
		document.getElementById("rndNum").value = objRand.nr;
		document.getElementById("rndType").value = objRand.type;
		if(objRand.flag && objRand.osRsel){
			document.querySelector("label[for='" + document.querySelector(`input[type='radio'][class='radioOS'][value="${objRand.osRsel}"`).id + "']").setAttribute("style","text-decoration: underline double #0000FF;");
	 	}
	}
}

function handleRandom(v){
	if(v){
		if(!objRand.flag){
			return;
		}
		if(objRand.type === "requests"){
			chrome.alarms.clearAll();
			chrome.storage.local.set({ua_rc: 0});
		} else if (objRand.type === "minutes"){
			chrome.storage.local.remove(["ua_rc"]);
			chrome.alarms.clearAll();
			chrome.alarms.create({delayInMinutes: objRand.nr});
		}
	} else {
		if(objRand.type === "requests"){
			chrome.storage.local.remove(["ua_rc"]);
		} else if(objRand.type === "minutes"){
			chrome.alarms.clearAll();
		}
	}
}

function resetAll(){
	objRand.flag = false;
	objRand.nr = null;
	objRand.osRsel = null;
	handleRandom(false);
	sel_bro = null;
	sel_os = null;

	chrome.storage.local.clear();
	chrome.storage.local.set({uav: navigator.userAgent, uapl: navigator.platform, uaps: "off"});
}

function checkErr(){
	let btn = document.getElementById("apply");
	let nr = document.getElementById("rndNum");
	let flag = document.getElementById("toggleRnd").checked;
	
	if(flag && (!nr.value || nr.value < 1 || nr.value > 999999)) {
		btn.setAttribute("disabled",true);
		nr.setAttribute("style","border: 2px solid #FF0000;");
	} else {
		btn.removeAttribute("disabled");
		nr.removeAttribute("style");
	}
}

function switchStorage(){
	chrome.tabs.query({active: true, currentWindow: true},(tabs)=>{
		chrome.scripting.executeScript({
			target: {tabId: tabs[0].id, allFrames: true,},
			files: ["storage2.js"],
			injectImmediately: true,
		});
	});
}