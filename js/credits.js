var creditsState = {

	create: function(){
		game.add.text(game.world.centerX, 60, 'CRÉDITOS', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		var startY = 150;
		var spacing = 40;

		var lines = [
			{ text: 'MAZE DASH RUNNER',   font: '24px emulogic' },
			{ text: '',                    font: '10px emulogic' },
			{ text: 'DESENVOLVIDO POR',   font: '16px emulogic' },
			{ text: 'RAFAEL',             font: '20px emulogic' },
			{ text: '',                    font: '10px emulogic' },
			{ text: 'PHASER 2 - CE',      font: '16px emulogic' },
			{ text: 'FONTE EMULOGIC',     font: '16px emulogic' }
		];

		for(var i = 0; i < lines.length; i++){
			if(lines[i].text === '') continue;
			game.add.text(game.world.centerX, startY + i * spacing, lines[i].text, {
				font: lines[i].font, fill: '#fff'
			}).anchor.set(.5);
		}

		// voltar
		var backY = startY + lines.length * spacing + 30;
		this.txtBack = game.add.text(game.world.centerX, backY, 'VOLTAR', {
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
