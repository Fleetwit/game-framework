(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		
		this.data.data = _.extend({
			width:		4,
			height:		4
		},this.data.data);
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-memory");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		var container	= gameElements.container(layers.elements.game.container,{
			square:		true
		});
		container.parent().css("padding", "10px");
		
		// Create the grid
		this.grid = gameElements.grid(container, {
			width:		this.data.data.width,
			height:		this.data.data.height,
			square:		true
		});
		
		// Game settings
		this.images 		= new Array();
		this.found			= new Array();
		this.turnedStack	= new Array();	// List the cards turned
		this.locked			= false;
		
		// List all images in an array (to pick random ones later in the code)
		var i;
		for (i=0;i<(this.data.data.width*this.data.data.height/2);i++) {
			this.images.push("pic"+(i+1)+".png");
			this.images.push("pic"+(i+1)+".png");
		}
		
		// Create the images
		var x;
		var y;
		for (y=0;y<this.data.data.height;y++) {
			for (x=0;x<this.data.data.width;x++) {
				this.initImage(x, y);
			}
		}
	}
	game.prototype.initImage = function(x, y) {
		var scope = this;
		
		// Get a random image
		var src 	= this.getRandomImage();
		
		// Create the 2 images
		// Create the div, since TDs can't be position: relative
		var div 	= window.gfFactory.dom("div", this.grid.get(x, y));
			div.css({
				width:	"100%",
				height:	"100%"
			});
		// Cover
		var cover 	= window.gfFactory.dom("img", div);
			cover.attr('src', this.data.data.images+"pic0.png");
			cover.attr('data-screenid', 'cover');
		// Cover
		var image 	= window.gfFactory.dom("img", div);
			image.attr('src', this.data.data.images+src);
			image.attr('data-screenid', 'image');
		
		// Set as screen using screenjs
		div.addClass("screen")
		this.grid.get(x, y).css({
			padding:	"1px"
		});
		var screens	= new window.screenjs(div);
		screens.show('cover');
		
		var data	= {
			screenjs:	screens,
			x:			x,
			y:			y,
			src:		src,
			turned:		false,
			found:		false
		}
		
		this.grid.get(x, y).data('memory-data', data);
		
		// Set the events
		cover.click(function() {
			// if the game is locked or if there are already 2 cards turned, no click allowed
			if (scope.locked || scope.turnedStack.length >= 2 || data.turned) {
				return false;
			}
			// Add the card to the turned stack
			scope.turnedStack.push(data);
			
			// If this is the 2nd card, lock the game (We unlock once the card couple is verified
			if (scope.turnedStack.length == 2) {
				scope.locked = true;
			}
			
			// Show the card
			screens.show('image','top', {
				onComplete:	function() {
					data.turned = true;
					
					if (scope.turnedStack.length == 2 && scope.turnedStack[1].x == data.x && scope.turnedStack[1].y == data.y) {
						if (scope.turnedStack[0].src == scope.turnedStack[1].src) {
							// We found a pair!
							
							// Unlock the game
							scope.locked = false;
							
							// Set both cards as turned
							scope.turnedStack[0].found = true;
							scope.turnedStack[1].found = true;
							
							// Save the pair
							scope.found.push(scope.turnedStack[1].src);
							
							// Empty the stack
							scope.turnedStack = [];
							
							// Are we done, did we find every pairs?
							if (scope.found.length == (scope.data.data.width*scope.data.data.height/2)) {
								scope.end();
							}
						} else {
							// Turned both cards
							scope.turnedStack[0].screenjs.show('cover',null,{
								onComplete:	function() {
									
								}
							});
							scope.turnedStack[1].screenjs.show('cover',null,{
								onComplete:	function() {
									// Unlock the game
									scope.locked = false;
								}
							});
							scope.turnedStack[0].turned = false;
							scope.turnedStack[1].turned = false;
							
							// Empty the stack
							scope.turnedStack 	= [];
							
							// Save the error
							scope.onError(false);
							
						}
					}
					
				}
			});
		});
	}
	game.prototype.getRandomImage = function() {
		var scope = this;
		
		var len 	= this.images.length;
		var rnd		= Math.floor((Math.random()*len+Math.random()*len)/2);
		var pic		= this.images[rnd].toString();
		this.images.splice(rnd,1);
		return pic;
	}
	game.prototype.init = function() {
		// Display the animation
		var scope = this;
		var finished = 0;
		this.locked	= true;
		var x;
		var y;
		for (y=0;y<this.data.data.height;y++) {
			for (x=0;x<this.data.data.width;x++) {
				(function(x,y) {
					setTimeout(function() {
						scope.grid.get(x, y).data('memory-data').screenjs.show('image');
						setTimeout(function() {
							scope.grid.get(x, y).data('memory-data').screenjs.show('cover',null,{
								onComplete:	function() {
									finished++;
									if (finished == (scope.data.data.width*scope.data.data.height/2)) {
										// Unlock the game
										scope.locked = false;
									}
								}
							});
							
						}, 3000);
					}, Math.random()*1500);
				})(x,y);
			}
		}
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("memory", game, {
		description:	"Memory",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();