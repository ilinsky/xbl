/*
 * cXBLLanguage implementation
 */
var cXBLLanguage	= {};

cXBLLanguage.defer	=-1;
cXBLLanguage.namespaceURI	= "http://www.w3.org/ns/xbl";
cXBLLanguage.bindings	= {};
cXBLLanguage.rules		= {};
//cXBLLanguage.styles		= {};

cXBLLanguage.factory	= document.createElement("span");
//cXBLLanguage.stylesheet	= document.createElement("style");

cXBLLanguage.fetch	= function(sUri) {
	// Make request
	var oXMLHttpRequest	= window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP");
	oXMLHttpRequest.open("GET", sUri + "?" + (new Date + 0), false);
	oXMLHttpRequest.send(null);
	//
	return oXMLHttpRequest;
};

// Private Methods
cXBLLanguage.extend	= function(cBinding, cBase) {
	//
	cBinding.baseBinding	= cBase;

	// Copy handlers
	if (cBase.$handlers) {
		// Create object
		cBinding.$handlers	= {};

		// Iterate over handlers
		for (var sName in cBase.$handlers) {
			if (!(sName in cBinding.$handlers))
				cBinding.$handlers[sName]	= [];
			for (var i = 0, j = cBase.$handlers[sName].length; i < j; i++)
				cBinding.$handlers[sName].push(cBase.$handlers[sName][i]);
		}
	}

	// Copy implementation
	for (var sMember in cBase.prototype)
		cBinding.prototype[sMember]	= cBase.prototype[sMember];

	// Copy template
	cBinding.template	= cBase.template;
};

cXBLLanguage.correct	= function(cBinding, oNode, bXmlSpace) {
	var sValue, oNext;
	while (oNode) {
		oNext	= oNode.nextSibling;
		if (oNode.nodeType == 1) {
			if (sValue = oNode.getAttribute("xbl-id"))
				oNode.className+= (oNode.className ? ' ' : '') + "xbl-id" + '-' + sValue + '-' + cBinding.id;
			if (sValue = oNode.getAttribute("xbl-pseudo"))
				oNode.className+= (oNode.className ? ' ' : '') + "xbl-pseudo" + '-' + sValue + '-' + cBinding.id;
			if (oNode.firstChild)
				arguments.callee(cBinding, oNode.firstChild, bXmlSpace);
		}
		else
		if (!bXmlSpace && oNode.nodeType == 3) {
//			sValue = oNode.data.replace(/[ \t\r\n\f]+/g, ' ');	// This expression would leave &nbsp; intact
			sValue = oNode.data.replace(/\s+/g, ' ');
			// remove empty nodes
			if (sValue == ' ')
				oNode.parentNode.removeChild(oNode);
			else
			// strip text nodes
			if (oNode.data != sValue)
				oNode.data = sValue;
		}
		oNode	= oNext;
	}
};

/*
 * Processes given node and registeres bindings
 */
cXBLLanguage.process	= function(oNode, sLocation) {
	//
	if (oNode.nodeType == 9)
		oNode	= oNode.documentElement;

	if (oNode.nodeType == 1)
		cXBLLanguage.elements(oNode, cXBLLanguage.elements.xbl, sLocation);
//->Debug
	else
		cXBLLanguage.onerror("Not a valid XML Node passed");
//<-Debug
};

cXBLLanguage.getBinding	= function(sDocumentUri) {
	if (!(sDocumentUri in cXBLLanguage.bindings)) {
		var aBinding	= sDocumentUri.split('#');
//->Debug
		if (aBinding.length < 2)
			cXBLLanguage.onerror("Invalid binding URI '" + sDocumentUri + "'");
//<-Debug
		// Make sure element is loaded
		cDocumentXBL.prototype.loadBindingDocument.call(document, aBinding[0]);

		//
//->Debug
		if (!cXBLLanguage.bindings[sDocumentUri])
			cXBLLanguage.onerror("Binding '" + aBinding[1] + "' was not found in '" + aBinding[0] + "'");
//<-Debug
	}
	return cXBLLanguage.bindings[sDocumentUri] || null;
};
//->Debug
cXBLLanguage.onerror	= function(sMessage) {
	if (window.console && window.console.error)
		window.console.error("XBL 2.0: " + sMessage);
};
//<-Debug
/*
 * XBL Elements processors
 */
