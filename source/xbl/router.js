function fNumberToHex(nValue, nLength) {
	var sValue	= window.Number(nValue).toString(16);
	if (sValue.length < nLength)
		sValue	= window.Array(nLength + 1 - sValue.length).join('0') + sValue;
	return sValue;
};

// Event-related
function fEventTarget(oElement) {
	for (var oNode = oElement; oNode; oNode = oNode.parentNode)
		if (oNode.xblChild || (oNode.xblImplementations && oNode.xblImplementations instanceof cXBLImplementationsList))
			return oNode;
	return oElement;
};

function fMouseEventButton(nButton) {
	if (!document.namespaces)
		return nButton;
	if (nButton == 4)
		return 1;
	if (nButton == 2)
		return 2;
	return 0;
};

function fKeyboardEventIdentifier(oEvent) {
	return oKeyIdentifiers[oEvent.keyCode] || ('U+' + fNumberToHex(oEvent.keyCode, 4)).toUpperCase();
};

function fKeyboardEventModifiersList(oEvent) {
	var aModifiersList = [];
	if (oEvent.altKey)
		aModifiersList[aModifiersList.length] = "Alt";
	if (oEvent.ctrlKey)
		aModifiersList[aModifiersList.length] = "Control";
	if (oEvent.metaKey)
		aModifiersList[aModifiersList.length] = "Meta";
	if (oEvent.shiftKey)
		aModifiersList[aModifiersList.length] = "Shift";
	return aModifiersList.join(' ');
};

var oKeyIdentifiers	= {
	8:		'U+0008',	// The Backspace (Back) key
	9:		'U+0009',	// The Horizontal Tabulation (Tab) key

	13:		'Enter',

	16:		"Shift",
	17:		"Control",
	18:		"Alt",

	20:		'CapsLock',

	27:		'U+001B',	// The Escape (Esc) key

	33:		'PageUp',
	34:		'PageDown',
	35:		'End',
	36:		'Home',
	37:		'Left',
	38:		'Up',
	39:		'Right',
	40: 	'Down',

	45:		'Insert',
	46:		'U+002E',	// The Full Stop (period, dot, decimal point) key (.)

	91:		'Win',

	112:	'F1',
	113:	'F2',
	114:	'F3',
	115:	'F4',
	116:	'F5',
	117:	'F6',
	118:	'F7',
	119:	'F8',
	120:	'F9',
	121:	'F10',
	122:	'F11',
	123:	'F12'/*,
	144:	'NumLock'*/
};

