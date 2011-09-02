function cElementXBL() {
	// Disallow object instantiation
	throw 9;
};
/*
cElementXBL.constructor	= function() {
	this.xblImplementations	= new cXBLImplementationsList;
}
*/
// Public Properties
cElementXBL.prototype.xblImplementations	= null;

// Public Methods
cElementXBL.prototype.addBinding	= function(sDocumentUri) {
	// Validate input parameter
	if (typeof sDocumentUri != "string")
		throw 9;

	//
	sDocumentUri	= fResolveUri(sDocumentUri, document.location.href);

	// Check if there is already this binding attached
	if (this.xblImplementations instanceof cXBLImplementationsList)
		for (var nBinding = 0, oBinding; nBinding < this.xblImplementations.length; nBinding++) {
			oBinding = this.xblImplementations[nBinding];
			if (oBinding.constructor.documentURI + '#' + oBinding.constructor.id == sDocumentUri)
				return;
		}

	// 0) Get Binding (synchronously)
	var cBinding	= cXBLLanguage.getBinding(sDocumentUri);
	if (!cBinding)
		return;

	var oBinding	= new cBinding;

	// 3) Attach implementation
	for (var sMember in oBinding)
		if (sMember.indexOf("xbl") != 0)
			this[sMember]	= oBinding[sMember];

//	oBinding.$unique	= "xbl" + '-' + window.Math.floor(window.Math.random()*100000000);

	// 1) Create shadowTree
	if (cBinding.template) {
		var oShadowContent	= fCreateTemplate(cBinding),
			aShadowAnchors	= oShadowContent.getElementsByTagName("strike"),	// live collection
			nShadowAnchor	= 0,
			oShadowAnchor,
			aElements, oElement,
			sValue,	aNames;

		// Forward xbl:attr
		aElements = oShadowContent.getElementsByTagName('*');
		for (var nElement = 0, nElements = aElements.length; nElement < nElements; nElement++) {
			oElement	= aElements[nElement];
			oElement.xblShadow	= true;	// Mark anonymous elements
			if (sValue = oElement.getAttribute("xbl-attr")) {
				for (var nAttribute = 0, aAttributes = sValue.split(/\s+/g), nAttributes = aAttributes.length, sAttribute; nAttribute < nAttributes; nAttribute++) {
					aNames	= aAttributes[nAttribute].split('=');
					if (aNames.length == 2) {
						sAttribute	= aNames[1];
						if (aNames[0].indexOf(':' + "text") >-1) {
							if (!oElement.firstChild)
								oElement.appendChild(oElement.ownerDocument.createTextNode(this.getAttribute(sAttribute)));
						}
						else
						if (sAttribute.indexOf(':' + "text") >-1)
							oElement.setAttribute(aNames[0], this.textContent || this.innerText);
						else
						if (this.getAttribute(sAttribute) != null)
							oElement.setAttribute(aNames[0], this.getAttribute(sAttribute));
  						else
  							oElement.removeAttribute(aNames[0]);
					}
					else {
						sAttribute	= aNames[0];
						if (this.getAttribute(sAttribute) != null)
							oElement.setAttribute(sAttribute, this.getAttribute(sAttribute));
	  					else
	  						oElement.removeAttribute(sAttribute);
					}
				}
			}
		}

		// Process content@includes
		while ((oShadowAnchor = aShadowAnchors[nShadowAnchor]) && (nShadowAnchor < aShadowAnchors.length)) {
			if (sValue = oShadowAnchor.getAttribute("includes")) {
				aElements = fCSSSelectorQuery([this], '>' + sValue);
				for (var nElement = 0, nElements = aElements.length; oElement = aElements[nElement]; nElement++) {
					if (!oElement.xblChild) {
						if (oElement.nodeType == 1)
							oElement.xblChild	= true;
						oShadowAnchor.parentNode.insertBefore(oElement, oShadowAnchor);
					}
				}
				// Remove anchor
				oShadowAnchor.parentNode.removeChild(oShadowAnchor);
			} else {
				nShadowAnchor++;
			}
		}

		// Process content (with no @includes)
		if (oShadowAnchor = aShadowAnchors[0]) {
			for (nElement = 0; oElement = this.childNodes[nElement]; nElement++) {
				if (!oElement.xblChild) {
					if (oElement.nodeType == 1)
						oElement.xblChild	= true;
					oShadowAnchor.parentNode.insertBefore(oElement, oShadowAnchor);
					nElement--;
				}
			}
			// Remove anchor
			oShadowAnchor.parentNode.removeChild(oShadowAnchor);
		}

	// Removed, looks to be not necessary
		// Make sure shadow content documentElement has a unique ID set
		//		oShadowContent.setAttribute("id", oBinding.$unique);// + (oShadowContent.getAttribute("id") || ''));
		try {	// Try is used in order in IE to prevent runtime error with prefixed elements, that have no prefix association
			// Append shadow content
			while (oChild = oShadowContent.firstChild)
				this.appendChild(oShadowContent.firstChild);
		} catch (e) {}
		// Create shadowTree
		oBinding.shadowTree	= this;

		// Add "getElementById" member
		oBinding.shadowTree.getElementById	= fTemplateElement_getElementById;
	} else {
		// Mark children for proper target/phasing resolution
		for (var oChild = this.firstChild; oChild; oChild = oChild.nextSibling)
			if (oChild.nodeType == 1)
				oChild.xblChild	= true;

		oBinding.shadowTree	= null;
	}

	// Set boundElement
	oBinding.boundElement	= this;
	oBinding.baseBinding	= cBinding.baseBinding ? cBinding.baseBinding.prototype : null;

	// Add :bound-element pseudo-class
	this.className+= (this.className ? ' ' : '') + "xbl" + '-' + "bound-element" + '-' + cBinding.id;

	// 2) Register events routers for handlers in use
	oBinding.$handlers	= {};
	if (cBinding.$handlers)
		for (var sName in cBinding.$handlers)
			fRegisterEventRouter(oBinding, sName);

	// 3) Add to the list of bindings
	if (!this.xblImplementations)
		this.xblImplementations	= new cXBLImplementationsList;
	this.xblImplementations[this.xblImplementations.length++]	= oBinding;

	// 4) Execute callback function
	if (typeof oBinding.xblBindingAttached == "function")
		oBinding.xblBindingAttached();
	if (typeof oBinding.xblEnteredDocument == "function")
		oBinding.xblEnteredDocument();
};

