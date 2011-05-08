// CSS 1
oCSSSelectorElementSelectors[' ']	= function(aReturn, oElement, sTagName, fNSResolver) {
	for (var n = 0, aSubset	= fCSSSelectorGetElementsByTagName(oElement, sTagName, fNSResolver), m = aSubset.length; n < m; n++)
		aReturn.push(aSubset[n]);
};

// CSS 2.1
oCSSSelectorElementSelectors['>']	= function(aReturn, oElement, sTagName, fNSResolver) {
	for (var n = 0, aSubset = oElement.childNodes, m = aSubset.length; n < m; n++)
		if (aSubset[n].nodeType == 1)
			if (fCSSSelectorIfElementNS(aSubset[n], sTagName, fNSResolver))
				aReturn.push(aSubset[n]);
};

oCSSSelectorElementSelectors['+']	= function(aReturn, oElement, sTagName, fNSResolver) {
   	if (oElement = fCSSSelectorGetNextSibling(oElement))
   		if (fCSSSelectorIfElementNS(oElement, sTagName, fNSResolver))
			aReturn.push(oElement);
};

// CSS 3
oCSSSelectorElementSelectors['~']	= function(aReturn, oElement, sTagName, fNSResolver) {
	while (oElement = fCSSSelectorGetNextSibling(oElement))
		if (fCSSSelectorIfElementNS(oElement, sTagName, fNSResolver))
			aReturn.push(oElement);
};