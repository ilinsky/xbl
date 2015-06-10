/**
 * This module contains XBL driver
 */

//
var rCSSRules		= /\s*([^}]+)\s*{([^}]+)}/g,
	rCSSBindingUrls	= /binding\s*:\s*url\s*\(['"\s]*([^'"\s]+)['"\s]*\)/g,
	rCSSComments	= /(\/\*.*?\*\/)/g,
	rCSSNameSpaces	= /@namespace\s+(\w+)?\s*"([^"]+)";?/g;

function fProcessCSS(sStyleSheet, sBaseUri) {
	var sRule,	aRules,	nRule,	nRules,
		sStyle,	aUrls,	nUrl,	nUrls;

	// Cut off comments
	sStyleSheet	= sStyleSheet.replace(rCSSComments, '');

	// Remove @namespace declarations (temporary)
	// TODO: Process @namespace instructions properly
	sStyleSheet	= sStyleSheet.replace(rCSSNameSpaces, '');

	// Go over the list of behaviors using rules
	if (aRules = sStyleSheet.match(rCSSRules)) {
		for (nRule = 0, nRules = aRules.length; nRule < nRules; nRule++) {
			if (aRules[nRule].match(rCSSRules)) {
				sRule	= window.RegExp.$1;
				sStyle	= window.RegExp.$2;
				// Save rules/styles to fix them later for IE
//				if (!(sRule in cXBLLanguage.styles))
//					cXBLLanguage.styles[sRule]	= '';
//				cXBLLanguage.styles[sRule]	+= sStyle;
				// Find declarations that have bindings in their styles
				if (aUrls = sStyle.match(rCSSBindingUrls)) {
					if (!cXBLLanguage.rules[sRule])
						cXBLLanguage.rules[sRule]	= [];
					for (nUrl = 0, nUrls = aUrls.length; nUrl < nUrls; nUrl++)
						if (aUrls[nUrl].match(rCSSBindingUrls))
							cXBLLanguage.rules[sRule].push(fResolveUri(window.RegExp.$1, sBaseUri));
				}
			}
		}
	}
};

/**
 * Document Handlers
 */
function fOnWindowLoad() {
	// Prevent multiple execution
	if (!fOnWindowLoad.loaded)
		fOnWindowLoad.loaded	= true;
	else
		return;

	// Process CSS declarations
	var sHrefDocument = document.location.href,
		sHref,
		sType,
		aElements,
		oElement,
		i, j;

//->Source
	var dCSS	= new Date;
//<-Source

	// Go over the list of inline style elements
	for (i = 0, aElements = document.getElementsByTagName("style"), j = aElements.length; i < j; i++) {
		oElement = aElements[i];
		if (oElement.getAttribute("type") == "text/css")
			fProcessCSS(oElement.textContent || oElement.innerHTML, document.location.href);
	}

	// Go over the list of link elements
	for (i = 0, aElements = document.getElementsByTagName("link"), j = aElements.length;  i < j; i++) {
		oElement = aElements[i];
		sHref	= oElement.getAttribute("href");
		sType	= oElement.getAttribute("type");
		if (sType == "text/css") {
			if (fUrisInSameDomain(sHref, sHrefDocument))
				fProcessCSS(cXBLLanguage.fetch(sHref).responseText, sHref);
		}
		else
		if (sType == "application/xml") {
			if (oElement.getAttribute("rel") == "binding")
				cDocumentXBL.prototype.loadBindingDocument.call(document, sHref);
		}
	}

//->Source
	dCSS	= new Date - dCSS;
//<-Source

//->Source
	var dXBL	= new Date;
//<-Source

	// Process elements in the document
	fDocumentXBL_addBindings();

//->Source
	dXBL	= new Date - dXBL;
//<-Source

//->Source
	document.title = "CSS: " + dCSS + " ms. " + "XBL: " + dXBL + " ms.";
//<-Source

/*
	// subscribe to changes
	if (!document.namespaces) {
		document.addEventListener("DOMNodeInserted", function(oEvent) {
			if (cXBLLanguage.busy)
				return;
		}, false);
		document.addEventListener("DOMNodeRemoved", function(oEvent) {
			if (cXBLLanguage.busy)
				return;
		}, false);
	}
	else
*/
	// Dispatch xbl-bindings-are-ready to document
//	fDispatchEvent(document.documentElement, fCreateEvent("xbl-bindings-are-ready", true, false));
};
/*
function fOnWindowUnLoad() {
	// TODO: Any actions required
//	fDocumentXBL_removeBindings(document.body);

	// Clean handler
//	fDetachEvent(window,	"on" + "load",		fOnWindowLoad);
//	fDetachEvent(window,	"on" + "unload",	fOnWindowUnLoad);
};
*/

// Publish implementation, Hide implementation details
function fFunctionToString(sName) {
	return function () {return "function" + ' ' + sName + '()' + ' ' + '{\n\t[native code]\n}'};
};

function fObjectToString(sName) {
	return function () {return '[' + sName + ']'};
};

function fAttachInterface(oElement, iInterface) {
	var oPrototype	= iInterface;
	for (var sName in oPrototype)
		oElement[sName]	= oPrototype[sName];
};

/* Not used
function fDetachInterface(oElement, iInterface) {
	var oPrototype	= iInterface;
	for (var sName in oPrototype)
		oElement[sName]	= null;
};
*/

// Get defer parameter
var aElements	= document.getElementsByTagName("script");
if (aElements[aElements.length - 1].src.match(/\?defer(?:=(\d+))?/))
	cXBLLanguage.defer	= window.RegExp.$1;

if (document.createElement("div").addEventListener) {
	// Webkit
	if (window.navigator.userAgent.match(/applewebkit/i))
		(function (){
			if (document.readyState == "loaded" || document.readyState == "complete")
				fOnWindowLoad();
			else
				window.setTimeout(arguments.callee, 0);
		})();
	// Gecko / Opera
	else
		window.addEventListener("DOMContentLoaded", fOnWindowLoad, false);
//		window.addEventListener("load", fOnWindowLoad, false);
}
else {
	// Internet Explorer
	document.write('<' + "script" + ' ' + "id" + '="' + "xbl" + '_' + "implementation" + '" ' + "defer" + ' ' + "src" + '="/' + '/:"></' + "script" + '>');
	document.getElementById("xbl" + '_' + "implementation").onreadystatechange	= function() {
		if (this.readyState == "interactive" || this.readyState == "complete")
			fOnWindowLoad(this.parentNode.removeChild(this));
	}
}

// For browsers that do not support tricks coded above
if (window.addEventListener)
	window.addEventListener("load", fOnWindowLoad, true);
else
	window.attachEvent("on" + "load", fOnWindowLoad);


// Publish XBL interfaces
(window.ElementXBL	= cElementXBL).toString		= fObjectToString("ElementXBL");
(window.DocumentXBL	= cDocumentXBL).toString	= fObjectToString("DocumentXBL");

// Extend objects
if (window.HTMLElement)		fAttachInterface(window.HTMLElement.prototype,	cElementXBL.prototype);
if (window.HTMLDocument)	fAttachInterface(window.HTMLDocument.prototype,	cDocumentXBL.prototype);

// Extend objects
if (!document.querySelector) {
	if (window.HTMLElement)		fAttachInterface(window.HTMLElement.prototype,	cElementSelector.prototype);
	if (window.HTMLDocument)	fAttachInterface(window.HTMLDocument.prototype,	cDocumentSelector.prototype);
}

//->Source
//window.cXBLLanguage	= cXBLLanguage;
//<-Source