cElementXBL.prototype.removeBinding	= function(sDocumentUri) {
	// Validate input parameter
	if (typeof sDocumentUri != "string")
		throw 9;

	if (!this.xblImplementations)
		return;

	//
	sDocumentUri	= fResolveUri(sDocumentUri, document.location.href);

	// 0) Get Binding
	for (var i = 0, j = this.xblImplementations.length, oBinding; i < j; i++) {
		oBinding = this.xblImplementations[i];
		if (oBinding.constructor.documentURI + '#' + oBinding.constructor.id == sDocumentUri)
			break;
	}

	if (!oBinding)
		return;

	// 1) Detach handlers
	if (oBinding.$handlers)
		for (var sName in oBinding.$handlers)
			fUnRegisterEventRouter(oBinding, sName);

	// 2) Destroy shadowTree
	if (oBinding.shadowTree) {
		(function (oElement) {
			for (var oChild = oElement.nextSibling; oElement; oChild = oElement.nextSibling) {
				// Recurse
				if (oElement.firstChild)
					arguments.callee(oElement.firstChild);
				//
				if (oElement.nodeType == 1) {
					if (oElement.xblShadow)
						oElement.parentNode.removeChild(oElement);
					else
						oBinding.boundElement.appendChild(oElement).xblChild	= false;
				}
				oElement	= oChild;
				if (!oElement)
					return;
			}
		})(oBinding.shadowTree.firstChild);

		// Destroy circular reference
		delete oBinding.shadowTree;
	}

	// Remove class
	this.className	= this.className.replace((this.className ? ' ' : '') + "xbl" + '-' + "bound-element" + '-' + oBinding.constructor.id, '');

	// Unset boundElement
	delete oBinding.boundElement;
	delete oBinding.baseBinding;

	// 3) Remove binding from list
	for (; this.xblImplementations[i]; i++)
		this.xblImplementations[i]	= this.xblImplementations[i + 1];
	delete this.xblImplementations[i];
	this.xblImplementations.length--;

	// 4) Execute callback function
	if (typeof oBinding.xblLeftDocument == "function")
		oBinding.xblLeftDocument();
};