function fRegisterEventRouter(oBinding, sName) {
	// Forward events that are not implemented by browsers
	if (sName == "textInput")
		sName	= "keypress";
	else
	if (sName == "mousewheel") {
		// Gecko only
		if (window.controllers)
			sName	= "DOMMouseScroll";
	}
	// Pickup events that do not directly lead to required event generation
	else
	if (sName == "mouseenter") {
		// All but IE
		if (!document.namespaces)
			sName	= "mouseover";
	}
	else
	if (sName == "mouseleave") {
		// All but IE
		if (!document.namespaces)
			sName	= "mouseout";
	}
	else
	if (sName == "click") {
		// Additional handlers needed to catch atavistic events
		fRegisterEventRouter(oBinding, "contextmenu");
		fRegisterEventRouter(oBinding, "dblclick");
	}
	else
	if (sName == "DOMFocusIn")
		sName	= "focus";
	else
	if (sName == "DOMFocusOut")
		sName	= "blur";
	else
	if (sName == "DOMActivate")
		sName	= "click";

	// Return if this type of event router was already registered
	if (oBinding.$handlers[sName])
		return;

	var oElement	= oBinding.boundElement,
		fHandler	= function(oEvent) {
			return fRouteEvent(sName, oEvent, oBinding);
		};

	// Register closure
	oBinding.$handlers[sName]	= fHandler;

	// MutationEvents
	if (sName == "DOMAttrModified") {
		// IE (does not know them at all) && WebKit (does not dispatch it because of some reason, tested in 3.1)
		if (document.namespaces || window.navigator.userAgent.match(/applewebkit/i)) {
			var sPrefix	= '$' + "xbl" + '-', sOldValue, oEventXBL;
			// Take over native methods
			oElement[sPrefix + "setAttribute"]	= oElement.setAttribute;
			oElement.setAttribute	= function(sName, sValue) {
				if (sName == "style")
					sOldValue	= this.style.cssText;
				else
				if (sName == "class")
					sOldName	= this.className;
				else
					sOldValue	= this.getAttribute(sName);
				// if the old value is not equal to the new one
				if (sOldValue != sValue) {
					// Execute native implementation
					if (sName == "style")
						this.style.cssText	= sValue;
					else
					if (sName == "class")
						this.className	= sValue;
					else
						this[sPrefix + "setAttribute"](sName, sValue);
					// Pseudo-dispatch event
					oEventXBL	= new cMutationEvent;
					oEventXBL.initMutationEvent(sName, true, false, this, sOldValue, sValue, sName, sOldValue ? cMutationEvent.MODIFICATION : cMutationEvent.ADDITION);
					fHandler(oEventXBL);
				}
			};
			oElement[sPrefix + "removeAttribute"]	= oElement.removeAttribute;
			oElement.removeAttribute	= function(sName) {
				if (sName == "style")
					sOldValue	= this.style.cssText;
				else
				if (sName == "class")
					sOldName	= this.className;
				else
					sOldValue	= this.getAttribute(sName);
				// if the old value was actually specified
				if (sOldValue) {
					// Execute native implementation
					if (sName == "style")
						this.style.cssText	= '';
					else
					if (sName == "class")
						this.className	= '';
					else
						this[sPrefix + "removeAttribute"](sName);
					// Pseudo-dispatch event
					oEventXBL	= new cMutationEvent;
					oEventXBL.initMutationEvent(sName, true, false, this, sOldValue, null, sName, cMutationEvent.REMOVAL);
					fHandler(oEventXBL);
				}
			};
			return;
		}
	}

	// Add event listener
	if (oElement.attachEvent)
		oElement.attachEvent("on" + sName, fHandler);
	else
		oElement.addEventListener(sName, fHandler, false);
};

function fUnRegisterEventRouter(oBinding, sName) {
	// Return if the router was not registered
	if (!oBinding.$handlers[sName])
		return;

	var oElement	= oBinding.boundElement,
		fHandler	= oBinding.$handlers[sName];

	// Remove event listener
	if (oElement.detachEvent)
		oElement.detachEvent("on" + sName, fHandler);
	else
		oElement.removeEventListener(sName, fHandler, false);

	// Unregister closure
	delete oBinding.$handlers[sName];
};

