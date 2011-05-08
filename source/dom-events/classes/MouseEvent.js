var cMouseEvent	= new window.Function;
cMouseEvent.prototype	= new cUIEvent;

// Public Properties
cMouseEvent.prototype.screenX = null;
cMouseEvent.prototype.screenY = null;
cMouseEvent.prototype.clientX = null;
cMouseEvent.prototype.clientY = null;
cMouseEvent.prototype.ctrlKey = null;
cMouseEvent.prototype.altKey  = null;
cMouseEvent.prototype.shiftKey= null;
cMouseEvent.prototype.metaKey = null;
cMouseEvent.prototype.button  = null;
cMouseEvent.prototype.relatedTarget = null;

// Public Methods
cMouseEvent.prototype.initMouseEvent	= function(sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY, bCtrlKey, bAltKey, bShiftKey, bMetaKey, nButton, oRelatedTarget) {
	this.initUIEvent(sType, bCanBubble, bCancelable, oView, nDetail);

	//
	this.screenX  = nScreenX;
	this.screenY  = nScreenY;
	this.clientX  = nClientX;
	this.clientY  = nClientY;
	this.ctrlKey  = bCtrlKey;
	this.altKey   = bAltKey;
	this.shiftKey = bShiftKey;
	this.metaKey  = bMetaKey;
	this.button   = nButton;
	this.relatedTarget = oRelatedTarget;
};

cMouseEvent.prototype.initMouseEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY, bCtrlKey, bAltKey, bShiftKey, bMetaKey, nButton, oRelatedTarget) {
	this.initMouseEvent(sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY, bCtrlKey, bAltKey, bShiftKey, bMetaKey, nButton, oRelatedTarget);

	//
	this.namespaceURI	= sNameSpaceURI;
};

cMouseEvent.prototype.getModifierState = function(sModifier) {
	switch (sModifier) {
		case "Alt":		return this.altKey;
		case "Control":	return this.ctrlKey;
		case "Meta":	return this.metaKey;
		case "Shift":	return this.shiftKey;
	}
	return false;
};