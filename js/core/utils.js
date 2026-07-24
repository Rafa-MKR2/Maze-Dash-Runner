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
	},

	// detecta se o dispositivo e mobile (tablet ou celular)
	// suporta forcar modo mobile via URL: ?mobile
	isMobileDevice: function(){
		// forcar via URL para teste
		if(window.location.search.indexOf('mobile') !== -1) return true;

		var ua = navigator.userAgent;
		// user agent
		if(/android|iphone|ipad|ipod|mobile|tablet|opera mini|iemobile/i.test(ua)) return true;
		// capacidade de toque
		if('ontouchstart' in window || navigator.maxTouchPoints > 0) return true;
		// tela estreita (fallback para emuladores)
		if(window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) return true;
		return false;
	}

};
