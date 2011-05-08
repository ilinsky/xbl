var cMouseWheelEvent	= new window.Function;
cMouseWheelEvent.prototype	= new cMouseEvent;

// Public Properties
cMouseWheelEvent.prototype.wheelDelta	= null;

// Public Methods
cMouseWheelEvent.prototype.initMouseWheelEvent	= function(sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY/*, bCtrlKey, bAltKey, bShiftKey, bMetaKey*/, nButton, oRelatedTarget, sModifiersList, nWheelDelta) {
	this.initMouseEvent(sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY, sModifiersList.indexOf("Control") >-1, sModifiersList.indexOf("Alt") >-1, sModifiersList.indexOf("Shift") >-1, sModifiersList.indexOf("Meta") >-1, nButton, oRelatedTarget);

	//
	this.wheelDelta	= nWheelDelta;
};

cMouseWheelEvent.prototype.initMouseWheelEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY/*, bCtrlKey, bAltKey, bShiftKey, bMetaKey*/, nButton, oRelatedTarget, sModifiersList, nWheelDelta) {
	this.initMouseWheelEvent(sType, bCanBubble, bCancelable, oView, nDetail, nScreenX, nScreenY, nClientX, nClientY/*, bCtrlKey, bAltKey, bShiftKey, bMetaKey*/, nButton, oRelatedTarget, sModifiersList, nWheelDelta);

	//
	this.namespaceURI	= sNameSpaceURI;
};