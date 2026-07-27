var creditsState = {

	create: function(){
		// titulo
		game.add.text(game.world.centerX, 50, 'CREDITOS', {
			font: '36px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		// personagens decorativos correndo pela tela
		this.chaseAnim = ChaseAnimation.create({ y: 120, includeCoin: false });

		// conteudo dos creditos
		var centerX = game.world.centerX;

		game.add.text(centerX, 155, 'MAZE DASH RUNNER', {
			font: '24px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		game.add.text(centerX, 215, 'CRIADO POR', {
			font: '16px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);

		game.add.text(centerX, 250, 'RAFAEL DO CARMO', {
			font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		// moeda decorativa separadora
		var sep = game.add.sprite(centerX, 300, 'coin');
		sep.anchor.set(.5);
		sep.scale.set(1.2);
		sep.smoothed = false;
		sep.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		game.add.text(centerX, 345, '2026 RAFAEL DO CARMO', {
			font: '14px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);

		// voltar com moeda indicadora
		this.txtBack = game.add.text(centerX, 430, 'VOLTAR', {
			font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
		});
		this.txtBack.anchor.set(.5);

		this.menuCoin = game.add.sprite(0, 0, 'coin');
		this.menuCoin.anchor.set(.5);
		this.menuCoin.scale.set(1.1);
		this.menuCoin.smoothed = false;
		this.menuCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.menuCoin.x = game.world.centerX - this.txtBack.width / 2 - 22;
		this.menuCoin.y = this.txtBack.y;
		this.coinBobTime = 0;

		// controles
		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);

		var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);

		// mobile: qualquer toque volta ao menu
		if(GameConfig.isMobile){
			game.input.onDown.addOnce(function(){
				game.state.start('menu');
			}, this);
		}
	},

	update: function(){
		ChaseAnimation.update(this.chaseAnim, false);

		// bobbing da moeda indicadora
		this.coinBobTime += game.time.physicsElapsed * 4;
		this.menuCoin.y = this.txtBack.y + Math.sin(this.coinBobTime) * 3;
	}

};