cXBLLanguage.elements	= function(oParent, fHandler, vParameter) {
	for (var i = 0, j = oParent.childNodes.length, sName, oNode; i < j; i++) {
		oNode	= oParent.childNodes[i];
		if (oNode.nodeType == 1)
			if (oNode.namespaceURI == cXBLLanguage.namespaceURI) {
				if (fHandler[sName = (oNode.localName || oNode.baseName)])
					fHandler[sName](oNode, vParameter);
//->Debug
				else
					cXBLLanguage.onerror("Element '" + oNode.nodeName + "' could not be a child of '" + oParent.nodeName + "'");
//<-Debug
			}
	}
};

/*
 * Element: xbl
 */
cXBLLanguage.elements.xbl	= function(oNode, sDocumentUri) {
	// Process chlidren
	cXBLLanguage.elements(oNode, arguments.callee, sDocumentUri);
};

/*
 * Element: xbl/binding
 */
cXBLLanguage.elements.xbl.binding = function(oNode, sDocumentUri) {
	var sId		= oNode.getAttribute("id"),
		sElement= oNode.getAttribute("element");

	if (sId || sElement) {
		if (!sId)
			sId		= "xbl" + '-' + window.Math.floor(window.Math.random()*100000000);

		var cBinding	= new window.Function;

		//
		cBinding.id				= sId;
		cBinding.documentURI	= sDocumentUri;

		// Register binding
		cXBLLanguage.bindings[sDocumentUri + '#' + sId]	= cBinding;
		if (sElement) {
			if (!cXBLLanguage.rules[sElement])
				cXBLLanguage.rules[sElement]	= [];
			cXBLLanguage.rules[sElement].push(sDocumentUri + '#' + sId);
		}

		// binding@extends implementation
		var sExtends	= oNode.getAttribute("extends"),
			aExtend,
			sXmlBase	= fGetXmlBase(oNode, sDocumentUri),
			cBase;
		if (sExtends) {
			aExtend	= sExtends.split('#');
			if (cBase = cXBLLanguage.getBinding(fResolveUri(aExtend[0], sXmlBase) + '#' + aExtend[1]))
				cXBLLanguage.extend(cBinding, cBase);
//->Debug
			else
				cXBLLanguage.onerror("Extends '" + sExtends + "' was not found thus ignored");
//<-Debug
		}

		// Process children
		cXBLLanguage.elements(oNode, arguments.callee, cBinding);
	}
//->Debug
	else
		cXBLLanguage.onerror("Either required attribute 'id' or 'element' is missing in " + oNode.nodeName);
//<-Debug
};

/*
 * Element: xbl/script
 */
cXBLLanguage.elements.xbl.script = function(oNode, sDocumentUri) {
	var sSrc	= oNode.getAttribute("src"),
		sScript,
		oScript;

	if (sSrc) {
		sSrc	= fResolveUri(sSrc, fGetXmlBase(oNode, sDocumentUri));
		sScript	= cXBLLanguage.fetch(sSrc).responseText;
	}
	else
	if (oNode.firstChild)
		sScript	= oNode.firstChild.nodeValue;

	// Create a script and add it to the owner document
	oScript	= document.createElement("script");
	oScript.setAttribute("type", "text/javascript");
	if (document.namespaces)
		oScript.text	= sScript;
	else
		oScript.appendChild(document.createTextNode(sScript));
	//
	document.getElementsByTagName("head")[0].appendChild(oScript);
};

