var endState = {

	init: function(data){
		this.score = data.score || 0;
		this.time = data.time || null;
		this.thiefScore = data.thiefScore || 0;
		this.reason = data.reason || 'coin';
	},

	create: function(){
		PlayerData.load();

		if(SettingsManager.get('music')){
			this.music = game.add.audio('gameover');
			this.music.volume = SettingsManager.get('volume') / 100 * 0.5;
			this.music.play();
		}

		// centraliza na tela independente da posição da câmera
		var cx = game.camera.view.centerX;
		var cy = game.camera.view.centerY;

		if(this.reason === 'timeout'){
			game.add.text(cx, cy - 180, 'TEMPO ESGOTADO', {
				font: '20px ' + GameConfig.UI_FONT, fill: '#ff4444'
			}).anchor.set(.5);
		} else if(this.reason === 'coin'){
			game.add.text(cx, cy - 180, 'PEGO POR GOBLIN', {
				font: '20px ' + GameConfig.UI_FONT, fill: '#ff4444'
			}).anchor.set(.5);
		}

		game.add.text(cx, cy - 130, 'GAME OVER', {
			font: '36px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		game.add.text(cx, cy - 50, 'MOEDAS: ' + Utils.formatNumber(this.score, 3), {
			font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		// pontuacao (pontuacao por roubo de goblin)
		if(this.thiefScore > 0){
			game.add.text(cx, cy - 10, 'PONTUACAO: ' + Utils.formatNumber(this.thiefScore, 3), {
				font: '18px ' + GameConfig.UI_FONT, fill: '#ffff00'
			}).anchor.set(.5);
		}

		game.add.text(cx, cy + 30, 'TEMPO: ' + Utils.formatTime(this.time), {
			font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		// melhores recordes
		game.add.text(cx, cy + 90, 'MELHOR PONTUACAO: ' + Utils.formatNumber(PlayerData.stats.bestScore, 3), {
			font: '15px ' + GameConfig.UI_FONT, fill: '#aaa'
		}).anchor.set(.5);

		game.add.text(cx, cy + 180, 'ENTER PARA REINICIAR', {
			font: '15px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		game.add.text(cx, cy + 220, 'ESC PARA MENU', {
			font: '15px ' + GameConfig.UI_FONT, fill: '#fff'
		}).anchor.set(.5);

		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(function(){
			game.state.start('game');
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

	shutdown: function(){
		if(this.music) this.music.stop();
	}

};
