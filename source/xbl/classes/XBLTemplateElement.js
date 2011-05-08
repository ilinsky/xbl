var cXBLTemplateElement	= new window.Function;

// Public Properties
cXBLTemplateElement.prototype.nodeType		= 1;
cXBLTemplateElement.prototype.tagName		= "template";
cXBLTemplateElement.prototype.nodeName		= "template";
cXBLTemplateElement.prototype.nodeValue		= null;
cXBLTemplateElement.prototype.ownerDocument	= null;
cXBLTemplateElement.prototype.localName		= "template";
cXBLTemplateElement.prototype.namespaceURI	= cXBLLanguage.namespaceURI;
cXBLTemplateElement.prototype.prefix		= '';
cXBLTemplateElement.prototype.attributes	= null;
cXBLTemplateElement.prototype.childNodes	= null;
cXBLTemplateElement.prototype.firstChild	= null;
cXBLTemplateElement.prototype.lastChild		= null;
cXBLTemplateElement.prototype.nextSibling		= null;
cXBLTemplateElement.prototype.previousSibling	= null;
cXBLTemplateElement.prototype.parentNode		= null;

// Public Methods
cXBLTemplateElement.prototype.getElementById	= function(sId) {
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

cXBLTemplateElement.prototype.getElementsByTagName	= function(sTagName) {
	sTagName	= sTagName.toLowerCase();
	return (function (oNode) {
		for (var aElements = []; oNode; oNode = oNode.nextSibling) {
			// Only go over shadow children, prevent jumping out by checking xblChild property
			if (oNode.nodeType == 1 && !oNode.xblChild) {
				if (sTagName == '*' || oNode.tagName.toLowerCase() == sTagName)
					aElements.push(oNode);
				if (oNode.firstChild)
					aElements	= aElements.concat(arguments.callee(oNode.firstChild));
//					aElements.push.apply(aElements, arguments.callee(oNode.firstChild));
			}
		}
		return aElements;
	})(this.firstChild);
};