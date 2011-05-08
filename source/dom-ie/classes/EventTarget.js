function cEventTarget() {
	// Disallow object instantiation
	throw 9;
};

// DOM Level 2 Events
cEventTarget.prototype.dispatchEvent	= function(oEvent) {
	this.fireEvent(fAttachInterface(document.createEventObject(oEvent.type), oEvent));
};

cEventTarget.prototype.addEventListener	= function(sType, vListener, bUseCapture) {
	this.attachEvent("on" + sType, vListener);
};

cEventTarget.prototype.removeEventListener	= function(sType, vListener, bUseCapture) {
	this.detachEvent("on" + sType, vListener);
};

// DOM Level 3 Events
cEventTarget.prototype.addEventListenerNS	= function(sNameSpaceURI, sType, vListener, bUseCapture) {
	throw "Not implemented!";
};

cEventTarget.prototype.removeEventListenerNS	= function(sNameSpaceURI, sType, vListener, bUseCapture) {
	throw "Not implemented!";
};