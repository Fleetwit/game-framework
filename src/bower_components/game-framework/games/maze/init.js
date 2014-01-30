(function() {
	var game = function(gf, data) {
		var scope = this;
		this.gf 	= gf;
		this.data 	= data;
		this.data.data = _.extend({
			map:		"auto",
			gwidth:		12,
			gheight:	12,
			theme:		false
		},this.data.data);
		
		
	}
	// Build the component
	game.prototype.build = function(layers) {
		var scope = this;
		
		layers.instructions.addClass("game-maze");
		layers.game.addClass("game-maze");
		
		// Build the instructions
		layers.elements.instructions.container.addClass("instruction-tap");
		
		this.element = layers.elements.game.container;
		
		
	}
	game.prototype.init = function() {
		var scope = this;
		
		var containerWidth 	= this.element.width();
		var containerHeight = this.element.height();
		
		this.data.data.blockSize 	= Math.round(containerWidth/this.data.data.gwidth);
		this.data.data.width		= containerWidth;
		this.data.data.height		= containerWidth;
		this.element.css({
			width:	containerWidth,
			height:	containerWidth
		});
		
		var mazeId = _.uniqueId("maze");
		
		this.stage 	= $.create("div", this.element);
		this.stage.attr("id",mazeId);
		this.stage.css({
			width:	this.data.data.width,
			height:	this.data.data.height,
			"background-color":	"#5B5C5E",
			margin:	"0 auto"
		});
		
		this.maze = new mazeEditor({
			canvasId:	mazeId,
			width:		this.data.data.gwidth,
			height:		this.data.data.gheight,
			blockSize:	this.data.data.blockSize,
			elastic:	false,
			friction:	false,
			trail:		true,
			editor:		false,
			theme:		this.data.data.theme,
			onWin:		function() {
				var score = 0;	// no error we can quantify
				scope.end();
			}
		});
		
		this.maze.init();
		
		
		if (this.data.data.map == "auto") {
			this.maze.generate();
		} else {
			this.maze.load(this.data.data.map);
		}
		this.maze.play();
		
		
	}
	game.prototype.hide = function() {
		console.log("unload");
		this.maze.unload();
	}
	// Register the component
	window.gfFactory.game("maze", game, {
		description:	"Maze",
		version:		1.0,
		author:			"Julien Loutre <julien@twenty-six-medias.com>"
	});
})();