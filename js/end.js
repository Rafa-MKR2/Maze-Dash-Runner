var endState = {

	init: function(data){
		this.score = data.score || 0;
	},

	create: function(){
		// mantendo a estética original do menu
		game.add.text(game.world.centerX, 150, 'GAME OVER', {
			font: '40px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 250, 'COINS: ' + this.score, {
			font: '20px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 350, 'PRESS ENTER TO RESTART', {
			font: '15px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(game.world.centerX, 400, 'PRESS ESC FOR MENU', {
			font: '15px emulogic', fill: '#fff'
		}).anchor.set(.5);

		var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		enterKey.onDown.addOnce(this.restart, this);

		var escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		escKey.onDown.addOnce(this.menu, this);
	},

	restart: function(){
		game.state.start('stage1');
	},

	menu: function(){
		game.state.start('menu');
	}

};