cXBLLanguage.elements.xbl.binding.implementation	= function(oNode, cBinding) {
	var sSrc	= oNode.getAttribute("src"),
		sScript	= '';

	if (sSrc) {
		sSrc	= fResolveUri(sSrc, fGetXmlBase(oNode, cBinding.documentURI));
		sScript	= cXBLLanguage.fetch(sSrc).responseText;
	}
	else
	if (oNode.firstChild)
		sScript	= oNode.firstChild.nodeValue;

	// Create script
	if (sScript) {
		// Run implementation in the context of binding
		//oBinding.prototype	= window.Function(sScript.replace(/^\s*\(\{(.*?)\}\)\s*$/g, '$1'));	// doesn't work, why?
//		cBinding.$implementation	= window.Function(sScript.replace(/^\s*\(\s*/g, "return ").replace(/\s*\)\s*$/g, ''))();
//		cBinding.prototype	= cBinding.$implementation();

		// Fixing constructor (fix should be reconsidered)
//		var oBinding = cBinding.prototype.constructor;
//		try {
//			cBinding.prototype	= window.Function(sScript.replace(/^\s*\(\s*/g, "return ").replace(/\s*\)\s*$/g, ''))();
//		}
//		catch (oError) {
//->Debug
//			cXBLLanguage.onerror(oError.message);
//<-Debug
//		}
//		cBinding.prototype.constructor	= oBinding;
		try {
			var oImplementation	= window.Function(sScript.replace(/^\s*\(\s*/g, "return ").replace(/\s*\)\s*$/g, ''))();
			for (var sMember in oImplementation)
				cBinding.prototype[sMember]	= oImplementation[sMember];
		}
		catch (oError) {
//->Debug
			cXBLLanguage.onerror(oError.message);
//<-Debug
		}
	}
};

