(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			list: ["hello","world","fleetwit"]
		},this.data.data);
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-sort");
		layers.game.addClass("game-sort");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container = layers.elements.game.container
		this.container.css("padding", "10px");
		
		this.wordlist = gameElements.wordlist(this.container, {
			block:	true
		});
		_.each(this.data.data.list, function(word) {
			scope.wordlist.addWord(word);
		});
		
		this.wordlist.shuffle();
		
		var sorter = new gameElements.sortlist({
			element:	this.wordlist.element,
			parent:		layers.elements.game.container,
			onStart:	function() {
				console.log("Starting the drag...");
			},
			onSort:		function() {
				var serialized = sorter.serialize();
				// check if we have the right one
				var i;
				var l = serialized.length;
				var correct = true;
				for (i=0;i<l;i++) {
					correct &= (serialized[i] == scope.data.data.list[i]);
				}
				if (correct) {
					scope.end();
				}
			},
			onEnd:		function() {
				console.log("...And we're done.");
			}
		})
	}
	game.prototype.init = function() {
		var scope = this;
		
	}
	game.prototype.hide = function() {
		
	}
	// Register the component
	window.gfFactory.game("sort", game, {
		description:	"Sort",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();