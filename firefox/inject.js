let ua = navigator.userAgent;

function getCpu(ua,os) {
	os = os + ' ';
	// remove rv.XX and last ";"
	let raw = ua.split(/\(|\)/)[1].replace(/\brv(.*)/, '').trim();
	raw = (raw.slice(-1) == ';' ? raw.slice(0,-1) : raw);
	let oc;
	if (raw.includes(os)) {
		oc = raw.substr(raw.indexOf(os));
	} else {
		oc = raw.replace(os.trim() + ';', '').trim();
	}
	return oc;
}

let acn = ua.split(/\(|\)/)[0].split('/')[0];
let av = ua.split(/\(|\)/)[0].split('/')[1];
let av2 = ua.split(/\(|\)/)[1].split(';')[0];
av = av + " (" + av2 + ")";

let pf;
let cpu;

if (ua.toLowerCase().indexOf("android") >= 0) {
	os = "Android";
	cpu = getCpu(ua,os);
	pf = "Linux armv7l";
} else if (ua.toLowerCase().indexOf("iphone") >= 0) {
	os = "iPhone";
	cpu = getCpu(ua,os);
	pf = "iPhone";
} else if (ua.toLowerCase().indexOf("ipad") >= 0) {
	os = "iPad";
	cpu = getCpu(ua,os);
	pf = "iPad";
} else if (ua.toLowerCase().indexOf("ipod") >= 0) {
	os = "iPod";
	cpu = getCpu(ua,os);
	pf = "iPod";
} else if (ua.toLowerCase().indexOf("windows") >= 0) {
	os = "Windows";
	cpu = getCpu(ua,os);
	pf = "Win32";
} else if (ua.toLowerCase().indexOf("linux") >= 0 || ua.toLowerCase().indexOf("x11") >= 0) {
	os = "Linux";
	cpu = getCpu(ua,os);
	pf = "Linux x86_64";
} else if (ua.toLowerCase().indexOf("mac") >= 0) {
	os = "Mac";
	cpu = getCpu(ua,os);
	pf = "MacIntel";
} else {
	os = '';
	cpu = '';
	pf = '';
}

let inj_code = `Object.defineProperties(navigator, {
	'platform': {
		value: "${pf}",
		configurable: true
	},
	'oscpu': {
		value: "${cpu}",
		configurable: true
	},
	'appCodeName': {
		value: "${acn}",
		configurable: true
	},
	'appVersion': {
		value: "${av}",
		configurable: true
	}
});`;
let inj_el = document.createElement('script');
inj_el.appendChild(document.createTextNode(inj_code));
(document.head || document.documentElement).appendChild(inj_el);
inj_el.parentNode.removeChild(inj_el);