/*
cXBLLanguage.elements.xbl.binding.template	= function(oNode, cBinding) {

	// Get first element child
	for (var i = 0, oTemplate; i < oNode.childNodes.length; i++) {
		if (oNode.childNodes[i].nodeType == 1) {
			oTemplate	= oNode.childNodes[i];
			break;
		}
	}

	if (oTemplate) {
		// Serialize
		var sHtml	= window.XMLSerializer ? new window.XMLSerializer().serializeToString(oTemplate) : oTemplate.xml;

		// Remove all namespaces declarations as we run anyway in HTML only
		sHtml	= sHtml.replace(/\sxmlns:?\w*="([^"]+)"/gi, '');
		// Replace 'xbl:content' by 'strike'
		sHtml	= sHtml.replace(/(<\/?)[\w:]*content/gi, '$1' + "strike");
		// Replace 'xbl:inherited' by 'menu'
		sHtml	= sHtml.replace(/(<\/?)[\w:]*inherited/gi, '$1' + "menu");
		// Replace 'xbl:div' by 'div'
		sHtml	= sHtml.replace(/(<\/?)[\w:]*div/gi, '$1' + "div");

		// Expand all empty tags
	 	sHtml	= sHtml.replace(/<([\w\:]+)([^>]*)\/>/gi, '<$1$2></$1>');
		// Close certain empty tags
		sHtml	= sHtml.replace(/<(br|input|img)([^>]*)><\/[^>]*>/gi, '<$1$2 />');

		// Replace classes for limiting scope
		// class="{CLASS}"	-> class="xbl-{CLASS}-{BINDING_ID}"
		sHtml	= sHtml.replace(/\sclass="([^"]+)"/gi, ' ' + "class" + '="' + "xbl" + '-$1-' + cBinding.id + '"');
		// id="{ID}"		-> xbl:id="{ID}"
		sHtml	= sHtml.replace(/\sid="([^"]+)"/gi, ' ' + "xbl-id" + '="$1"');
		sHtml	= sHtml.replace(/\sxbl:pseudo="([^"]+)"/gi, ' ' + "xbl-pseudo" + '="$1"');

		// Create a DOM HTML node
		var aMatch		= sHtml.match(/^<([a-z0-9]+)/i),
			oFactory	= cXBLLanguage.factory,
			oTemplate	= null;

		if (aMatch) {
			switch (aMatch[1]) {
				case "td":
				case "th":
					sHtml = '<' + "tr" + '>' + sHtml + '</' + "tr" + '>';
					// No break is left intentionaly
				case "tr":
					sHtml = '<' + "tbody" + '>' + sHtml + '</' + "tbody" + '>';
					// No break is left intentionaly
				case "tbody":
				case "thead":
				case "tfoot":
					oFactory.innerHTML	= '<' + "table" + '>' + sHtml + '</' + "table" + '>';
					oTemplate	= oFactory.getElementsByTagName(aMatch[1])[0];
					break;

				case "option":
					oFactory.innerHTML	= '<' + "select" + '>' + sHtml + '</' + "select" + '>';
					oTemplate	= oFactory.firstChild.firstChild;
					break;

				default:
					oFactory.innerHTML	= '&nbsp;' + sHtml;
					oTemplate	= oFactory.childNodes[1];
					break;
			}
		}

		// Correct classes
//		alert("Before: " + (window.XMLSerializer ? new window.XMLSerializer().serializeToString(oTemplate) : oTemplate.outerHTML));
		cXBLLanguage.correct(cBinding, oTemplate, (oNode.getAttributeNS ? oNode.getAttributeNS("http://www.w3.org/XML/1998/namespace", "space") : oNode.getAttribute("xml" + ':' + "space")) == "preserve");
//		alert("After: " + (window.XMLSerializer ? new window.XMLSerializer().serializeToString(oTemplate) : oTemplate.outerHTML));

		// Set template
		cBinding.template	= oTemplate.parentNode.removeChild(oTemplate);
	}
};
*/
cXBLLanguage.elements.xbl.binding.template	= function(oNode, cBinding) {

	// figure out what kind of children is there
	for (var oNext = oNode.firstChild, sName = ''; oNext; oNext = oNext.nextSibling)
		if (oNext.nodeType == 1 && oNext.namespaceURI != cXBLLanguage.namespaceURI)
			sName	=(oNext.localName || oNext.baseName).toLowerCase();

	// Serialize
	var sHtml	= window.XMLSerializer ? new window.XMLSerializer().serializeToString(oNode) : oNode.xml;

	// Cut out xbl:template open/close tag
	sHtml	= sHtml.replace(/^<[\w:]*template[^>]*>\s*/i, '').replace(/\s*<\/[\w:]*template>$/i, '');

	// Replace '{PREFIX}:content' by 'strike'
	sHtml	= sHtml.replace(/(<\/?)[\w:-]*content/gi, '$1' + "strike");
	// Replace '{PREFIX}:inherited' by 'menu'
	sHtml	= sHtml.replace(/(<\/?)[\w:-]*inherited/gi, '$1' + "menu");
	// Replace '{PREFIX}:div' by 'div'
	sHtml	= sHtml.replace(/(<\/?)[\w:-]*div/gi, '$1' + "div");

	// Expand all empty tags
 	sHtml	= sHtml.replace(/<([\w:-]+)([^>]*)\/>/gi, '<$1$2></$1>');
	// Close certain empty tags
	sHtml	= sHtml.replace(/<(br|input|img)([^>]*)><\/[^>]*>/gi, '<$1$2 />');

	// Replace classes for limiting scope
	// class="{CLASS}"	-> class="xbl-{CLASS}-{BINDING_ID}"
	sHtml	= sHtml.replace(/\sclass="([^"]+)"/gi, ' ' + "class" + '="' + "xbl" + '-$1-' + cBinding.id + '"');
	// id="{ID}"		-> xbl-id="{ID}"
	sHtml	= sHtml.replace(/\sid="([^"]+)"/gi, ' ' + "xbl-id" + '="$1"');
	// {PREFIX}:attr="{VALUE}" -> xbl-attr="{VALUE}"
	sHtml	= sHtml.replace(/\s[\w-]+:attr="([^"]+)"/gi, ' ' + "xbl-attr" + '="$1"');
	// {PREFIX}:pseudo="{VALUE}" -> xbl-pseudo="{VALUE}"
	sHtml	= sHtml.replace(/\s[\w-]+:pseudo="([^"]+)"/gi, ' ' + "xbl-pseudo" + '="$1"');

	// Create a DOM HTML node
	var oFactory	= cXBLLanguage.factory,
		oTemplate	= null;

	// sName keeps the element name used as direct child of template
	switch (sName) {
		case "td":
		case "th":
			sHtml = '<' + "tr" + '>' + sHtml + '</' + "tr" + '>';
			// No break is left intentionaly
		case "tr":
			sHtml = '<' + "tbody" + '>' + sHtml + '</' + "tbody" + '>';
			// No break is left intentionaly
		case "tbody":
		case "thead":
		case "tfoot":
			oFactory.innerHTML	= '<' + "table" + '>' + sHtml + '</' + "table" + '>';
			oTemplate	= oFactory.getElementsByTagName(sName)[0].parentNode;
			break;

		case "option":
			oFactory.innerHTML	= '<' + "select" + '>' + sHtml + '</' + "select" + '>';
			oTemplate	= oFactory.firstChild;
			break;

		default:
			oFactory.innerHTML	= "#text" + '<div>' + sHtml + '</div>';
			oTemplate	= oFactory.childNodes[1];
			break;
	}

	// Correct classes
