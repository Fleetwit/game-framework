/**
	game_words
	@version:		1.0.0
	@author:		Julien Loutre <julien.loutre@gmail.com>
*/
(function($){
 	$.fn.extend({
 		game_words: function() {
			var plugin_namespace = "game_words";
			
			var pluginClass = function() {};
			
			pluginClass.prototype.init = function (options) {
				try {
					
					var scope = this;
					var i;
					
					
					this.options = $.extend({
						onEnd: 		function() {},
						onError: 	function() {},
						words:		["hello","world"],
						listContainer:	$(),
						nx:			8,
						ny:			8,
						width:		400,
						height:		400,
						blockSize:	40
					},options);
					
					// Error number (wrong answers, not code errors)
					this.errornumber = 0;
					
					this.mousedown 		= false;
					this.rowx 			= false;
					this.rowy 			= false;
					this.selectedCells	= [];	// buffer for the cells during selection
					this.posBuffer		= {x:0,y:0};	// to prevent repeated events on the same case
					
					this.wordsFound 	= 0;
					
					var containerWidth 	= this.element.width();
					
					this.options.blockSize 	= Math.round(containerWidth/this.options.nx);
					this.options.width		= containerWidth;
					this.options.height		= containerWidth;
					
					this.element.empty();
					
					// debug
					for (i=0;i<6;i++) {
						//$.create("div",this.element).addClass("debug_"+i).html("debug #"+i);
					}
					
					
					this.build();
					
				} catch (err) {
					this.error(err);
				}
			};
			
			pluginClass.prototype.build = function (data) {
				try {
					
					var scope = this;
					var i;
					var j;
					var k;
					
					// Build the letter grid
					this.grid = []; // [y][x] format
					for (j=0;j<this.options.ny;j++) {
						this.grid[j] = [];
						for (i=0;i<this.options.nx;i++) {
							this.grid[j][i] = {
								letter:		this.randomLetter(), // "["+i+":"+j+"]"
								available:	true
							};
						}
					}
					
					
					for (k=0;k<this.options.words.length;k++) {
						this.placeWord(this.options.words[k], k);
					}
					
					
					// Build the wordlist
					this.wordContainer = $.create("ul", this.options.listContainer);
					this.wordContainer.addClass("gameElements wordlist");
					for (i=0;i<this.options.words.length;i++) {
						(function(n) {
							var word = $.create("li", scope.wordContainer);
							word.addClass("word");
							word.addClass("word_"+n);
							word.html(scope.options.words[n]);
						})(i);
					}
					
					// Build the container
					this.container = $.create("table", this.element);
					this.container.addClass("game_words");
					this.container.attr("cellspacing",0);
					this.container.attr("cellpadding",0);
					
					this.touchEvent = new touchEvent($(document), function(touchData) {
						// Just to remove the scroll and select on the document
					}, true);	// block the event propagation
					
					for (j=0;j<this.options.ny;j++) {
						var tr = $.create("tr", this.container);
						for (i=0;i<this.options.nx;i++) {
							(function(x,y,el) {
								// Create the cell
								var td = $.create("td", el);
								td.html(scope.grid[y][x].letter);
								td.css({
									width:	scope.options.blockSize,
									height:	scope.options.blockSize
								});
								
								// Set the cell data
								if (!scope.grid[y][x].available) {
									//td.addClass("show");
									td.data("word", true);
									td.data("wordid", scope.grid[y][x].wordid);
									td.data("dir", scope.grid[y][x].dir);
								} else {
									td.data("word", false);
								}
								
								td.bind("vmousedown", function(e) {
									scope.rowx = x;
									scope.rowy = y;
								});
								
								// Circular ref to the element
								scope.grid[y][x].cell = td;
							})(i,j,tr);
						}
					}
					
					
						
					// Mobile fix
					j = 0;	// Work on line #0
					// We will total the width of each cell on each line
					var totalw = 0;
					for (i=0;i<this.options.nx;i++) {
						totalw += scope.grid[j][i].cell.outerWidth();
					}
					// We we fix the size of each cell
					var cellSize = Math.floor((totalw/this.options.nx));
					$(".debug_0").html("<div>totalw["+j+"]: "+totalw+"</div>");
					$(".debug_1").html("<div>cellSize["+j+"]: "+cellSize+"</div>");
					$(".debug_2").html("this.options.nx: "+this.options.nx);
					$(".debug_3").html("New table size: "+(cellSize*this.options.nx)+"px");
					
					// Set the width of the table, to avoid decimal width
					this.container.css({
						width:	cellSize*this.options.nx
					});
					
					$(".debug_4").html("Found table size: "+this.container.outerWidth()+"px");
					for (j=0;j<this.options.ny;j++) {
						for (i=0;i<this.options.nx;i++) {
							scope.grid[j][i].cell.css({
								width:	cellSize,
								height:	cellSize
							});
						}
					}
					
					// Now we need to update the value of this.options.blockSize else the maths will be off
					scope.options.blockSize = cellSize;
					
					// debug: Make sure the cells are of the right size:
					$(".debug_5").html("<div>[0;0]: "+scope.grid[0][0].cell.outerWidth()+"x"+scope.grid[0][0].cell.outerHeight()+"</div>");
					
					// update the word container's width
					this.wordContainer.css({
						width:	this.container.outerWidth()
					});
					
					
					// TouchEvents on the table
					this.tableTouchEvent = new touchEvent(this.container, function(touchData) {
						switch (touchData.type) {
							case "mousedown":
								
							break;
							case "mouseup":
								// validate
								scope.checkSelection();
								// reset the selected cells
								scope.resetSelectedCells();
							break;
							case "mousemove":
							break;
							case "mousedrag":
								scope.hoverCell(touchData.pos.x, touchData.pos.y);
							break;
						}
						//$(".debug_1").html("[table] "+touchData.type+" ["+touchData.pos.x+";"+touchData.pos.y+"]");
						
					}, false, this.container.outerWidth()/this.options.nx);
					
				} catch (err) {
					this.error(err);
				}
			};
			
			// Select cells from start to end
			pluginClass.prototype.hoverCell = function (tox,toy) {
				try {
					var scope = this;
					
					// Restrict to the grid
					tox 		= this.bound(tox, 0, this.options.nx-1);
					tox 		= this.bound(tox, 0, this.options.ny-1);
					
					// Reset the selection
					this.resetSelectedCells();
					
					// Is it a straight line?
					// only one case selected?
					if (this.rowx == tox && this.rowy == toy) {
						// only one cell.
						// We select it
						this.selectedCells.push({
							x:	tox,
							y:	toy
						});
						// Visually select the cell
						this.grid[toy][tox].cell.addClass("selected");
					} else if (this.rowx == tox) {
						// Common x
						// Select all the cells in between
						var start 	= Math.min(this.rowy,toy);
						var end 	= Math.max(this.rowy,toy);
						for (i=start;i<=end;i++) {
							this.selectedCells.push({
								x:	tox,
								y:	i
							});
							// Visually select the cell
							this.grid[i][tox].cell.addClass("selected");
						}
					} else if (this.rowy == toy) {
						// Common x
						// Select all the cells in between
						var start 	= Math.min(this.rowx,tox);
						var end 	= Math.max(this.rowx,tox);
						for (i=start;i<=end;i++) {
							this.selectedCells.push({
								x:	i,
								y:	toy
							});
							// Visually select the cell
							this.grid[toy][i].cell.addClass("selected");
						}
					}
					
				} catch (err) {
					this.error(err);
				}
			};
			
			// Check if [x;y] is connected to a selected cell
			pluginClass.prototype.isConnected = function (x,y) {
				try {
					// Nothing selected yet? So we can select it
					if (this.selectedCells.length == 0) {
						return true;
					}
					var i;
					
					// Generate the valid coordinates
					var coordList = [];
					for (i=-1;i<=1;i++) {
						for (j=-1;j<=1;j++) {
							// remove the diagonals
							var coordStr = (x+i)+"."+(y+j);
							if (Math.abs(i) != Math.abs(j)) {
								coordList.push(coordStr);
							}
						}
					}
					
					// Now check if the cell is among those coordinates
					var connected = false;	// Assume it's not
					for (i=0;i<this.selectedCells.length;i++) {
						for (j=0;j<coordList.length;j++) {
							connected = connected || ((this.selectedCells[i].x+"."+this.selectedCells[i].y) == coordList[j])
						}
					}
					
					return connected;
					
					
				} catch (err) {
					this.error(err);
				}
			};
			
			// Check if [x;y] is already selected
			pluginClass.prototype.isSelected = function (x,y) {
				try {
					// Nothing selected yet? Then the current case is not selected
					if (this.selectedCells.length == 0) {
						return false;
					}
					var i;
					var j;
					
					var exists = false;	// Assume it's not
					for (i=0;i<this.selectedCells.length;i++) {
						exists = exists || (this.selectedCells[i].x == x && this.selectedCells[i].y == y);
					}
					
					return exists;
					
					
				} catch (err) {
					this.error(err);
				}
			};
			
			
			// Check if the selection is a word
			pluginClass.prototype.checkSelection = function () {
				try {
					var scope = this;
					var i;
					// Check each selected letter
					// If a letter is available, then return false
					// if all the letters are not from the same word, then return false
					var word = false;
					for (i=0;i<this.selectedCells.length;i++) {
						var gridData = this.grid[this.selectedCells[i].y][this.selectedCells[i].x];
						// A letter is available? then not from a word. Return false
						if (gridData.available) {
							this.errornumber++;
							// Assemble the word
							var wordStr = "";
							_.each(this.selectedCells, function(c) {
								wordStr += scope.grid[c.y][c.x].cell.text();
							});
							console.log("wordStr",wordStr);
							this.options.onError(wordStr);
							return false;
						}
						// Not the same word? return false.
						if (word !== false && gridData.word != word) {
							this.errornumber++;
							// Assemble the word
							var wordStr = "";
							_.each(this.selectedCells, function(c) {
								wordStr += scope.grid[c.y][c.x].cell.text();
							});
							console.log("wordStr",wordStr);
							this.options.onError(wordStr);
							return false;
						}
						word = gridData.word;
					}
					
					// No word? return false;
					if (word === false) {
						this.errornumber++;
						// Assemble the word
						var wordStr = "";
						_.each(this.selectedCells, function(c) {
							wordStr += scope.grid[c.y][c.x].cell.text();
						});
						console.log("wordStr",wordStr);
						this.options.onError(wordStr);
						return false;
					}
					
					// Check if we have all the letters from the word now
					if (this.selectedCells.length != this.options.words[word].length) {
						this.errornumber++;
						// Assemble the word
						var wordStr = "";
						_.each(this.selectedCells, function(c) {
							wordStr += scope.grid[c.y][c.x].cell.text();
						});
						console.log("wordStr",wordStr);
						this.options.onError(wordStr);
						return false;
					}
					
					// Select the letters
					for (i=0;i<this.selectedCells.length;i++) {
						this.grid[this.selectedCells[i].y][this.selectedCells[i].x].cell.addClass("active");
						// deactivate the selection
						this.grid[this.selectedCells[i].y][this.selectedCells[i].x].available = true;
					}
					
					// strike the word
					$(".word_"+word).addClass("found");
					
					console.log("Word '"+this.options.words[word]+"' found.");
					this.wordsFound++;
					if (this.wordsFound == this.options.words.length) {
						console.log("Win!");
						this.options.onEnd(this.errornumber);
					}
					
					
					return true;
					
				} catch (err) {
					this.error(err);
				}
			};
			
			// Mouseup, we reset the selection
			pluginClass.prototype.resetSelectedCells = function () {
				try {
					// 
					this.selectedCells 	= [];
					this.posBuffer		= {x:0,y:0};
					this.container.find(".selected").removeClass("selected");
				} catch (err) {
					this.error(err);
				}
			};
			
			// Get a random letter from A to Z
			pluginClass.prototype.randomLetter = function () {
				try {
					// keycodes [65-90] (A-Z))
					return String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65);
				} catch (err) {
					this.error(err);
				}
			};
			
			// Get a rounded random number in a range
			pluginClass.prototype.rand = function (min,max) {
				try {
					return Math.floor(Math.random() * (max - min + 1)) + min;
				} catch (err) {
					this.error(err);
				}
			};
			
			// Bound a value to a range
			pluginClass.prototype.bound = function (val, min, max) {
				try {
					if (val < min) {
						return min;
					}
					if (val > max) {
						return max;
					}
					return val;
				} catch (err) {
					this.error(err);
				}
			};
			
			// Place a word in the grid, random position and random direction (horizontal or vertical)
			pluginClass.prototype.placeWord = function (word, wordid) {
				try {
					
					var i;
					var l			= word.length;
					var wordArray	= word.toUpperCase().split('');
					var d			= this.rand(0,1);	// 0 -> h, 1 -> v
					var r			= this.rand(0,1);	// 0 -> ltr, 1 -> rtl
					
					if (d == 0) {
						// horizontal
						// choose a random Y position
						var rndy	= this.rand(0,this.options.ny-1);
						// find the max x position
						var xmax	= this.options.nx-1-l;
						// Choose a random x position
						var rndx	= this.rand(0,xmax);
						
						// Check that the space is available
						var available = true;
						for (i=0;i<l;i++) {
							var cursor = i+rndx;
							available &= this.grid[rndy][cursor].available;
						}
						// if it's not available, we retry
						if (!available) {
							return this.placeWord(word,wordid);
						} else {
							// place the word
							if (r == 0) {
								for (i=0;i<l;i++) {
									var cursor = i+rndx;
									this.grid[rndy][cursor] = {
										available:	false,
										letter:		wordArray[i],
										dir:		"h",
										word:		wordid
									};
								}
							} else {
								for (i=0;i<l;i++) {
									var cursor = i+rndx;
									this.grid[rndy][cursor] = {
										available:	false,
										letter:		wordArray[(l-1)-i],
										dir:		"h",
										word:		wordid
									};
								}
							}
						}
					} else {
						// vertical
						// choose a random X position
						var rndx	= this.rand(0,this.options.nx-1);
						// find the max x position
						var ymax	= this.options.ny-1-l;
						// Choose a random x position
						var rndy	= this.rand(0,ymax);
						
						// Check that the space is available
						var available = true;
						for (i=0;i<l;i++) {
							var cursor = i+rndy;
							available &= this.grid[cursor][rndx].available;
						}
						// if it's not available, we retry
						if (!available) {
							return this.placeWord(word,wordid);
						} else {
							// place the word
							for (i=0;i<l;i++) {
								var cursor = i+rndy;
								this.grid[cursor][rndx] = {
									available:	false,
									letter:		wordArray[i],
									dir:		"v",
									word:		wordid
								};
							}
						}
					}
					
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

