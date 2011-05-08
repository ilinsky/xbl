/*
 * This module contains CSS-Selectors resolver
 * The implementation is inspired by the work of Dean Edwards
 */

var rCSSSelectorEscape		= /([\/()[\]?{}|*+-])/g,
	rCSSSelectorQuotes		= /^('[^']*')|("[^"]*")$/;

var rCSSSelectorGroup			= /\s*,\s*/,
	rCSSSelectorCombinator 		= /^[^\s>+~]/,
	rCSSSelectorAttribute		= /([\w-]*\|?[\w-]+)\s*(\W?=)?\s*([^\]]*)/,
	rCSSSelectorSelector		= /::|[\s#.:>+~()@\[\]]|[^\s#.:>+~()@\[\]]+/g,
	rCSSSelectorWhiteSpace		= /\s*([\s>+~(,]|^|$)\s*/g,
	rCSSSelectorImplyAttribute	= /(\[[^\]]+\])/g,
	rCSSSelectorImplyUniversal	= /([\s>+~,]|[^(]\+|^)([#.:@])/g;

var nCSSSelectorIterator	= 0;

function fCSSSelectorQuery(aFrom, sSelectors, fNSResolver, bAll) {
	var aBase		= aFrom,
		aReturn		= [],
		aSelectors	= sSelectors
			.replace(rCSSSelectorWhiteSpace, '$1')			// trim whitespaces
			.replace(rCSSSelectorImplyAttribute, '@@$1')	// "[a~=asd] --> @@[a~=asd]
			.replace(rCSSSelectorImplyUniversal, '$1*$2')	// ".class1" --> "*.class1"
			.split(rCSSSelectorGroup),
		aSelector,
		sSelector;

	var i, j, sToken, sFilter, sArguments, fSelector, aElements, oElement,
		bBracketRounded, bBracketSquare;

	for (var nSelector = 0, nSelectors = aSelectors.length; nSelector < nSelectors; nSelector++) {
		sSelector = aSelectors[nSelector];
		if (rCSSSelectorCombinator.test(sSelector))
			sSelector = ' ' + sSelector;
		aSelector	= sSelector.match(rCSSSelectorSelector) || [];
		aFrom = aBase;

		for (var nIndex = 0, nLength = aSelector.length; nIndex < nLength; sArguments = '') {
			aElements	= [];

			sToken	= aSelector[nIndex++];
			sFilter	= aSelector[nIndex++];

			// Element selector
			if (fSelector = oCSSSelectorElementSelectors[sToken]) {
				var sTagName	= sFilter.replace('|', ':');
				for (i = 0, j = aFrom.length; i < j; i++)
					fSelector(aElements, aFrom[i], sTagName, fNSResolver);
			}
			else
			// class selector
			if (sToken == '.') {
				var rRegExp	= window.RegExp('(^|\\s)' + sFilter + '(\\s|$)');
				for (i = 0, j = aFrom.length; i < j; i++)
					if (rRegExp.test(aFrom[i].className))
						aElements.push(aFrom[i]);
			}
			else
			// ID selector
			if (sToken == '#') {
				if (oElement = document.getElementById(sFilter))
					for (i = 0, j = aFrom.length; i < j; i++)
						if (aFrom[i] == oElement) {
			   				aElements.push(oElement);
			   				break;
						}
			}
			else
			if (sToken == ':' || sToken == '@') {
				// Get arguments
				bBracketRounded	= aSelector[nIndex] == '(';
				bBracketSquare	= aSelector[nIndex] == '[';
				if (bBracketSquare || bBracketRounded) {
					nIndex++;
					while (aSelector[nIndex++] != (bBracketRounded ? ')' : ']') && nIndex < nLength)
						sArguments += aSelector[nIndex - 1];
				}

				// Attribute selector
				if (sToken == '@') {
					var aMatch 		= sArguments.match(rCSSSelectorAttribute);
					if (fSelector = oCSSSelectorAttributeSelectors[aMatch[2] || '']) {
						var sAttribute	= aMatch[1].replace('|', ':'),
							sCompare	= fCSSSelectorUnquote(aMatch[3]) || '',
							sValue;
						for (i = 0, j = aFrom.length; i < j; i++)
							if (fSelector(fCSSSelectorGetAttributeNS(aFrom[i], sAttribute, fNSResolver), sCompare))
								aElements.push(aFrom[i]);
					}
//->Debug
					else
						cXBLLanguage.onerror("Unknown attribute selector '" + aMatch[2] + "'");
//<-Debug
				}
				else
				// Pseudo-class selector
				if (sToken == ':') {
					if (sFilter == "not") {
						var aNegated = fCSSSelectorQuery([aFrom[0].ownerDocument], sArguments, fNSResolver);
						for (i = 0, j = aFrom.length; i < j; i++) {
							for (var n = 0, m = aNegated.length, bFound	= false; n < m && !bFound; n++)
								if (aNegated[n] == aFrom[i])
									bFound	= true;
							if (!bFound)
								aElements.push(aFrom[i]);
						}
					}
					else {
						if (fSelector = oCSSSelectorPseudoSelectors[sFilter]) {
							for (i = 0, j = aFrom.length; i < j; i++)
								if (fSelector(aFrom[i], sArguments))
									aElements.push(aFrom[i]);
						}
//->Debug
						else
							cXBLLanguage.onerror("Unknown pseudo-class selector '" + sFilter + "'");
//<-Debug
					}
				}
			}
			else
			// Pseudo element selector
			if (sToken == '::') {
				// Not implemented
			}
//->Debug
			else
				cXBLLanguage.onerror("Unknown CSS selector '" + sToken + "' in query '" + sSelector + "'");
//<-Debug
			aFrom	= aElements;
		}

		// Filter out duplicate elements
		for (i = 0, j = aElements.length; i < j; i++) {
			oElement = aElements[i];
			if (oElement._nCSSSelectorIterator != nCSSSelectorIterator) {
				oElement._nCSSSelectorIterator	= nCSSSelectorIterator;
				aReturn.push(oElement);
			}
		}
//		aElements	= aElements.concat(aElements);
	}

	nCSSSelectorIterator++;

	return aReturn;
};

// String utilities
function fCSSSelectorEscape(sValue) {
	return sValue.replace(rCSSSelectorEscape, '\\$1');
};

function fCSSSelectorUnquote(sString) {
	return rCSSSelectorQuotes.test(sString) ? sString.slice(1, -1) : sString;
};

// DOM Utilities
function fCSSSelectorGetElementsByTagName(oNode, sTagName) {
	var aTagName	= sTagName.split(':');
	if (aTagName.length > 1 && document.namespaces && document.namespaces[aTagName[0]]) {
		var aElements	= [];
		for (var i = 0, aSubset = oNode.getElementsByTagName(aTagName[1]), j = aSubset.length; i < j; i++)
			if (aSubset[i].scopeName == aTagName[0])
				aElements.push(aSubset[i]);
		return aElements;
	}
	else
		return sTagName == '*' && oNode.all ? oNode.all : oNode.getElementsByTagName(sTagName);
};

function fCSSSelectorGetPreviousSibling(oElement) {
	while (oElement = oElement.previousSibling)
		if (oElement.nodeType == 1)
			return oElement;
	return null;
};

function fCSSSelectorGetNextSibling(oElement) {
	while (oElement = oElement.nextSibling)
		if (oElement.nodeType == 1)
			return oElement;
	return null;
};

//			aQName		= sAttribute.split('|'),
//			sLocalName	= aQName.length > 1 ? aQName[1] : aQName[0],
//			sPrefix		= aQName.length > 1 ? aQName[0] : null,
function fCSSSelectorIfElementNS(oElement, sQName, fNSResolver) {
	return sQName == '*' || oElement.tagName.toLowerCase() == sQName.toLowerCase();
};

var fCSSSelectorGetAttributeNS	= document.namespaces ?
	function(oElement, sQName, fNSResolver) {
		return sQName == "class" ? oElement.className : sQName == "style" ? oElement.style.cssText : oElement[sQName];
	} :
	function(oElement, sQName, fNSResolver) {
		return oElement.getAttribute(sQName);
	}
;

// Selectors
var oCSSSelectorElementSelectors	= {},
	oCSSSelectorAttributeSelectors	= {},
	oCSSSelectorPseudoSelectors= {};