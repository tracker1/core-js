module.exports = function getPlatform(agent) {
	agent = agent.toString().trim().toLowerCase();

	var platform = {};
	if (isPortable(agent,platform)) platform.portable = true;
	if (isPhone(agent,platform)) platform.phone = true;
	if (platform.phone) platform.portable = true; //detected phone but not mobile?
	if (platform.portable && !platform.phone) platform.tablet = true;
	if (!platform.portable) platform.desktop = true;

	setOS(agent,platform);
	setBrowser(agent,platform);

	if (isTouch(agent,platform)) platform.touch = true;

	addClasses(agent,platform)
	return platform;
}

function addClasses(agent,platform) {
	platform.classNames = []
		.concat(platform.phone ? 'phone' : false)
		.concat(platform.tablet ? 'tablet' : false)
		.concat(platform.desktop ? 'desktop' : false)
		.concat(platform.portable ? 'portable' : false)
		.concat(platform.touch ? 'touch' : false)

		.concat(platform.os || null)
		.concat(function(){
			if (!platform.os) return null;
			var v = parseInt(platform.osVersion || 0, 10) || null;
			if (!v) return null;
			return platform.os + '-' + v;
		}())
		.concat(function(){
			if (!platform.os) return null;
			var v = parseFloat(platform.osVersion || 0, 10) || null;
			if (!v) return null;
			return (platform.os + '-' + v).replace(/\./g,'-');
		}())
		.concat(platform.ie && platform.ie < 9 ? 'ie-old' : false)

		.concat(platform.renderers)
		.concat(platform.browser || null)
		.concat(function(){
			if (!platform.browser) return null;
			var v = parseInt(platform.browserVersion || 0, 10) || null;
			if (!v) return null;
			return platform.browser + '-' + v;
		}())
		.concat(function(){
			if (!platform.browser) return null;
			var v = parseFloat(platform.browserVersion || 0, 10) || null;
			if (!v) return null;
			return (platform.browser + '-' + v).replace(/\./g,'-');
		}())

		.filter(function(item, i, arr){ //unique values only
			return item && arr.indexOf(item) === i;
		})
	;
}

function setBrowser(agent, platform) {
	platform.renderers = [];

	// Edge - IE replacement - return early to prevent renderer matching below
	if (matchBrowser(agent, platform, "edge", /\bedge\/(\d+(\.\d+)*)/i)) return;

	//match renderers
	matchBrowserRenderer(agent, platform, "webkit", /\bapplewebkit\/(\d+(\.\d+)*)/i);
	matchBrowserRenderer(agent, platform, "khtml", /\bkhtml\/(\d+(\.\d+)*)/i);
	matchBrowserRenderer(agent, platform, "trident", /\btrident\/(\d+(\.\d+)*)/i);
	matchBrowserRenderer(agent, platform, "gecko", /\bgecko\/(\d+)/i);

	// IE 11
	if (matchBrowser(agent, platform, "ie", /\btrident\/.+\brv:(\d+(\.\d+)*)/i)) return;

	// IE <= 10
	if (matchBrowser(agent, platform, "ie", /MSIE (\d+(\.\d+)*)/i)) return;

	// Mainstream browsers
	if (matchBrowser(agent, platform, "firefox", /\bfirefox\/(\d+(\.\d+)*)/i)) return;
	if (matchBrowser(agent, platform, "chrome", /\bchrome\/(\d+(\.\d+)*)/i)) return;
	if (matchBrowser(agent, platform, "chrome", /\bsamsung\/(\d+(\.\d+)*)/i)) return;
	if (matchBrowser(agent, platform, "safari", /\bversion\/(\d+(\.\d+)*).+\bsafari/i)) return;
}

function matchBrowser(agent, platform, name, test) {
	var v = (agent.match(test) || [])[1];
	if (v) {
		platform.browser = platform.browser || name;
		platform.browserVersion = platform.browserVersion || v;
		platform[name] = parseFloat(v) || true;
		return true;
	}
}

function matchBrowserRenderer(agent, platform, name, test) {
	var v = (agent.match(test) || [])[1];
	if (v) {
		platform.renderers.push(name)
		platform[name] = parseFloat(v, 10) || true;
		return true;
	}
}

function setOS(agent,platform) {
	var os = getOS(agent,platform);
	platform.os = os && os[0] || 'other';
	platform.osVersion = os && os[1] || null;
	platform[platform.os] = parseFloat(platform.osVersion, 10) || true;
}

function getOS(agent, platform) {
	//windows platforms
	var win = (agent.match(/windows( nt|) (\d+(\.\d+)*)/i) || [])[2];
	if (win && platform.phone) return ["Windows Mobile", win]; //includes CE
	if (win && (/\bxbox one\b/).test(agent)) return ["Xbox One", win];
	if (win && (/\bxbox\b/).test(agent)) return ["Xbox", win];
	if (win) {
		return ["windows", win];
	}

	if (/ip(hone|od|ad)/.test(agent)) {
		var ios = (((agent).match(/\bOS\s+(\d+([\.\_]\d+)*)/i) || [])[1] || '').replace(/\_/g, '.');
		return ["ios", ios];
	}

	var android = (agent.match(/android\s(\d+(\.\d+)*)/i) || [])[1];
	if (android) {
		return ["android", android];
	}

	var osx = ((agent.match(/os x\s+(\d+([\.\_]\d+)*)/i) || [])[1] || '').replace(/\_/g, '.');
	if (osx) {
		return ["osx", osx];
	}

	if ((/linux/).test(agent)) {
		return ["linux", 0]; //not detecting linux version
	}

	return ["other", 0]; //unknown
}

function isTouch(agent,platform) {
	if (platform.ios || platform.android) return true; //assume touch for android and ios
	if (typeof window === 'undefined') return false; //no touch by default (server-side)
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
}

function isPhone(agent,platform) {
	if (/phone|mobi|windows ce/i.test(agent)) return true;

	if (typeof window !== 'undefined' && window.screen && window.screen.height && window.screen.width) {
		if (window.screen.height <= 800 && window.screen.width < 800) return true; //small device - meta/viewport element required
	}

	if (platform.portable) {
		//portable device, default to true if not android/ipad
		if (/android|ipad/i.test(agent)) return false;
		return true;
	}

	return false;
}

function isPortable(agent,platform) {
	//test from http://detectmobilebrowser.com/
	return !!(
		/android|ip(hone|od|ad)|windows.+phone|mobile.+windows|iemobile|fennec/i.test(agent)
		||
		/(bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|hiptop|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(agent)
		||
		/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))
	);
}
