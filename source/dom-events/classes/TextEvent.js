var cTextEvent	= new window.Function;
cTextEvent.prototype	= new cUIEvent;

// Public Properties
cTextEvent.prototype.data	= null;

// Public Methods
cTextEvent.prototype.initTextEvent	= function(sType, bCanBubble, bCancelable, oView, sData) {
	this.initUIEvent(sType, bCanBubble, bCancelable, oView, null);

	//
	this.data	= sData;
};

cTextEvent.prototype.initTextEventNS	= function(sNameSpaceURI, sType, bCanBubble, bCancelable, oView, sData) {
	this.initTextEvent(sType, bCanBubble, bCancelable, oView, sData);

	//
	this.namespaceURI	= sNameSpaceURI;
};

