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

	//
	fRequire("source/utils/uri.js");

	// Events
	fRequire("source/dom-events/classes/Event.js");
	fRequire("source/dom-events/classes/UIEvent.js");
	fRequire("source/dom-events/classes/MouseEvent.js");
	fRequire("source/dom-events/classes/MouseWheelEvent.js");
	fRequire("source/dom-events/classes/KeyboardEvent.js");
	fRequire("source/dom-events/classes/TextEvent.js");
	fRequire("source/dom-events/classes/MutationEvent.js");
	fRequire("source/dom-events/classes/CustomEvent.js");

	// Selectors
	fRequire("source/dom-selectors/DocumentSelector.js");
	fRequire("source/dom-selectors/ElementSelector.js");

	fRequire("source/css-selectors/parser.js");
	fRequire("source/css-selectors/resolver.js");
	fRequire("source/css-selectors/selectors/element.js");
	fRequire("source/css-selectors/selectors/attribute.js");
	fRequire("source/css-selectors/selectors/pseudo.js");

	// XBL
	fRequire("source/dom-xbl/classes/XBLImplementation.js");
	fRequire("source/dom-xbl/classes/XBLImplementationsList.js");
	//
	fRequire("source/dom-xbl/ElementXBL.js");
	fRequire("source/dom-xbl/DocumentXBL.js");
	//
	fRequire("source/xbl/processor.js");
	fRequire("source/xbl/router.js");
	fRequire("source/xbl.js");
})();