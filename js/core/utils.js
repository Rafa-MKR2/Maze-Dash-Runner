var Utils = {

	debounce: function(context, delay){
		context.inputReady = false;
		game.time.events.add(delay || GameConfig.DEBOUNCE_DELAY, function(){
			context.inputReady = true;
		}, context);
	},

	formatTime: function(seconds){
		if(seconds === null || seconds === undefined) return '--:--';
		var m = Math.floor(seconds / 60);
		var s = Math.floor(seconds % 60);
		return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
	},

	formatNumber: function(value, digits){
		var str = value.toString();
		while(str.length < digits) str = '0' + str;
		return str;
	}

};
