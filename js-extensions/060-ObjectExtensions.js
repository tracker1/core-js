
//console.debug("begin objectextensions.js");

//deep comparison of two objects
//if (typeof Object.equals == "undefined")
//Object.equals = function(a, b) {
//	if (typeof a != typeof b)
//		return false;
//		
//	if (a === b)
//		return true;
//		
//	if (a instanceof RegExp)
//		return a.toString() === b.toString();
//		
//	if (a instanceof Date)
//		return Number(a) === Number(b);
//		
//	if (typeof a != 'object') 
//		return false;
//	
//	if (a.length !== undefined) {
//		if (a.length !== b.length) 
//			return false;

//		for (var i = 0, len = a.length; i < len; ++i)
//			if (!equal(a[i], b[i]))
//				return false;
//	}
//	
//	for (var key in a) {
//		if (!equal(a[key], b[key]))
//			return false;
//	}
//	
//	return true;
//}

//if (typeof Object.prototype.equals == "undefined")
//Object.prototype.equals = function(b) {
//	return Object.equals(this, b);
//}


//console.debug("end objectextensions.js");

