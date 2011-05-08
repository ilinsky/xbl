var cUIEvent	= new window.Function;
cUIEvent.prototype	= new cEvent;

// Public Properties
cUIEvent.prototype.view		= null;
cUIEvent.prototype.detail	= null;

// Public Methods
cUIEvent.prototype.initUIEvent	= function(sType, bCanBubble, bCancelable, oView, nDetail) {
	this.initEvent(sType, bCanBubble, bCancelable);

	//
	this.view	= oView;
	this.detail	= nDetail;
};

cUIEvent.prototype.initUIEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oView, nDetail) {
	this.initUIEvent(sType, bCanBubble, bCancelable, oView, nDetail);

	//
	this.namespaceURI	= sNameSpaceURI;
};