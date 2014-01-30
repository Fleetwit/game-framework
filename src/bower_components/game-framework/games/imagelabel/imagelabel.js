(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			images: []
		},this.data.data);
		
		this.found = 0;
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-imagelabel");
		layers.game.addClass("game-imagelabel");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container	= gameElements.container(layers.elements.game.container);
		//this.container.parent().css("padding", "10px");
		
		this.drop_containers = $();
		
		
		// Create the word list
		this.wordlist = gameElements.wordlist(this.container);
		
		// Create the 2 2x1 grid
		this.grid = gameElements.grid(this.container, {
			width:	2,
			height:	2
		});
		var coords = {
			0:	[0,0],
			1:	[1,0],
			2:	[0,1],
			3:	[1,1]
		};
		
		var count = 0;
		_.each(this.data.data.images, function(item) {
			
			// Add the label in the wordlist
			var wordContainer = scope.wordlist.addWord(item.label);
			wordContainer.element.css('cursor','move').css('z-index','1000');
			
			// Create the image
			var cell 	= scope.grid.get(coords[count][0], coords[count][1]);
				cell.css('padding','2px');
			var img 	= gameElements.imageContainer(cell, {
				src:		item.image,
				autosize:	true
			});
			img.container.data('img', item.image)
			
			scope.drop_containers = scope.drop_containers.add(img.container);
			
			var dropped = false;
			var drag = new gameElements.drag({
				element:	wordContainer.element,
				target:		scope.drop_containers,
				parent:		scope.container,
				onStart:	function() {
					console.log("Starting the drag...");
				},
				onDrag:		function() {
					console.log("Dragging...");
				},
				onEnd:		function() {
					console.log("...And we're done.");
				},
				onDrop:		function(target) {
					console.log("Dropped!",target);
					if (target.is(img.container)) {
						wordContainer.empty();
						drag.remove();
						scope.found++;
						img.label(item.label);
						if (scope.found == scope.data.data.images.length) {
							scope.end();
						}
					} else {
						scope.gf.showPenalty(3, function() {
							// Register the error after the penalty
							scope.onError([item.label, target.data('img')]);
						});
					}
				}
			});
			
			count++;
		});
		
		this.wordlist.shuffle();
		
		var clearDiv = window.gfFactory.dom("div", this.container);
			clearDiv.addClass("clearfix");
		
	}
	game.prototype.init = function() {
		var scope = this;
		
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("imagelabel", game, {
		description:	"Imagelabel",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();