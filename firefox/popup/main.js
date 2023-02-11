document.addEventListener("click", (e) => {
	if (e.target.classList.contains("radioOS")) {
		browser.runtime.sendMessage({cmdCS: "setOS", opt: e.target.value});
	} else if (e.target.classList.contains("radioBRO")) {
		browser.runtime.sendMessage({cmdCS: "setBRO", opt: e.target.value});
	} else if (e.target.classList.contains("optua")) {
		browser.runtime.sendMessage({cmdCS: "setSELUA", opt: e.target.textContent});
	} else if (e.target.classList.contains("sub")) {
		const form = document.querySelector("form");
		
		if (e.target.id === 'apply') {
			browser.runtime.sendMessage({cmdCS: "setUA", opt: form[0].value});

			let os = document.querySelector("input[type='radio'][class='radioOS']:checked");
			if(os) {
				os = os.value;
			}
			browser.runtime.sendMessage({cmdCS: "setRndUA", opt: [form[3].checked, form[4].value, form[5].value, os]});
		} else if (e.target.id === 'reset') {
			browser.runtime.sendMessage({cmdCS: "reset"});
		}
	} else if (e.target.id === 'togglePower') {
		browser.runtime.sendMessage({cmdCS: "setPow", opt: e.target.checked});
		browser.runtime.sendMessage({cmdCS: "getPow"});
	} else if (e.target.id === 'toggleRnd') {
		checkErr();
	} else {
		return;
	}
});

browser.runtime.onMessage.addListener((msg) => {
	if (msg.cmd === "buildList"){
		document.getElementById("result").innerHTML = msg.list;	
	} else if (msg.cmd === "showSel") {
		document.getElementById("currUA").value = msg.sel;
	} else if (msg.cmd === "showUA") {
		document.getElementById("currUA").value = msg.currUA;
	} else if(msg.cmd==="power"){
		if(msg.pow==="on"){
			document.getElementById("togglePower").checked = true;
			document.getElementById("powerState").innerHTML = "ON";
			document.getElementById("powerState").setAttribute("style","color: #0000FF");
			browser.browserAction.setBadgeText({text: 'ON'});
			browser.browserAction.setBadgeBackgroundColor({color: '#008000'});
		}else{
			document.getElementById("togglePower").checked = false;
			document.getElementById("powerState").innerHTML = "OFF";
			document.getElementById("powerState").setAttribute("style","color: #FF0000");
			browser.browserAction.setBadgeText({text: 'OFF'});
			browser.browserAction.setBadgeBackgroundColor({color: '#FF6550'});
		}
	} else if(msg.cmd === "random" ) {
	 	document.getElementById("toggleRnd").checked = msg.state;
	 	document.getElementById("rndNum").value = msg.nrup;
	 	document.getElementById("rndType").value = msg.type;
	 	
	 	if(msg.state && msg.showRndOs){
	 		document.querySelector("label[for='" + document.querySelector(`input[type='radio'][class='radioOS'][value="${msg.showRndOs}"`).id + "']").setAttribute("style","text-decoration: underline double #0000FF;");
	 	}	
	} else {
		return;
	}
});

document.addEventListener("readystatechange", (e) => {
	browser.runtime.sendMessage({cmdCS: "getUA"});
	browser.runtime.sendMessage({cmdCS: "clearQ"});
	browser.runtime.sendMessage({cmdCS: "getPow"});
	browser.runtime.sendMessage({cmdCS: "getRndUA"});
});

document.getElementById("rndNum").addEventListener("change", checkErr);

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

document.getElementById("infoPop").addEventListener("click", (e)=>{
	document.getElementById("txtPop").classList.toggle("show");
});