(function() {
	
	var screenjs = function(container) {
		var scope 			= this;
		this.screens		= {};			// Screen dictionnary
		this.container		= container;	// Screen container
		this.current		= false;		// Current screen being displayed
		this.slideDuration	= 500;
		
		// Force the CSS properties
		this.container.css({
			position:	"relative",
			overflow:	"hidden"
		});
		
		// Autodetect the screens
		this.container.find('[data-screenid]').each(function(idx, item) {
			scope.add($(item));
		});
	};
	screenjs.prototype.add = function(element, options) {
		// Extend the options
		options = _.extend({
			onShowStart:	function() {},
			onShowEnd:		function() {},
			onHideStart:	function() {},
			onHideEnd:		function() {},
			onAdd:			function() {}
		},options);
		
		// Create a unique screen ID
		if (element.data('screenid')) {
			var sid		= element.data('screenid');
		} else {
			var sid		= _.uniqueId('screen');
		}
		
		options.onAdd(sid);
		
		// Register the screen
		this.screens[sid] = {
			element:	element,
			sid:		sid,
			visible:	false,
			options:	options
		}
		
		// Force the css properties
		element.css({
			position:	"absolute",
			width:		"100%",
			height:		"100%",
			top:		0,
			left:		0
		});
		
		// If this element's parent is not the screen container, we move it there
		if (!element.parent().is(this.container)) {
			element.detach().appendTo(this.container);
		}
		
		// Hide the element
		element.hide();
		
		return sid;
	};
	screenjs.prototype.show = function(sid) {
		console.log("showing ",sid);
		var scope = this;
		
		if (!this.screens[sid]) {
			console.log("Screen '"+sid+"' doesn't exist.");
			return false;
		}
		
		if (this.current) {
			(function(current) {
				// Move the current screen to its starting position
				scope.screens[sid].element.css({
					top:		0,
					left:		scope.container.width()
				});
				// Show the IN screen
				scope.screens[sid].element.show();
				// Show the OUT screen
				scope.screens[current].element.show();
				
				// Animate the OUT screen
				scope.screens[current].options.onHideStart();
				scope.screens[current].element.animate({
					top:		0,
					left:		0-scope.container.width()
				}, scope.slideDuration, function() {
					scope.screens[current].options.onHideEnd();
					// Hide the screen
					scope.screens[current].element.hide();
				});
				// Animate the IN screen
				scope.screens[sid].options.onShowStart();
				scope.screens[sid].element.animate({
					top:		0,
					left:		0
				}, scope.slideDuration, function() {
					scope.screens[sid].options.onShowEnd();
				});
			})(this.current);
		} else {
			this.screens[sid].element.fadeIn();
		}
		this.current = sid;
	};
	screenjs.prototype.get = function(sid) {
		var scope = this;
		
		if (!this.screens[sid]) {
			console.log("Screen '"+sid+"' doesn't exist.");
			return false;
		}
		return scope.screens[sid].element;
	};
	
	
	// Global scope
	window.screenjs 		= screenjs;
})();