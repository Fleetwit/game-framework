(function() {
	
	
	// Utility, to create new dom elements
	var dom = function(nodeType, appendTo, raw) {
		var element = document.createElement(nodeType);
		if (appendTo != undefined) {
			$(appendTo).append($(element));
		}
		return (raw === true)?element:$(element);
	};
	
	var gameElements = {
		letterGroup:	function(container, options) {
			options = _.extend({
				gravity:	false,
				squeeze:	false,
				onClick:	function() {
					
				}
			},options);
			
			var output = {
				letters:	[]
			};
			
			output.build = function() {
				var i;
				var ul = dom("ul", container);
					ul.addClass("gameElements letterGroup");
					
				
				ul.addClass("regular");
				if (options.number) {
					for (i=0;i<options.number;i++) {
						(function(i) {
							var li = dom("li", ul);
								li.addClass("inset");
								li.click(function() {
									if (!$(this).hasClass("inset")) {
										options.onClick(i, $(this).text().toLowerCase(), li);
										if (options.gravity) {
											output.gravityStep();
										}
									}
								});
							output.letters.push(li);
						})(i);
					}
				} else if (options.letters) {
					if (typeof options.letters == "string") {
						options.letters = options.letters.split('');
					}
					for (i=0;i<options.letters.length;i++) {
						(function(i) {
							var li = dom("li", ul);
								li.html(options.letters[i].toUpperCase());
								li.click(function() {
									if (!$(this).hasClass("inset")) {
										options.onClick(i, $(this).text().toLowerCase(), li);
										if (options.gravity) {
											output.gravityStep();
										}
									}
								});
							output.letters.push(li);
						})(i);
					}
				}
			}
			output.gravityStep = function() {
				for (i=1;i<output.letters.length;i++) {
					// If the current letter is filled and previous one is empty...
					if (!output.letters[i].hasClass("inset") && output.letters[i-1].hasClass("inset")) {
						output.set(i-1, output.letters[i].text());
						output.empty(i);
					}
				}
			}
			output.set = function(pos, letter) {
				output.letters[pos].removeClass("inset").html(letter.toUpperCase());
				return output;
			}
			output.get = function(pos) {
				if (!pos && pos !== 0) {
					var i;
					var word = "";
					for (i=0;i<output.letters.length;i++) {
						var content = output.letters[i].text().toLowerCase();
						if (content != "") {
							word += content;
						}
					}
					return word;
				} else {
					return output.letters[pos].text().toLowerCase();
				}
			}
			output.push = function(letter) {
				for (i=0;i<output.letters.length;i++) {
					if (output.letters[i].hasClass("inset")) {
						output.set(i, letter);
						return output;
					}
				}
				return output;
			}
			output.empty = function(pos) {
				output.letters[pos].removeClass("wrong").addClass("inset").empty();
				return output;
			}
			output.wrong = function(pos) {
				output.letters[pos].removeClass("inset").addClass("wrong");
				return output;
			}
			output.reset = function(pos) {
				output.letters[pos].removeClass("inset").removeClass("wrong");
				return output;
			}
			output.build();
			
			return output;
		},
		keyboard:	function(container, options) {
			options = _.extend({
				layout:		"qwerty",
				onClick:	function() {
					
				}
			},options);
			
			var output = {};
			
			var layout	= {
				qwerty:	[
					'qwertyuiop',
					'asdfghjkl',
					'zxcvbnm'
				]
			};
			
			var index	=  {};
			
			output.build = function() {
				var i,j;
				var keyboard = dom("div", container);
					keyboard.addClass("gameElements keyboard");
				
				if (_.isArray(options.layout)) {
					var keys = options.layout;
				} else {
					var keys = layout[options.layout];
				}
				
				for (i=0;i<keys.length;i++) {
					if (typeof keys[i] == "string") {
						keys[i] = keys[i].split('');
					}
					var line	= dom("ul", keyboard);
					for (j=0;j<keys[i].length;j++) {
						(function(i,j,line) {
							var key = dom("li", line);
								key.html(keys[i][j].toUpperCase());
								key.click(function() {
									if (!$(this).hasClass("disabled") && !$(this).hasClass("inset")) {
										options.onClick(keys[i][j].toLowerCase(), key);
									}
								});
								// Same size for all keys on a line
								key.css("width", (100/keys[i].length)+"%");
							if (index[keys[i][j]]) {
								index[keys[i][j]] = index[keys[i][j]].add(key);
							} else {
								index[keys[i][j]] = key;
							}
							
						})(i,j,line);
					}
				}
			}
			output.disable = function(letters) {
				if (!letters || letters === true) {
					var group = $();
					for (i in index) {
						group = group.add(index[i]);
					}
					if (letters === true) {
						group.removeClass("inset").addClass("disabled");
					} else {
						group.each(function(idx, element) {
							element = $(element);
							if (!element.hasClass("inset")) {
								element.addClass("disabled");
							}
						});
					}
				} else {
					letters = letters.split('');
					_.each(letters, function(letter) {
						index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
						index[letter].addClass("disabled");
					});
				}
			}
			output.enable = function(letters) {
				if (!letters || letters === true) {
					var group = $();
					for (i in index) {
						group = group.add(index[i]);
					}
					if (letters === true) {
						group.removeClass("inset").removeClass("disabled");
					} else {
						group.each(function(idx, element) {
							element = $(element);
							if (!element.hasClass("inset")) {
								element.removeClass("disabled");
							}
						});
					}
				} else {
					letters = letters.split('');
					_.each(letters, function(letter) {
						index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					});
				}
			}
			output.inset = function(letters) {
				letters = letters.split('');
				_.each(letters, function(letter) {
					index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					index[letter].addClass("inset");
				});
			}
			output.reset = function(letters) {
				letters = letters.split('');
				_.each(letters, function(letter) {
					index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
				});
			}
			output.wrong = function(letters) {
				letters = letters.split('');
				_.each(letters, function(letter) {
					index[letter].removeClass("inset").removeClass("wrong").removeClass("disabled");
					index[letter].addClass("wrong");
				});
			}
			output.build();
			
			return output;
		},
		container:	function(container, options) {
			options = _.extend({
				square:	false
			},options);
			
			var output = {};
			
			output.build = function() {
				output.div = dom("div", container);
					output.div.addClass("gameElements ge-container");
			}
			output.build();
			
			output.setSquare = function() {
				var size = {
					container:	{
						width:	container.width(),
						height:	container.height()
					}
				};
				size.div = {
					width:	Math.min(size.container.width,size.container.height),
					height:	Math.min(size.container.width,size.container.height)
				};
				var ratio = {
					container:	size.container.width/size.container.height,
					div:		1
				};
				output.div.css({
					width:	size.div.width,
					height:	size.div.height
				});
			}
			
			
			if (options.square) {
				setInterval(function() {
					output.setSquare();
				}, 300);
			}
			
			return output.div;
		},
		grid:	function(container, options) {
			
			options = _.extend({
				width:		3,
				height:		3,
				square:		false
			},options);
			
			var output = {
				cells:	{}
			};
			
			output.group = $();
			
			output.build = function() {
				output.element = dom("table", container);
				output.element.addClass("gameElements ge-grid");
				var tbody = dom("tbody", output.element);
				var x;
				var y;
				for (y=0;y<options.height;y++) {
					(function(y) {
						output.cells[y] = {};
						var tr = dom("tr", tbody);
						for (x=0;x<options.width;x++) {
							(function(x) {
								var td = dom("td", tr);
									td.css({
										height:	(100/options.height)+"%",
										width:	(100/options.width)+"%"
									});
								output.cells[y][x] = td;
								output.group = output.group.add(td);
							})(x);
						}
					})(y);
				}
			}
			output.build();
			
			output.get = function(x, y) {
				if (output.cells[y] && output.cells[y][x]) {
					return output.cells[y][x];
				}
				return false;
			}
			
			console.log(">>container",container);
			
			output.setSquare = function() {
				var size = {
					container:	{
						width:	container.width(),
						height:	container.height()
					}
				};
				size.div = {
					width:	Math.min(size.container.width,size.container.height),
					height:	Math.min(size.container.width,size.container.height)
				};
				var ratio = {
					container:	size.container.width/size.container.height,
					div:		1
				};
				output.element.css({
					width:	size.div.width,
					height:	size.div.height
				});
				
				// Resize the cells
				output.group.css({
					height:	(size.div.width*(100/options.height)/100)+"px",
					width:	(size.div.width*(100/options.width)/100)+"px"
				});
			}
			
			
			if (options.square) {
				setInterval(function() {
					output.setSquare();
				}, 300);
			}
			
			return output;
		}
	};
	
	// Global scope
	window.gameElements 		= gameElements;
})();