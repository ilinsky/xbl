var cCustomEvent	= new window.Function;
cCustomEvent.prototype	= new cEvent;

// Public Properties
cCustomEvent.prototype.detail	= null;

// Public Methods
cCustomEvent.prototype.initCustomEvent	= function(sType, bCanBubble, bCancelable, oDetail) {
	this.initEvent(sType, bCanBubble, bCancelable);

	//
	this.detail	= oDetail;
};

cCustomEvent.prototype.initCustomEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oDetail) {
	this.initCustomEvent(sType, bCanBubble, bCancelable, oDetail);

	//
	this.namespaceURI	= sNameSpaceURI;
};