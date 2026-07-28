var recordsState = {

	create: function(){
		PlayerData.load();

		var cx = 375;

		game.add.text(cx, 50, 'RECORDES', {
			font: '26px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		game.add.text(cx, 150, 'PONTUACAO', {
			font: '12px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);
		game.add.text(cx, 172, Utils.formatNumber(PlayerData.stats.bestScore, 3), {
			font: '18px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}).anchor.set(.5);

		game.add.text(cx, 220, 'TEMPO', {
			font: '12px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);
		game.add.text(cx, 242, Utils.formatTime(PlayerData.stats.bestTime), {
			font: '18px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}).anchor.set(.5);

		game.add.text(cx, 290, 'NIVEIS', {
			font: '12px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);
		game.add.text(cx, 312, Utils.formatNumber(PlayerData.stats.levelsCompleted, 3), {
			font: '18px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}).anchor.set(.5);

		this.txtBack = game.add.text(cx, 390, 'VOLTAR', {
			font: '14px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		this.menuCoin = game.add.sprite(320, 3850, 'coin');
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
		if(!this.txtBack) return;
		this.coinBobTime += game.time.physicsElapsed * 4;
		this.menuCoin.y = 390 + Math.sin(this.coinBobTime) * 3;
	}

};