function fRouteEvent(sType, oEvent, oBinding) {
	var oElement	= fEventTarget(oEvent.srcElement || oEvent.target),
		nClick		= 0,
		oEventXBL	= null,
		oRelated	= null;

	// 1: Create XBLEvent (Only list standard events)
	switch (sType) {
		case "contextmenu":	// mutate to "click"
			sType	= "click";
			// No break left intentionally
		case "mouseover":
		case "mouseout":
			// Verify if event is not in shadow content
			oRelated	= oEvent.relatedTarget || (sType == "mouseover" ? oEvent.fromElement : sType == "mouseout" ? oEvent.toElement : null);
			if (oRelated && fEventTarget(oRelated) == oElement)
				return;
			// No break left intentionally
		case "mousemove":
		case "mousedown":
		case "mouseup":
		case "dblclick":
		case "click":
			oEventXBL	= new cMouseEvent;
			oEventXBL.initMouseEvent(sType, true, true, window, sType == "dblclick" ? 2 : oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey || false, oEvent.type == "contextmenu" ? 2 : fMouseEventButton(oEvent.button), oRelated);
			break;

		case "mouseenter":
		case "mouseleave":
			// TODO: Implement missing mouseenter/mouseleave events dispatching
			// Verify if event is not in shadow content
			oRelated	= oEvent.relatedTarget || (sType == "mouseover" ? oEvent.fromElement : sType == "mouseout" ? oEvent.toElement : null);
			if (oRelated && fEventTarget(oRelated) == oElement)
				return;
			oEventXBL	= new cMouseEvent;
			oEventXBL.initMouseEvent(sType, false, false, window, oEvent.detail || 1, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, oEvent.ctrlKey, oEvent.altKey, oEvent.shiftKey, oEvent.metaKey || false, fMouseEventButton(oEvent.button), oEvent.relatedTarget);
			break;

		case "keydown":
		case "keyup":
			oEventXBL	= new cKeyboardEvent;
			oEventXBL.initKeyboardEvent(sType, true, true, window, fKeyboardEventIdentifier(oEvent), null, fKeyboardEventModifiersList(oEvent));
			break;

		case "keypress":	// Mutated to textInput
			// Filter out non-alphanumerical keypress events
			if (oEvent.ctrlKey || oEvent.altKey || oEvent.keyCode in oKeyIdentifiers)
				return;
			sType	= "textInput";
			// No break left intentionally
		case "textInput":
			oEventXBL	= new cTextEvent;
			oEventXBL.initTextEvent(sType, true, true, window, window.String.fromCharCode(oEvent.charCode || oEvent.keyCode));
			break;

		case "focus":
		case "blur":
			oEventXBL	= new cUIEvent;
			oEventXBL.initUIEvent(sType, false, false, window, null);
			break;

		case "DOMActivate":
			oEventXBL	= new cUIEvent;
			oEventXBL.initUIEvent(sType, true, true, window, null);
			break;

		case "DOMFocusIn":
		case "DOMFocusOut":
		case "scroll":
		case "resize":
			oEventXBL	= new cUIEvent;
			oEventXBL.initUIEvent(sType, true, false, window, null);
			break;

		case "DOMMouseScroll":
			sType	= "mousewheel";
			// No break left intentionally
		case "mousewheel":
			oEventXBL	= new cMouseWheelEvent;
			oEventXBL.initMouseWheelEvent(sType, true, true, window, null, oEvent.screenX, oEvent.screenY, oEvent.clientX, oEvent.clientY, fMouseEventButton(oEvent.button), null, fKeyboardEventModifiersList(oEvent), oEvent.srcElement ? -1 * oEvent.wheelDelta : oEvent.detail * 40);
			break;

		case "load":
		case "unload":
			oEventXBL	= new cEvent;
			oEventXBL.initEvent(sType, false, false);
			break;

		case "submit":
		case "reset":
			oEventXBL	= new cEvent;
			oEventXBL.initEvent(sType, true, true);
			break;

		case "abort":
		case "error":
		case "change":
		case "select":
			oEventXBL	= new cEvent;
			oEventXBL.initEvent(sType, true, false);
			break;

		case "DOMSubtreeModified":
		case "DOMNodeInserted":
		case "DOMNodeRemoved":
		case "DOMNodeRemovedFromDocument":
		case "DOMNodeInsertedIntoDocument":
		case "DOMCharacterDataModified":
		case "DOMElementNameChanged":
		case "DOMAttributeNameChanged":
			// Do not propagate whose changes
			return;

		case "DOMAttrModified":
			if (oEvent.currentTarget != oEvent.target)
				return;
			oEventXBL	= new cMutationEvent;
			oEventXBL.initMutationEvent(sType, true, false, oEvent.relatedNode, oEvent.prevValue, oEvent.newValue, oEvent.attrName, oEvent.attrChange);
			break;

		default:
			oEventXBL	= new cCustomEvent;
			oEventXBL.initCustomEventNS(oEvent.namespaceURI || null, sType, !!oEvent.bubbles, !!oEvent.cancelable, oEvent.detail);
	}

	// Set event to be trusted
	oEventXBL.trusted		= true;

	// 2. Pseudo-dispatch - set targets / phasing
	oEventXBL.target		= oElement;
	oEventXBL.currentTarget	= oBinding.boundElement;
	oEventXBL.eventPhase	= oEvent.target == oEvent.currentTarget ? cEvent.AT_TARGET : cEvent.BUBBLING_PHASE;

	// 3: Process event handler
	var aHandlers	= oBinding.constructor.$handlers ? oBinding.constructor.$handlers[oEventXBL.type] : null;
	if (aHandlers) {
		for (var i = 0, j = aHandlers.length, fHandler; i < j; i++) {
			fHandler = aHandlers[i];
			// 1: Apply Filters
			// Common Filters
			if ("trusted" in fHandler && fHandler["trusted"] != oEventXBL.trusted)
				continue;
			if ("phase" in fHandler)
				if (fHandler["phase"] != oEventXBL.eventPhase)
					continue;

			// Mouse Event + Key Event
			if (oEventXBL instanceof cMouseEvent || oEventXBL instanceof cKeyboardEvent) {
				// Modifier Filters
				if ("modifiers" in fHandler) {
					var sModifiersList	= fHandler["modifiers"];
					if (sModifiersList == "none") {
						if (oEventXBL.ctrlKey || oEventXBL.altKey || oEventXBL.shiftKey || oEventXBL.metaKey)
							continue;
					}
					else
					if (sModifiersList == "any") {
						if (!(oEventXBL.ctrlKey || oEventXBL.altKey || oEventXBL.shiftKey || oEventXBL.metaKey))
							continue;
					}
					else {
						for (var nModifier = 0, aModifier, bPass = true, aModifiersList = sModifiersList.split(' '); nModifier < aModifiersList.length; nModifier++) {
							if (aModifier = aModifiersList[nModifier].match(/([+-]?)(\w+)(\??)/))
								if (oEventXBL.getModifierState(aModifier[2]) == (aModifier[1] == '-'))
									bPass	= false;
						}
						if (!bPass)
							continue;
					}
				}

				// Mouse Event Handler Filters
				if (oEventXBL instanceof cMouseEvent) {
					if ("click-count" in fHandler && fHandler["click-count"] != oEventXBL.detail)
						continue;
					if ("button" in fHandler && fHandler["button"] != oEventXBL.button)
						continue;
				}
				else
				// Key Event Handler Filters
				if (oEventXBL instanceof cKeyboardEvent) {
					if ("key" in fHandler && fHandler["key"] != oEventXBL.keyIdentifier)
						continue;
//					if ("key-location" in fHandler && fHandler["key-location"] != oEventXBL.keyLocation)
//						continue;
				}
			}
			else
			// Text Input Event Handler Filters
			if (oEventXBL instanceof cTextEvent) {
				if ("text" in fHandler && fHandler["text"] != oEventXBL.data)
					continue;
			}
			else
			// Mutation Event Handler Filters
			if (oEventXBL instanceof cMutationEvent) {
				if (oEventXBL.type == "DOMAttrModified") {
					if ("attr-name" in fHandler && fHandler["attr-name"] != oEvent.attrName)
						continue;
					if ("attr-change" in fHandler && cMutationEvent[fHandler["attr-change"].toUpperCase()] != oEvent.attrChange)
						continue;
					if ("prev-value" in fHandler && fHandler["prev-value"] != oEvent.prevValue)
						continue;
					if ("new-value" in fHandler && fHandler["new-value"] != oEvent.newValue)
						continue;
				}
			}

			// 2: Apply Actions
			if ("default-action" in fHandler)
				if (!fHandler["default-action"])
					oEventXBL.preventDefault();

			if ("propagate" in fHandler)
				if (!fHandler["propagate"])
					oEventXBL.stopPropagation();

			// 3: Execute handler
			fHandler.call(oBinding, oEventXBL);

			// 4: Exit if propagation stopped
			if (oEventXBL.$stoppedImmediate)
				break;
		}
	}

	// 4: Dispatch derived event
	switch (sType) {
		case "focus":
		case "blur":
			if (!fRouteEvent(sType == "focus" ? "DOMFocusIn" : "DOMFocusOut", oEvent, oBinding))
				oEventXBL.preventDefault();
			break;

		case "mouseover":
		case "mouseout":
			// TODO
			if (oEvent.relatedTarget && oEvent.currentTarget == oEvent.target)
				if (oEvent.target.parentNode == oEvent.relatedTarget || oEvent.target.parentNode == oEvent.relatedTarget.parentNode)
					fRouteEvent(sType == "mouseover" ? "mouseenter" : "mouseleave", oEvent, oBinding);
			break;

		case "click":
			if (oEventXBL.button == 0) {
				var sTagName	= oEventXBL.target.tagName.toLowerCase();
				if (sTagName == "button" || sTagName == 'a')
					if (!fRouteEvent("DOMActivate", oEvent, oBinding))
						oEventXBL.preventDefault();
			}
			break;
	}

	// 4: Apply changes to browser event flow
	// 4.1: Stop propagation if neccesary
	if (oEventXBL.$stopped) {
		if (oEvent.stopPropagation)
			oEvent.stopPropagation();
		else
			oEvent.cancelBubble	= true;
	}

	// 4.2: Prevent default if neccesary
	if (oEventXBL.defaultPrevented) {
		if (oEvent.preventDefault)
			oEvent.preventDefault();
		return false;
	}
	return true;
};