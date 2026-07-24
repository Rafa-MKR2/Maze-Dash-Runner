var bootState = {

	preload: function(){
		game.load.image('progressBar', 'img/progressBar.png');
	},

	create: function(){
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.maxWidth = window.innerWidth - 60;
		game.scale.maxHeight = window.innerHeight - 60;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.antialias = false;

		game.state.start('load');
	}

};
