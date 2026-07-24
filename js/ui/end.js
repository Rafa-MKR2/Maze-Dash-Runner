var endState = {

	init: function(data){
		this.score = data.score || 0;
		this.time = data.time || null;
	},

	create: function(){
		PlayerData.load();

		game.add.text(game.world.centerX, 120, 'GAME OVER', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 200, 'MOEDAS: ' + Utils.formatNumber(this.score, 3), {
			font: '20px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 245, 'TEMPO: ' + Utils.formatTime(this.time), {
			font: '20px emulogic', fill: '#fff'
		}).anchor.set(.5);

		// melhores recordes
		game.add.text(game.world.centerX, 310, 'MELHOR PONTUACAO: ' + Utils.formatNumber(PlayerData.stats.bestScore, 3), {
			font: '15px emulogic', fill: '#aaa'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 340, 'MELHOR TEMPO: ' + Utils.formatTime(PlayerData.stats.bestTime), {
			font: '15px emulogic', fill: '#aaa'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 400, 'ENTER PARA REINICIAR', {
			font: '15px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 440, 'ESC PARA MENU', {
			font: '15px emulogic', fill: '#fff'
		}).anchor.set(.5);

		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(function(){
			game.state.start('stage1');
		}, this);

		var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escKey.onDown.addOnce(function(){
			game.state.start('menu');
		}, this);
	}

};