//	alert("Before: " + (window.XMLSerializer ? new window.XMLSerializer().serializeToString(oTemplate) : oTemplate.outerHTML));
	cXBLLanguage.correct(cBinding, oTemplate, (oNode.getAttributeNS ? oNode.getAttributeNS("http://www.w3.org/XML/1998/namespace", "space") : oNode.getAttribute("xml" + ':' + "space")) == "preserve");
//	alert("After: " + (window.XMLSerializer ? new window.XMLSerializer().serializeToString(oTemplate) : oTemplate.outerHTML));

	// Set template
	cBinding.template	= oTemplate.parentNode.removeChild(oTemplate);
};

cXBLLanguage.elements.xbl.binding.handlers	= function(oNode, cBinding) {
	// Process chlidren
	cXBLLanguage.elements(oNode, arguments.callee, cBinding);
};

/*
var oXBLLanguagePhase	= {};
oXBLLanguagePhase["capture"]		= cEvent.CAPTURING_PHASE;
oXBLLanguagePhase["target"]			= cEvent.AT_TARGET;
oXBLLanguagePhase["default-action"]	= 0x78626C44;
*/

cXBLLanguage.elements.xbl.binding.handlers.handler	= function(oNode, cBinding) {
	var sName	= oNode.getAttribute("event"),
		fHandler;
	if (sName) {
		if (oNode.firstChild) {
			// Create object for handlers
			if (!cBinding.$handlers)
				cBinding.$handlers	= {};

			// Create object for handlers of specified type
			if (!cBinding.$handlers[sName])
				cBinding.$handlers[sName]	= [];

			try {
				fHandler	= new window.Function("event", oNode.firstChild.nodeValue);
			}
			catch (oError) {
//->Debug
				cXBLLanguage.onerror(oError.message);
//<-Debug
			}

			if (fHandler) {
				cBinding.$handlers[sName].push(fHandler);

				// Get attributes
				var sValue;
				// Event
				if (sValue = oNode.getAttribute("phase"))
					fHandler["phase"]			= sValue == "capture" ? 1 : sValue == "target" ? 2 /* : sValue == "default-action" ? 0x78626C44*/ : 0;
				if (sValue = oNode.getAttribute("trusted"))
					fHandler["trusted"]			= sValue == "true";
				if (sValue = oNode.getAttribute("propagate"))
					fHandler["propagate"]		= sValue != "stop";
				if (sValue = oNode.getAttribute("default-action"))
					fHandler["default-action"]	= sValue != "cancel";
				// MouseEvent
				if (sValue = oNode.getAttribute("button"))
					fHandler["button"]			= sValue * 1;
				if (sValue = oNode.getAttribute("click-count"))
					fHandler["click-count"]		= sValue * 1;
				// KeyboardEvent
				if (sValue = oNode.getAttribute("modifiers"))
					fHandler["modifiers"]		= sValue;
				if (sValue = oNode.getAttribute("key"))
					fHandler["key"]				= sValue;
				if (sValue = oNode.getAttribute("key-location"))
					fHandler["key-location"]	= sValue;
				// TextInput
				if (sValue = oNode.getAttribute("text"))
					fHandler["text"]			= sValue;
				// MutationEvent
				if (sValue = oNode.getAttribute("prev-value"))
					fHandler["prev-value"]		= sValue;
				if (sValue = oNode.getAttribute("new-value"))
					fHandler["new-value"]		= sValue;
				if (sValue = oNode.getAttribute("attr-name"))
					fHandler["attr-name"]		= sValue;
				if (sValue = oNode.getAttribute("attr-change"))
					fHandler["attr-change"]		= sValue;
			}
		}
	}
//->Debug
	else
		cXBLLanguage.onerror("Missing 'event' attribute in " + oNode.nodeName);
//<-Debug
};

