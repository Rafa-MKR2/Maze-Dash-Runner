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
		game.load.audio('fatigue', 'sfx/sound_effects/fatigue.ogg');
		game.load.audio('music', 'sfx/menu_music.ogg');
		game.load.audio('music1', 'sfx/Lunar Joyride v0.7 .mp3');
		game.load.audio('gameover', 'sfx/Miss (Jingle)-gameover.mp3');

		game.load.spritesheet('key', 'img/keyIcons.png', 32, 32);
		game.load.spritesheet('door', 'img/door.png', 50, 50);
		game.load.audio('win', 'sfx/ win-level.ogg');

		// ground tiles - chão do labirinto preenchido dinamicamente
		game.load.image('ground_grass00', 'img/grounds_tilesets/ground_grass/ground_grass00.png');
		game.load.image('ground_grass01', 'img/grounds_tilesets/ground_grass/ground_grass01.png');
		game.load.image('ground_grass02', 'img/grounds_tilesets/ground_grass/ground_grass02.png');
		game.load.image('ground_grass03', 'img/grounds_tilesets/ground_grass/ground_grass03.png');

		game.physics.startSystem(Phaser.Physics.ARCADE);
	},

	create: function(){
		// inicializar controles touch agora que os sprites estao carregados
		TouchControls.create();

		game.state.start('menu');
	}

};
