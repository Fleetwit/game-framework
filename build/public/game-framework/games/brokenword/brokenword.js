(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			words: ["hello|world","I love|javascript"]
		},this.data.data);
		
		this.found = 0;
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-brokenword");
		layers.game.addClass("game-brokenword");
		
		this.words = [];
		_.each(this.data.data.words, function(word) {
			scope.words.push(word.split('|'));
		});
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		// Create the container
		this.container	= gameElements.container(layers.elements.game.container);
		this.container.parent().css("padding", "10px");
		
		this.drop_containers = $();
		
		this.wordlist = gameElements.wordlist(this.container);
		
		// Create the wordparts
		_.each(this.words, function(word) {
			
			var wordpart = gameElements.wordpart(scope.container, {
				empty:	"drop here"
			}).set(0, word[0]);
			
			scope.drop_containers = scope.drop_containers.add(wordpart.get(1));
			
			wordpart.get(1).data("word", word[1]);
			wordpart.get(1).data("wordpart", wordpart);
			
		});
		
		// Create the word list
		_.each(this.words, function(word) {
			
			var wordContainer = scope.wordlist.addWord(word[1]);
			wordContainer.element.css('cursor','move');
			
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
					if (target.data("word") == word[1]) {
						target.data("wordpart").set(1, word[1]);
						wordContainer.empty();
						drag.remove();
						scope.found++;
						if (scope.found == scope.data.data.words.length) {
							scope.end();
						}
					} else {
						scope.gf.showPenalty(3, function() {
							// Register the error after the penalty
							scope.onError([word[0],target.data("word")]);
						});
					}
				}
			})
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
	window.gfFactory.game("brokenword", game, {
		description:	"Brokenword",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();