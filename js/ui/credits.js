var creditsState = {

	create: function(){
		var cx = 375;

		game.add.text(cx, 50, 'CREDITOS', {
			font: '26px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		this.chaseAnim = ChaseAnimation.create({ y: 120, includeCoin: false });

		game.add.text(cx, 170, 'MAZE DASH RUNNER', {
			font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		game.add.text(cx, 220, 'CRIADO POR', {
			font: '12px ' + GameConfig.UI_FONT, fill: '#888'
		}).anchor.set(.5);

		game.add.text(cx, 250, 'RAFAEL DO CARMO', {
			font: '18px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}).anchor.set(.5);

		var sep = game.add.sprite(cx, 300, 'coin');
		sep.anchor.set(.5);
		sep.scale.set(1.2);
		sep.smoothed = false;
		sep.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		game.add.text(cx, 350, '2026 RAFAEL DO CARMO', {
			font: '11px ' + GameConfig.UI_FONT, fill: '#666'
		}).anchor.set(.5);

		this.txtBack = game.add.text(cx, 420, 'VOLTAR', {
			font: '14px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		this.menuCoin = game.add.sprite(320, 420, 'coin');
		this.menuCoin.anchor.set(.5);
		this.menuCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.coinBobTime = 0;

		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);

		var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);

		if(GameConfig.isMobile){
			game.input.onDown.addOnce(function(){
				game.state.start('menu');
			}, this);
		}
	},

	update: function(){
		ChaseAnimation.update(this.chaseAnim, false);

		if(!this.txtBack) return;
		this.coinBobTime += game.time.physicsElapsed * 4;
		this.menuCoin.y = 420 + Math.sin(this.coinBobTime) * 3;
	}

};
