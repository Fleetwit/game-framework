(function() {
	var countdown = function(options) {
		this.t				= 10;
		this.refreshRate 	= 333;	// ~3Hz
		this.options		= _.extend({
			update:	function() {},
			end:	function() {}
		},options);
	};
	countdown.prototype.set = function(sec) {
		this.t = sec;
		this.options.update(sec);
	};
	countdown.prototype.start = function() {
		var scope	= this;
		
		this.previous 	= false;
		
		this.startTime 	= new Date();
		this.endTime 	= new Date(new Date().getTime()+this.t*1000);
		this.timer		= setInterval(function() {
			var left 		= scope.endTime-new Date().getTime();
			var sec 		= Math.round(left/1000);
			if (sec <= 0) {
				scope.stop();
				scope.options.end();
			}
			if (sec != scope.previous) {
				scope.previous = sec;
				scope.options.update(sec);
			}
		}, this.refreshRate);
	};
	countdown.prototype.stop = function() {
		clearInterval(this.timer);
	};
	
	window.gf_countdown = countdown;
})();