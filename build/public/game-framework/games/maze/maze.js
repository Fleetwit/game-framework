/**
	photofeed
	@version:		1.0.0
	@author:		Julien Loutre <julien.loutre@gmail.com>
*/
(function($){
 	$.fn.extend({
 		game_maze: function() {
			var plugin_namespace = "game_maze";
			
			var pluginClass = function() {};
			
			pluginClass.prototype.init = function (options) {
				try {
					
					var scope = this;
					var i;
					
					
					this.options = $.extend({
						onEnd: 		function() {},
						width:		396,
						height:		396,
						gwidth:		12,
						gheight:	12,
						blockSize:	33,
						theme:		false,
						map:		{"start":{"x":9,"y":0},"end":{"x":24,"y":24},"v":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,1,1,0,0,1,0,0],[1,0,0,0,1,1,1,0,0,0,1,0,1,0,0,1,1,1,1,0,1,0,0,0,0],[0,1,0,0,0,0,1,0,1,1,1,0,0,0,1,1,1,1,0,1,0,1,1,1,0],[0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,1,1,0,1,0,1,0,1,0,0],[0,0,0,0,1,1,0,0,1,1,1,0,0,0,1,0,0,1,0,1,1,1,0,1,0],[0,0,0,0,1,1,1,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,1,0,1,1,0,0],[0,1,0,0,1,1,1,0,1,1,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,1,1,0,0,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,0,0,0],[1,0,0,0,0,1,1,0,1,1,1,1,0,0,0,1,0,1,1,1,0,0,1,0,0],[0,1,0,0,1,1,1,0,1,1,1,1,0,0,1,1,0,1,0,0,1,0,0,0,0],[1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,1,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,0,0],[0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,1,1,1,0,1,0,0,0,1,0],[0,0,0,0,0,1,1,0,0,1,1,0,1,1,1,1,1,1,1,1,0,0,1,1,0],[0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,0,1,0,1,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,0,1,1,1,0,1,0,0,0],[0,0,1,1,1,1,1,1,0,1,1,0,1,1,1,0,1,1,1,1,1,0,1,0,0],[0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0],[0,1,1,1,1,1,0,0,0,1,0,0,1,1,0,0,1,1,0,1,0,1,1,0,1],[1,1,0,0,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0]],"h":[[1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],[1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,0,1,0,1,0,1,1],[1,0,1,0,1,0,0,1,0,0,1,1,1,1,1,0,0,0,0,1,0,0,1,0,1],[1,1,1,0,1,1,1,0,1,0,0,1,1,1,1,0,0,0,1,0,1,1,0,0,1],[1,0,1,0,1,0,0,1,1,1,1,1,1,1,1,0,1,1,0,1,0,0,1,0,1],[1,1,1,0,0,0,1,1,1,0,0,1,1,1,0,1,1,1,1,1,0,0,1,1,1],[1,1,1,0,1,0,0,1,1,1,1,1,1,0,1,0,0,1,1,1,0,1,0,1,1],[1,1,1,0,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,1,0,1,1],[1,0,1,0,1,0,0,1,1,0,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1],[1,1,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],[1,1,1,0,1,1,0,0,1,0,0,1,1,0,0,1,0,0,0,1,1,1,1,1,1],[1,0,1,0,1,0,0,1,0,0,0,0,1,1,1,1,1,0,0,0,1,1,0,1,1],[1,0,1,0,1,1,0,0,1,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1],[1,0,1,0,1,0,0,1,1,0,0,0,1,1,1,0,1,0,1,1,0,1,1,1,1],[1,0,1,0,0,1,0,1,1,1,0,1,0,1,1,1,0,0,1,1,1,1,1,1,1],[1,1,1,0,1,0,0,1,1,1,1,1,0,0,1,0,0,0,0,1,1,0,0,1,1],[1,1,1,1,1,0,0,1,1,0,1,1,1,0,1,0,0,0,0,1,0,1,0,1,1],[1,1,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,0,0,1,1,1,0,0],[1,1,1,0,1,0,0,1,1,1,0,1,1,0,0,0,0,0,0,1,0,1,1,0,1],[1,1,1,0,1,1,0,0,1,1,1,1,1,1,0,0,0,1,0,0,1,0,1,1,1],[1,1,1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,1,1],[1,1,1,0,0,1,0,1,0,1,0,1,1,0,1,1,0,0,0,0,0,0,1,1,1],[1,1,0,0,1,0,1,1,1,0,1,1,0,1,0,1,0,0,0,1,0,0,0,1,1],[1,0,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,0,0,1,0],[1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1]]}
					},options);
					
					// pseudo-adaptive fix
					var totalwidth 		= this.options.gwidth*this.options.blockSize;
					var containerWidth 	= this.element.width();
					var containerHeight = this.element.height();
					
					if (totalwidth > containerWidth) {
						// maze too large for the screen
						this.options.blockSize 	= Math.round(containerWidth/this.options.gwidth);
						this.options.width		= containerWidth;
						this.options.height		= containerWidth;
						this.element.css({
							width:	containerWidth,
							height:	containerWidth
						});
					}
					console.log("Maze options 1",this.options);
					
					this.element.empty();
					
					
					window.Arbiter.subscribe("bonus.use", function(data) {
						if (scope[data.bonus.fn]) {
							scope[data.bonus.fn](data.bonus);
						}
					});
					window.Arbiter.subscribe("games.stop", function(data) {
						// Stop the game, unload all events
						scope.maze.unload();
					});
					
					// <div id="stage" style="width:500px;height:500px;border:1px solid #000000;background-color:#365BB4;"></div>
					
					this.stage 	= $.create("div", this.element);
					this.stage.attr("id","stage");
					this.stage.css({
						width:	this.options.width,
						height:	this.options.height,
						"background-color":	"#5B5C5E",
						margin:	"0 auto"
					});
					
					this.maze = new mazeEditor({
						canvasId:	"stage",
						width:		this.options.gwidth,
						height:		this.options.gheight,
						blockSize:	this.options.blockSize,
						elastic:	false,
						friction:	false,
						trail:		true,
						editor:		false,
						theme:		this.options.theme,
						onWin:		function() {
							var score = 0;	// no error we can quantify
							scope.options.onEnd(
								score
							);
						}
					});
					
					this.maze.init();
					this.maze.load(this.options.map)
					this.maze.play();
					
					
				} catch (err) {
					this.error(err);
				}
			};
			
			pluginClass.prototype.lightpath = function (data) {
				try {
					
					var scope = this;
					
					this.maze.lightPath();
					
					// remove the bonus from the list
					window.Arbiter.inform("bonus.used", {
						id:			data.id,
						classname:	data.game_class
					});
					
				} catch (err) {
					this.error(err);
				}
			};
			
			pluginClass.prototype.__init = function (element) {
				try {
					this.element = element;
				} catch (err) {
					this.error(err);
				}
			};
			// centralized error handler
			pluginClass.prototype.error = function (e) {
				if (console && console.info) {
					console.info("error on "+plugin_namespace+":",e);
				}
			};
			// Centralized routing function
			pluginClass.prototype.execute = function (fn, options) {
				try {
					if (typeof(this[fn]) == "function") {
						var output = this[fn].apply(this, [options]);
					} else {
						this.error("'"+fn.toString()+"()' is not a function");
					}
				} catch (err) {
					this.error(err);
				}
			};
			
			// process
			var fn;
			var options;
			if (arguments.length == 0) {
				fn = "init";
				options = {};
			} else if (arguments.length == 1 && typeof(arguments[0]) == 'object') {
				fn = "init";
				options = $.extend({},arguments[0]);
			} else {
				fn = arguments[0];
				options = arguments[1];
			}
			$.each(this, function(idx, item) {
				// if the plugin does not yet exist, let's create it.
				if ($(item).data(plugin_namespace) == null) {
					$(item).data(plugin_namespace, new pluginClass());
					$(item).data(plugin_namespace).__init($(item));
				}
				$(item).data(plugin_namespace).execute(fn, options);
			});
			return this;
    	}
	});
	
})(jQuery);

