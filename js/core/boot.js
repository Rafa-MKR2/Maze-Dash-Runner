var bootState = {

	preload: function(){
		game.load.image('progressBar', 'img/progressBar.png');
	},

	create: function(){
		// detectar tipo de dispositivo
		GameConfig.isMobile = Utils.isMobileDevice();

		// detectar Fullscreen API (com suporte a prefixos)
		var doc = document.documentElement;
		if(doc.requestFullscreen){
			GameConfig.fullscreenEnabled = true;
			GameConfig.requestFullscreen = function(){ doc.requestFullscreen(); };
			GameConfig.exitFullscreen = function(){ document.exitFullscreen(); };
			GameConfig.fullscreenElement = function(){ return document.fullscreenElement; };
			GameConfig.fullscreenChange = 'fullscreenchange';
		} else if(doc.webkitRequestFullscreen){
			GameConfig.fullscreenEnabled = true;
			GameConfig.requestFullscreen = function(){ doc.webkitRequestFullscreen(); };
			GameConfig.exitFullscreen = function(){ document.webkitExitFullscreen(); };
			GameConfig.fullscreenElement = function(){ return document.webkitFullscreenElement; };
			GameConfig.fullscreenChange = 'webkitfullscreenchange';
		} else if(doc.mozRequestFullScreen){
			GameConfig.fullscreenEnabled = true;
			GameConfig.requestFullscreen = function(){ doc.mozRequestFullScreen(); };
			GameConfig.exitFullscreen = function(){ document.mozCancelFullScreen(); };
			GameConfig.fullscreenElement = function(){ return document.mozFullScreenElement; };
			GameConfig.fullscreenChange = 'mozfullscreenchange';
		}

		// configurar escala conforme dispositivo
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		if(GameConfig.isMobile){
			// mobile: ocupar tela inteira sem margens
			game.scale.maxWidth = window.innerWidth;
			game.scale.maxHeight = window.innerHeight;
		} else {
			// desktop: margens para caber na janela
			game.scale.maxWidth = window.innerWidth - 60;
			game.scale.maxHeight = window.innerHeight - 60;
		}

		game.scale.pageAlignHorizontally = false;
		game.scale.pageAlignVertically = false;
		game.antialias = false;

		// suporte a multitouch (4 ponteiros simultaneos)
		game.input.maxPointers = 4;

		// aplicar fullscreen salvo (desktop apenas)
		if(!GameConfig.isMobile && GameConfig.fullscreenEnabled){
			SettingsManager.load();
			if(SettingsManager.get('fullscreen')){
				GameConfig.requestFullscreen();
			}
		}

		game.state.start('load');
	}

};
