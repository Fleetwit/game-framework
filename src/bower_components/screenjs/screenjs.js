(function() {
	
	var screenjs = function(container) {
		var scope 			= this;
		this.screens		= {};			// Screen dictionnary
		this.container		= container;	// Screen container
		this.current		= false;		// Current screen being displayed
		this.slideDuration	= 500;
		
		this.stack			= [];
		
		// Force the CSS properties
		this.container.css({
			position:	"relative",
			overflow:	"hidden"
		});
		
		this.refresh();
		
		this.locked		= false;
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
			element.attr('data-screenid', sid);
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
	// Go back
	screenjs.prototype.back = function() {
		// Remove the current screen
		this.stack.pop()
		// Remove the current screen and display it
		this.show(this.stack.pop(), "right");
	};
	screenjs.prototype.show = function(sid, direction, options) {
		var scope = this;
		
		if (this.locked) {
			return false;
		}
		
		if (!direction) {
			direction = "left";
		}
		
		options = _.extend({
			onComplete:	function() {}
		},options);
		
		var animationData = {};
		var w = scope.container.width();
		var h = scope.container.height();
		switch (direction) {
			default:
			case "right":
				animationData = {
					in:	{
						from:	[-w, 0],
						to:		[0,0]
					},
					out:	{
						from:	[0, 0],
						to:		[w,0]
					}
				}
			break;
			case "left":
				animationData = {
					in:	{
						from:	[w, 0],
						to:		[0,0]
					},
					out:	{
						from:	[0, 0],
						to:		[-w,0]
					}
				}
			break;
			case "top":
				animationData = {
					in:	{
						from:	[0, h],
						to:		[0,0]
					},
					out:	{
						from:	[0, 0],
						to:		[0,-h]
					}
				}
			break;
			case "bottom":
				animationData = {
					in:	{
						from:	[0, -h],
						to:		[0,0]
					},
					out:	{
						from:	[0, 0],
						to:		[0,h]
					}
				}
			break;
		}
		
		if (!this.screens[sid]) {
			console.log("Screen '"+sid+"' doesn't exist.");
			return false;
		}
		
		this.stack.push(sid);
		
		if (this.current) {
			(function(current) {
				// Lock the screens
				scope.locked = true;
				// Show the IN screen
				scope.screens[sid].element.show();
				// Show the OUT screen
				scope.screens[current].element.show();
				
				// Animate the OUT screen
				scope.screens[current].element.css({
					left:		animationData.out.from[0],
					top:		animationData.out.from[1]
				});
				scope.screens[current].options.onHideStart();
				scope.screens[current].element.animate({
					left:		animationData.out.to[0],
					top:		animationData.out.to[1]
				}, scope.slideDuration, function() {
					scope.screens[current].options.onHideEnd();
					// Hide the screen
					scope.screens[current].element.hide();
				});
				// Animate the IN screen
				scope.screens[sid].element.css({
					left:		animationData.in.from[0],
					top:		animationData.in.from[1]
				});
				scope.screens[sid].options.onShowStart();
				scope.screens[sid].element.animate({
					left:		animationData.in.to[0],
					top:		animationData.in.to[1]
				}, scope.slideDuration, function() {
					scope.screens[sid].options.onShowEnd();
					// Unlock the screens
					scope.locked = false;
					options.onComplete();
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
	// Rescan the DOM to find new screens
	screenjs.prototype.refresh = function() {
		var scope = this;
		this.screens		= {};
		
		// Autodetect the screens
		this.container.find('[data-screenid]').each(function(idx, item) {
			scope.add($(item));
		});
	};
	
	
	// Global scope
	window.screenjs 		= screenjs;
})();