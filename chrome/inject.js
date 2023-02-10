let ua;
let p;
let mob;
let cpu;

try {
	ua = localStorage.getItem('uav');
} catch (e) {
	// iframe behavior with incognito mode + chrome://settings/content/cookies (block 3rd) raise error
}
try {
	p = localStorage.getItem('uapl');
} catch (e) {
	// iframe behavior with incognito mode + chrome://settings/content/cookies (block 3rd) raise error
}

if(ua && p){
	mob = (p === 'android' || p === 'apple') ? true : false;
	p = p[0].toUpperCase() + p.substring(1);
	cpu = getCpu(ua,p);
} else {
	ua = '';
	p = '';
	mob = '';
	cpu = '';
}

function getCpu(ua,os) {
	os = os[0].toUpperCase() + os.substring(1) + ' ';
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

Object.defineProperties(navigator, {
	'platform': {
		value: p,
		configurable: true
	},
	'oscpu': {
		value: cpu,
		configurable: true
	},
	'appVersion': {
		value: ua.replace('Mozilla/',''),
		configurable: true
	},
	'userAgentData': {
		value: {
			brands: [],
			mobile: mob,
			platform: p
		},
		configurable: true
	},
	'userAgent': {
		value: ua,
		configurable: true
	},
	'vendor': {
		value: '',
		configurable: true
	}
});