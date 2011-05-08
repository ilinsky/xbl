function cElementSelector() {
	// Disallow object instantiation
	throw 9;
};

cElementSelector.prototype.querySelector	= function(sSelectors, fNSResolver) {
	// Validate input parameter
	if (typeof sSelectors != "string")
		throw 9;
	if (arguments.length > 1 && typeof fNSResolver != "function")
		throw 9;

	return fCSSSelectorQuery([this], sSelectors, fNSResolver)[0] || null;
};

cElementSelector.prototype.querySelectorAll	= function(sSelectors, fNSResolver) {
	// Validate input parameter
	if (typeof sSelectors != "string")
		throw 9;
	if (arguments.length > 1 && typeof fNSResolver != "function")
		throw 9;

	return fCSSSelectorQuery([this], sSelectors, fNSResolver, true);
};