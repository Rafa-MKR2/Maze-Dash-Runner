var recordsState = {

	create: function(){
		PlayerData.load();

		game.add.text(game.world.centerX, 60, 'RECORDES', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		var startY = 10;
		var spacing = 60;

		var lines = [
			{ label: 'MELHOR TEMPO',     value: Utils.formatTime(PlayerData.stats.bestTime) },
			{ label: 'MELHOR PONTUACAO', value: Utils.formatNumber(PlayerData.stats.bestScore, 3) },
			{ label: 'PARTIDAS',         value: Utils.formatNumber(PlayerData.stats.gamesPlayed, 3) },
			{ label: 'MOEDAS TOTAL',     value: Utils.formatNumber(PlayerData.stats.totalCoins, 4) },
			{ label: 'MORTES',           value: Utils.formatNumber(PlayerData.stats.deaths, 3) }
		];

		for(var i = 0; i < lines.length; i++){
			game.add.text(30, startY + i * spacing, lines[i].label, {
				font: '18px emulogic', fill: '#fff'
			});
			game.add.text(game.width - 30, startY + i * spacing, lines[i].value, {
				font: '18px emulogic', fill: '#fff'
			}).anchor.set(1, 0);
		}

		// voltar
		this.txtBack = game.add.text(game.world.centerX, startY + lines.length * spacing + 40, 'VOLTAR', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtBack.anchor.set(.5);

		// moeda indicadora
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
		// bobbing da moeda indicadora
		this.coinBobTime += game.time.physicsElapsed * 4;
		this.menuCoin.y = this.txtBack.y + Math.sin(this.coinBobTime) * 3;
	}

};
