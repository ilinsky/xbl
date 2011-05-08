function cDocumentXBL() {
	// Disallow object instantiation
	throw 9;
};
/*
cDocumentXBL.constructor	= function() {
	this.bindingDocuments	= [];
};
*/
// Public Properties
cDocumentXBL.prototype.bindingDocuments		= null;

// Public Methods
cDocumentXBL.prototype.loadBindingDocument	= function(sDocumentUri) {
	// Validate input parameter
	if (typeof sDocumentUri != "string")
		throw 9;

	//
	sDocumentUri	= fResolveUri(sDocumentUri, document.location.href);

	if (!this.bindingDocuments)
		this.bindingDocuments	= [];

	if (!(sDocumentUri in this.bindingDocuments)) {
		var oDOMDocument	= cXBLLanguage.fetch(sDocumentUri).responseXML;
		if (oDOMDocument != null && oDOMDocument.documentElement && oDOMDocument.documentElement.tagName == "parsererror")
			oDOMDocument	= null;

		// Save document in cache
		this.bindingDocuments[sDocumentUri]	= oDOMDocument;

		// Process entire document
		// TODO: enable delayed processing
		if (oDOMDocument)
			cXBLLanguage.process(oDOMDocument, sDocumentUri);
//->Debug
		else
			cXBLLanguage.onerror("Binding document '" + sDocumentUri + "' is mall formed");
//<-Debug
	}
	return this.bindingDocuments[sDocumentUri];
};

// Functions
// strike == content
// menu == inherited


function fDocumentXBL_addBindings(oNode) {
	var nDefer	= cXBLLanguage.defer,
		nDeferedCurrent	= 0,
		aDeferedBindings= [];

	//
	for (var sRule in cXBLLanguage.rules)
		for (var nElement = 0, aBindings = cXBLLanguage.rules[sRule], aElements = fCSSSelectorQuery([document], sRule.replace(/\\:/g, '|')), nElements = aElements.length; nElement < nElements; nElement++)
			for (var nBinding = 0, nBindings = aBindings.length; nBinding < nBindings; nBinding++)
				if (nDefer >-1)
					aDeferedBindings[aDeferedBindings.length]	= [aElements[nElement], aBindings[nBinding]];
				else
					cElementXBL.prototype.addBinding.call(aElements[nElement], aBindings[nBinding]);

	if (nDefer >-1) {
		window.setTimeout(function () {
			if (nDeferedCurrent < aDeferedBindings.length) {
				aBinding	= aDeferedBindings[nDeferedCurrent++];
				cElementXBL.prototype.addBinding.call(aBinding[0], aBinding[1]);
				window.setTimeout(arguments.callee, nDefer);
			}
		})
	}
};

function fDocumentXBL_removeBindings(oNode) {
	for (var oBinding, cBinding; oNode; oNode = oNode.nextSibling) {
		if (oNode.nodeType == 1) {
			// If it is we who defined property
			if (oNode.xblImplementations instanceof cXBLImplementationsList) {
// TODO: Proper shadow content restoration
//				while (oNode.xblImplementations.length) {
//					cBinding	= oNode.xblImplementations[oNode.xblImplementations.length-1].constructor;
//					cElementXBL.prototype.removeBinding.call(oNode, cBinding.documentURI + '#' + cBinding.id);
//				}

				while (oBinding = oNode.xblImplementations[--oNode.xblImplementations.length]) {
					cBinding	= oBinding.constructor;

					// Detach handlers
					if (oBinding.$handlers)
						for (var sName in oBinding.$handlers)
							fUnRegisterEventRouter(oBinding, sName);

					//
					delete oBinding.baseBinding;
					delete oBinding.boundElement;
					delete oBinding.shadowTree;

					// Delete binding
					oNode.xblImplementations[oNode.xblImplementations.length]	= null;
				}

				//
				oNode.xblImplementations	= null;
			}

			// Go deeper
			if (oNode.firstChild)
				fDocumentXBL_removeBindings(oNode.firstChild);
		}
	}
};