cXBLLanguage.elements.xbl.binding.resources	= function(oNode, cBinding) {
	// Process chlidren
	cXBLLanguage.elements(oNode, arguments.callee, cBinding);
};

cXBLLanguage.elements.xbl.binding.resources.style	= function(oNode, cBinding) {
	// Get the document
	var sSrc		= oNode.getAttribute("src"),
		sMedia		= oNode.getAttribute("media"),
		sBaseUri	= fGetXmlBase(oNode, cBinding.documentURI),
		sStyle,
		oStyle,
		aCss;

	// 1. Get stylesheet
	if (sSrc) {
		sSrc	= fResolveUri(sSrc, sBaseUri);
		sStyle	= cXBLLanguage.fetch(sSrc).responseText;
	}
	else
	if (oNode.firstChild) {
		sSrc	= sBaseUri;
		sStyle	= oNode.firstChild.nodeValue;
	}

	// Create stylesheet
	if (sStyle) {
		var sSelectorBoundElement	= ':' + "bound-element";
		// 2. Setup local context for CSS rules
		// 	.{class}	-> .xbl-{class}-{binding}
		sStyle	= sStyle.replace(/\s\.([\w-]+)([\s{+~>])/g, ' .' + "xbl" + '-$1-' + cBinding.id + '$2');
		//	#{id}		-> .xbl-id-{id}-{binding}
		sStyle	= sStyle.replace(/#([\w-]+)([\s{+~>])/g, '.' + "xbl-id" + '-$1-' + cBinding.id + '$2');
		//	::{pseudo}	-> .xbl-pseudo-{pseudo}-{binding}
		sStyle	= sStyle.replace(/::([\w-]+)([\s{+~>])/g, '.' + "xbl-pseudo" + '-$1-' + cBinding.id + '$2');
		// Shift context "selector {" -> ":bound-element selector {"
		sStyle	= sStyle.replace(/\s*([^{\n]+{[^}]+})/g, sSelectorBoundElement + ' ' + '$1');
		// correct result from previous step
		sStyle	= sStyle.replace(new window.RegExp(sSelectorBoundElement + ' ' + sSelectorBoundElement, 'g'), sSelectorBoundElement);
		//	:bound-element	-> .xbl-bound-element-{binding}
		sStyle	= sStyle.replace(/:bound-element([\s{+~>.:])/g, '.' + "xbl" + '-' + "bound-element" + '-' + cBinding.id + '$1');

		// 3. Resolve relative uris
		if (aCss = sStyle.match(/url\s*\([^\)]+\)/g)) {
			for (var i = 0, j = aCss.length, aUrl; i < j; i++) {
				aUrl	= aCss[i].match(/(url\s*\(['"]?)([^\)'"]+)(['"]?\))/);
				sStyle	= sStyle.replace(aUrl[0], aUrl[1] + fResolveUri(aUrl[2], sSrc) + aUrl[3]);
			}
		}

		// 4. Create stylesheet in the document
		if (document.namespaces) {
			cXBLLanguage.factory.innerHTML	= '&nbsp;' + '<' + "style" + ' ' + "type" + '="' + "text/css" + '"' + (sMedia ? ' ' + "media" + '="' + sMedia + '"' : '') + '>' + sStyle + '</' + "style" + '>';
			oStyle	= cXBLLanguage.factory.childNodes[1];
		}
		else {
			oStyle	= document.createElement("style");
			oStyle.setAttribute("type", "text/css");
			if (sMedia)
				oStyle.setAttribute("media", sMedia);
			oStyle.appendChild(document.createTextNode(sStyle));
		}
		document.getElementsByTagName("head")[0].appendChild(oStyle);
	}
};

cXBLLanguage.elements.xbl.binding.resources.prefetch	= function(oNode, cBinding) {
	var sSrc	= oNode.getAttribute("src");
	if (sSrc) {
		sSrc	= fResolveUri(sSrc, fGetXmlBase(oNode, cBinding.documentURI));
		cXBLLanguage.fetch(sSrc);
	}
//->Debug
	else
		cXBLLanguage.onerror("Required attribute 'src' is missing in " + oNode.nodeName);
//<-Debug
};