cElementXBL.prototype.hasBinding	= function(sDocumentUri) {
	// Validate input parameter
	if (typeof sDocumentUri != "string")
		throw 9;

	if (this.xblImplementations) {
		//
		sDocumentUri	= fResolveUri(sDocumentUri, document.location.href);

		// Walk through the array
		for (var i = 0, j = this.xblImplementations.length, oBinding; i < j; i++) {
			oBinding = this.xblImplementations[i];
			if (oBinding.constructor.documentURI + '#' + oBinding.constructor.id == sDocumentUri)
				return true;
		}
	}
	return false;
};

// Functions

function fCreateTemplate(cBinding) {
	var oShadowContent,
		aShadowAnchors,
		oShadowAnchor,
		oElement;

	// Create template
	oShadowContent = cBinding.template.cloneNode(true);

	//
	var aInheritedAnchors	= oShadowContent.getElementsByTagName("menu"),
		oInheritedAnchor,
		oInheritedContent;

	// if there are any "inherited"
	if (aInheritedAnchors.length) {
		oInheritedAnchor	= aInheritedAnchors[0];

		// Check if in the base binding there is a template
		if (cBinding.baseBinding && cBinding.baseBinding.template) {

			// Create inherited content
			oInheritedContent	= fCreateTemplate(cBinding.baseBinding);

			// if there are "content" tags in the inherited content
			aShadowAnchors	= oInheritedContent.getElementsByTagName("strike");
			if (aShadowAnchors.length && oInheritedAnchor.firstChild) {
				// Move "inherited" tag children to the "content" of inherited template
				while (oElement = oInheritedAnchor.firstChild)
					aShadowAnchors[0].parentNode.appendChild(oInheritedAnchor.firstChild);

				// Remove old "content" anchor
				aShadowAnchors[0].parentNode.removeChild(aShadowAnchors[0]);
			}

			// Replace "inherited" tag with the inherited content
//			oInheritedAnchor.parentNode.replaceChild(oInheritedContent, oInheritedAnchor);
			while (oElement = oInheritedContent.firstChild)
				oInheritedAnchor.parentNode.insertBefore(oElement, oInheritedAnchor);
		}
		else {
//			while (oElement = oInheritedAnchor.firstChild)
//				oInheritedAnchor.parentNode.insertBefore(oInheritedAnchor.childNodes[oInheritedAnchor.childNodes.length-1], oInheritedAnchor);
		}
		//
		oInheritedAnchor.parentNode.removeChild(oInheritedAnchor);
	}

	return oShadowContent;
};

function fTemplateElement_getElementById(sId) {
	if (!this.$cache)
		this.$cache	= {};
	return this.$cache[sId] || (this.$cache[sId] = (function (oNode) {
		for (var oElement = null; oNode; oNode = oNode.nextSibling) {
			// Only go over shadow children, prevent jumping out by checking xblChild property
			if (oNode.nodeType == 1 && !oNode.xblChild) {
				if (oNode.getAttribute("xbl-id") == sId)
					return oNode;
				if (oNode.firstChild &&(oElement = arguments.callee(oNode.firstChild)))
					return oElement;
			}
		}
		return oElement;
	})(this.firstChild));
};
