/*
 * This file supposed to only be used when running on the raw source
 */
(function() {
	var oHead	= document.getElementsByTagName("head")[0];
	var sBase	= oHead.lastChild.src.replace(/\/?xbl\.js.*$/, '');	// presumably this script tag
	function fRequire(sSrc) {
		var oScript	= oHead.appendChild(document.createElement("script"));
		oScript.type	= "text/javascript";
		oScript.src		= sBase + '/' + sSrc;
	}

	// IE DOM
	fRequire("source/dom-ie/classes/DocumentEvent.js");
	fRequire("source/dom-ie/classes/EventTarget.js");
	fRequire("source/dom-ie/ie.js");
})();