var loadState = {

	preload: function(){
		var txtloading = game.add.text(game.world.centerX, 150, 'LOADING...', {
			font: '40px emulogic', fill: '#fff'
		});
		txtloading.anchor.set(.5);

		var progressBar = game.add.sprite(game.world.centerX, 250, 'progressBar');
		progressBar.anchor.set(.5);
		game.load.setPreloadSprite(progressBar);

		game.load.image('bg', 'img/bg.png');
		game.load.image('block', 'img/block.png');
		game.load.image('end', 'img/end.png');
		game.load.image('part', 'img/part.png');

		game.load.spritesheet('coin', 'img/coin.png', 32, 32);
		game.load.spritesheet('enemy', 'img/enemy.png', 24, 40);
		game.load.spritesheet('player', 'img/player.png', 24, 32);

		// controles touch
		game.load.image('joy_pad', 'joysticks/joystick_default/joystick_polygon_pad_a.png');
		game.load.image('joy_nub', 'joysticks/joystick_default/joystick_polygon_nub_b.png');
		game.load.image('btn_circle', 'joysticks/joystick_default/button_circle.png');
		game.load.image('btn_square', 'joysticks/joystick_default/button_square.png');
		game.load.image('btn_wide', 'joysticks/joystick_default/button_circle_wide.png');

		game.load.audio('getitem', 'sfx/getitem.ogg');
		game.load.audio('loseitem', 'sfx/loseitem.ogg');
		game.load.audio('music', 'sfx/menu.wav');
		game.load.audio('music1', 'sfx/stage1.wav');

		game.physics.startSystem(Phaser.Physics.ARCADE);
	},

	create: function(){
		game.state.start('menu');
	}

};
