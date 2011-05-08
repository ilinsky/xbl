// CSS 1
oCSSSelectorAttributeSelectors['']	= function(sValue, sCompare) {
	return true;
};

// CSS 2.1
oCSSSelectorAttributeSelectors['=']	= function(sValue, sCompare) {
	return sValue == sCompare;
};

oCSSSelectorAttributeSelectors['~=']	= function(sValue, sCompare) {
	var oCache	= arguments.callee.$cache || (arguments.callee.$cache = {}),
		rRegExp	= oCache[sCompare] || (oCache[sCompare] = window.RegExp('(^| )' + fCSSSelectorEscape(sCompare) + '( |$)'));
	return rRegExp.test(sValue);
};

oCSSSelectorAttributeSelectors['|=']	= function(sValue, sCompare) {
	var oCache	= arguments.callee.$cache || (arguments.callee.$cache = {}),
		rRegExp	= oCache[sCompare] || (oCache[sCompare] = window.RegExp('^' + fCSSSelectorEscape(sCompare) + '(-|$)'));
	return rRegExp.test(sValue);
};

// CSS 3
oCSSSelectorAttributeSelectors['^=']	= function(sValue, sCompare) {
	return sValue.indexOf(sCompare) == 0;
};

oCSSSelectorAttributeSelectors['$=']	= function(sValue, sCompare) {
	return sValue.indexOf(sCompare) == sValue.length - sCompare.length;
};

oCSSSelectorAttributeSelectors['*=']	= function(sValue, sCompare) {
	return sValue.indexOf(sCompare) >-1;
};