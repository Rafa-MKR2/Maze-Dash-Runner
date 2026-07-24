var recordsState = {

	create: function(){
		PlayerData.load();

		game.add.text(game.world.centerX, 60, 'RECORDES', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		var startY = 160;
		var spacing = 45;

		var lines = [
			{ label: 'MELHOR TEMPO',     value: Utils.formatTime(PlayerData.stats.bestTime) },
			{ label: 'MELHOR PONTUAÇÃO', value: Utils.formatNumber(PlayerData.stats.bestScore, 3) },
			{ label: 'PARTIDAS',         value: Utils.formatNumber(PlayerData.stats.gamesPlayed, 3) },
			{ label: 'MOEDAS TOTAL',     value: Utils.formatNumber(PlayerData.stats.totalCoins, 4) },
			{ label: 'MORTES',           value: Utils.formatNumber(PlayerData.stats.deaths, 3) }
		];

		for(var i = 0; i < lines.length; i++){
			game.add.text(game.world.centerX - 160, startY + i * spacing, lines[i].label, {
				font: '18px emulogic', fill: '#fff'
			});
			game.add.text(game.world.centerX + 160, startY + i * spacing, lines[i].value, {
				font: '18px emulogic', fill: '#fff'
			}).anchor.set(1, 0);
		}

		// voltar
		this.txtBack = game.add.text(game.world.centerX, startY + lines.length * spacing + 40, 'VOLTAR', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtBack.anchor.set(.5);

		this.arrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});
		this.arrow.x = game.world.centerX - this.txtBack.width / 2 - 20;
		this.arrow.y = this.txtBack.y - 8;

		// controles
		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);

		var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);
	}

};
