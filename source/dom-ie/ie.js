// Patch browser implementations
var oImplementation	= document.implementation || {};
if (!oImplementation.hasFeature)
	oImplementation.hasFeature	= new window.Function;

if (!oImplementation.hasFeature("Events", '2.0')) {
	var oIEHead	= document.getElementsByTagName("head")[0];

	if (!window.HTMLElement) {
		var oIEHTMLElement	= document.createElement("meta");
		oIEHTMLElement.content	= "HTMLElement";
		oIEHTMLElement.attachEvent("onpropertychange", fIEOnPrototypeChange);
		(window.HTMLElement		= {}).prototype	= oIEHead.appendChild(oIEHTMLElement);
	};

	if (!window.HTMLDocument) {
		var oIEHTMLDocument	= document.createElement("meta");
		oIEHTMLDocument.content	= "HTMLDocument";
		oIEHTMLDocument.attachEvent("onpropertychange", fIEOnPrototypeChange);
		(window.HTMLDocument	= {}).prototype	= oIEHead.appendChild(oIEHTMLDocument);
	};

	function fIEOnPrototypeChange() {
		var oEvent		= window.event,
			oElement	= oEvent.srcElement,
			sName		= oEvent.propertyName,
			vProperty	= oElement[sName];

		switch (oElement.content) {
			case "HTMLElement":
				for (var i = 0, aElements = (document.all || document.getElementsByTagName('*')), j = aElements.length; i < j; i++)
					if (aElements[i] != oElement)
						aElements[i][sName]	= vProperty;
				break;

			case "HTMLDocument":
			 	document[sName]	= vProperty;
				break;
		};
	};

	function fIEAttachInterface(oElement, iInterface) {
		var oPrototype	= iInterface;
		for (var sName in oPrototype)
			oElement[sName]	= oPrototype[sName];
	//	if (iInterface.constructor)
	//		iInterface.constructor.call(oElement);
	};

	function fIEDetachInterface(oElement, iInterface) {
		var oPrototype	= iInterface;
		for (var sName in oPrototype)
			oElement[sName]	= null;
	//	if (iInterface.destructor)
	//		iInterface.destructor.call(oElement);
	};

	function fIEAttachElement(oElement) {
		// Attach missing DOM Interfaces
		fIEAttachInterface(oElement, cEventTarget.prototype);
//		fIEAttachInterface(oElement, cElementSelector.prototype);
//		fIEAttachInterface(oElement, cElementXBL.prototype);
		// Mark processed
		oElement.$processed	= true;
		// Register property change listener (used to fix children interfaces)
		oElement.attachEvent("onpropertychange", fIEOnPropertyChange);
	};

	function fIEDetachElement(oElement) {
		// Unregister
		oElement.detachEvent("onpropertychange", fIEOnPropertyChange);
		// Detach missing DOM Interfaces
		fIEDetachInterface(oElement, cEventTarget.prototype);
//		fIEDetachInterface(oElement, cElementSelector.prototype);
//		fIEDetachInterface(oElement, cElementXBL.prototype);
		// Unmark processed
		oElement.$processed	= false;
	};

	function fIEProcessCollection(aElements) {
		for (var i = 0, j = aElements.length; i < j; i++)
			if (!aElements[i].$processed)
				fIEAttachElement(aElements[i]);
	};

	function fIEOnPropertyChange() {
		var oEvent	= window.event,
			oElement= oEvent.srcElement;
		if (oEvent.propertyName == "innerHTML") {
			// wrap
			fIEProcessCollection(oElement.all || oElement.getElementsByTagName('*'));
		}
	};

	function fIEOnWindowLoad() {
		var fIECreateElement	= document.createElement;
		document.createElement	= function(sName) {
			var oElement	= fIECreateElement(sName);
			fIEAttachElement(oElement);
			return oElement;
		};

//		var fIECreateElementNS	= document.createElementNS;
		document.createElementNS	= function(sNameSpaceURI, sTagName) {
			var oElement	= document.createElement(sTagName);
			oElement.prefix	= sTagName.indexOf(':') >-1 ? sTagName.replace(/:.+/, '') : null;
			oElement.namespaceURI	= sNameSpaceURI;
			return oElement;
		};

//		var fIEImportNode	= document.importNode;
		document.importNode		= function(oNode, bDeep) {
			// Validate arguments
			if (arguments.length < 1)
				throw 9;	// NOT_SUPPORTED_ERR

			if (oNode.ownerDocument != this) {
				if (oNode.nodeType) {
					var oElement= document.createElement("span");
					oElement.innerHTML	= oNode.xml;
					return oElement.removeChild(oElement.firstChild);
				}
				else
					throw 9;	// NOT_SUPPORTED_ERR
			}
			return oNode;
		};

		// Publish DOM-Event interfaces
		(window.EventTarget		= cEventTarget);//.toString	= fObjectToString("EventTarget");
		(window.DocumentEvent	= cDocumentEvent);//.toString	= fObjectToString("DocumentEvent");
		// Extend objects
		fIEAttachInterface(window,							cEventTarget.prototype);
		fIEAttachInterface(window.HTMLElement.prototype,	cEventTarget.prototype);
		fIEAttachInterface(window.HTMLDocument.prototype,	cEventTarget.prototype);
		fIEAttachInterface(window.HTMLDocument.prototype,	cDocumentEvent.prototype);
	};

	// Internet Explorer
	document.write('<' + "script" + ' ' + "id" + '="' + "xbl" + '_' + "implementation" + '_' + "event" + '" ' + "defer" + ' ' + "src" + '="/' + '/:"></' + "script" + '>');
	document.getElementById("xbl" + '_' + "implementation" + '_' + "event").onreadystatechange	= function() {
		if (this.readyState == "interactive" || this.readyState == "complete")
			fIEOnWindowLoad(this.parentNode.removeChild(this));
	}
}
