// CSS 2.1
oCSSSelectorPseudoSelectors["first-child"]	= function(oElement) {
	return fCSSSelectorGetPreviousSibling(oElement) == null;
};

oCSSSelectorPseudoSelectors["link"]		= function(oElement) {
	return oElement.tagName.toLowerCase() == 'a' && oElement.getAttribute("href");
};

oCSSSelectorPseudoSelectors["lang"]		= function(oElement, sArgument) {
	for (var sValue; oElement.nodeType != 9; oElement = oElement.parentNode)
		if (sValue =(oElement.getAttribute("lang") || oElement.getAttribute("xml" + ':' + "lang")))
			return sValue.indexOf(sArgument) == 0;
	return false;
};

// Dynamic pseudo-classes (not supported)
oCSSSelectorPseudoSelectors["visited"]	= function(oElement) {
	return false;
};

oCSSSelectorPseudoSelectors["active"]	= function(oElement) {
	return false;
};

oCSSSelectorPseudoSelectors["hover"]	= function(oElement) {
	return false;
};

oCSSSelectorPseudoSelectors["focus"]	= function(oElement) {
	return false;
};

// CSS 3
oCSSSelectorPseudoSelectors["contains"]	= function(oElement, sParam) {
	return (oElement.textContent || oElement.innerText).indexOf(fCSSSelectorUnquote(sParam)) >-1;
};

oCSSSelectorPseudoSelectors["root"]		= function(oElement) {
	return oElement == oElement.ownerDocument.documentElement;
};

oCSSSelectorPseudoSelectors["empty"]	= function(oElement) {
	return oElement.firstChild ? false : true;
};

oCSSSelectorPseudoSelectors["last-child"]	= function(oElement) {
	return fCSSSelectorGetNextSibling(oElement) == null;
};

oCSSSelectorPseudoSelectors["nth-child"]		= function(oElement, sParam) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["nth-last-child"]	= function(oElement, sParam) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["nth-of-type"]		= function(oElement, sParam) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["nth-last-of-type"]	= function(oElement, sParam) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["first-of-type"]= function(oElement) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["last-of-type"]	= function(oElement) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["only-child"]	= function(oElement) {
	return !fCSSSelectorGetNextSibling(oElement) && !fCSSSelectorGetPreviousSibling(oElement);
};

oCSSSelectorPseudoSelectors["only-of-type"]	= function(oElement) {
	// TODO
	return false;
};

oCSSSelectorPseudoSelectors["target"]		= function(oElement) {
	return oElement.id == window.location.hash.slice(1);
};

oCSSSelectorPseudoSelectors["enabled"]		= function(oElement) {
	return oElement.disabled === false;
};

oCSSSelectorPseudoSelectors["disabled"]		= function(oElement) {
	return oElement.disabled == true;
};

oCSSSelectorPseudoSelectors["checked"]		= function(oElement) {
	return oElement.checked == true;
};