/*============================================================================
Simple Browser Detection Script
Author: Michael J. Ryan (http://tracker1.info)

Public Domain

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
------------------------------------------------------------------------------

Browser matching for various browser.

	browser.ie
	browser.gecko
		browser.firefox
	browser.khtml
		browser.webkit
			browser.chrome
			browser.safari
	browser.opera

recommended:
	use browser.gecko over browser.firefox
	use browser.webkit over browser.chrome or browser.safari

============================================================================*/
//console.debug("begin browser.js");
(function(b){
	b.any = !!(navigator && navigator.userAgent);
	if (!b.any) return;

	//browsermatch method...
	function bm(re) {
		var m = navigator.userAgent.match(re);
		return (m && m[1]);
	}

	//setup browser detection
	b.gecko = parseFloat(bm(/Gecko\/(\d+)/)) || null;
	b.ff = parseFloat(bm(/Firefox\/(\d+\.\d+)/)) || null;
	b.khtml = parseFloat(bm(/\((KHTML)/) && 1) || null;
	b.webkit = parseFloat(bm(/AppleWebKit\/(\d+\.\d+)/));
	b.chrome = parseFloat(b.webkit && bm(/Chrome\/(\d+\.\d+)/)) || null;
	b.safari = parseFloat(b.webkit && bm(/Safari\/(\d+\.\d+)/) && bm(/Version\/(\d+\.\d+)/)) || null;
	b.opera = parseFloat(bm(/Opera\/(\d+\.\d+)/) && bm(/Version\/(\d+\.\d+)/)) || bm(/Opera\/(\d+\.\d+)/) || null;
	b.ie =  (function(){ //http://ajaxian.com/archives/attack-of-the-ie-conditional-comment
		var v = 4, div = document.createElement('div');
		while (div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',div.getElementsByTagName('i')[0]);
		return v > 5 ? v : null;
	}());

	//delete empty values
	for (var x in b) {
		if (b[x] === null)
			delete b[x];
	}

	//disable IE matching for older Opera versions.
	if (b.opera && b.ie) delete b.ie;
}(this.browser = this.browser || {}));
//console.debug("end browser.js");