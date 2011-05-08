var cEvent	= new window.Function;

// Constants
cEvent.CAPTURING_PHASE	= 1;
cEvent.AT_TARGET		= 2;
cEvent.BUBBLING_PHASE	= 3;

// Public Properties
cEvent.prototype.namespaceURI	= null;
cEvent.prototype.bubbles		= null;
cEvent.prototype.cancelable		= null;
cEvent.prototype.currentTarget	= null;
cEvent.prototype.eventPhase		= null;
cEvent.prototype.target			= null;
cEvent.prototype.timeStamp		= null;
cEvent.prototype.type			= null;
cEvent.prototype.defaultPrevented	= false;

// Private Properties
cEvent.prototype.$stopped			= false;
cEvent.prototype.$stoppedImmediate	= false;

// Public Methods
cEvent.prototype.initEvent		= function(sType, bCanBubble, bCancelable) {
    this.type       = sType;
    this.bubbles    = bCanBubble;
    this.cancelable = bCancelable;
};

cEvent.prototype.initEventNS		= function(sNameSpaceURI, sType, bCanBubble, bCancelable) {
	this.initEvent(sType, bCanBubble, bCancelable);

	//
    this.namespaceURI	= sNameSpaceURI;
};

cEvent.prototype.stopPropagation	= function() {
	this.$stopped	= this.bubbles;
};

cEvent.prototype.stopImmediatePropagation	= function() {
	this.$stoppedImmediate	= this.$stopped	= this.bubbles;
};

cEvent.prototype.preventDefault	= function() {
	this.defaultPrevented	= this.cancelable;
};