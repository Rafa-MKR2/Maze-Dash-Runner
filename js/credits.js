var creditsState = {

	create: function(){
		// titulo
		game.add.text(game.world.centerX, 50, 'CRÉDITOS', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		// personagens decorativos correndo pela tela
		this.createChaseAnimation();

		// conteudo dos creditos
		var centerX = game.world.centerX;

		game.add.text(centerX, 155, 'MAZE DASH RUNNER', {
			font: '24px emulogic', fill: '#fff'
		}).anchor.set(.5);

		game.add.text(centerX, 215, 'CRIADO POR', {
			font: '16px emulogic', fill: '#aaa'
		}).anchor.set(.5);

		game.add.text(centerX, 250, 'RAFAEL DO CARMO', {
			font: '20px emulogic', fill: '#fff'
		}).anchor.set(.5);

		// moeda decorativa separadora
		var sep = game.add.sprite(centerX, 300, 'coin');
		sep.anchor.set(.5);
		sep.scale.set(1.2);
		sep.smoothed = false;
		sep.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		game.add.text(centerX, 345, '© 2026 RAFAEL DO CARMO', {
			font: '14px emulogic', fill: '#aaa'
		}).anchor.set(.5);

		// voltar com moeda indicadora
		this.txtBack = game.add.text(centerX, 430, 'VOLTAR', {
			font: '20px emulogic', fill: '#fff'
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
	},

	// --- personagens decorativos correndo na tela ---
	// goblin persegue o player, às vezes da esquerda pra direita, às vezes da direita pra esquerda

	createChaseAnimation: function(){
		this.chasePlayer = game.add.sprite(0, 120, 'player');
		this.chasePlayer.anchor.set(.5);
		this.chasePlayer.smoothed = false;
		this.chasePlayer.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		this.chasePlayer.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.chasePlayer.speedX = 140;

		this.chaseEnemy = game.add.sprite(0, 120, 'enemy');
		this.chaseEnemy.anchor.set(.5);
		this.chaseEnemy.smoothed = false;
		this.chaseEnemy.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		this.chaseEnemy.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.chaseEnemy.chaseSpeed = 155;

		this.respawnCreditsChase();
	},

	respawnCreditsChase: function(){
		var goRight = Math.random() < 0.5;
		var baseY = 110 + Math.random() * 20;

		if(goRight){
			this.chasePlayer.x = -30;
			this.chasePlayer.speedX = 120 + Math.random() * 40;
			this.chaseEnemy.x = -30 - 60;
			this.chasePlayer.animations.play('runRight');
			this.chaseEnemy.animations.play('runRight');
		} else {
			this.chasePlayer.x = game.width + 30;
			this.chasePlayer.speedX = -(120 + Math.random() * 40);
			this.chaseEnemy.x = game.width + 30 + 60;
			this.chasePlayer.animations.play('runLeft');
			this.chaseEnemy.animations.play('runLeft');
		}

		this.chasePlayer.y = baseY;
		this.chaseEnemy.y = baseY;
	},

	updateChaseAnimation: function(){
		var dt = game.time.physicsElapsed;

		// player corre livremente
		this.chasePlayer.x += this.chasePlayer.speedX * dt;

		// goblin persegue o player — desacelera ao chegar perto
		var dx = this.chasePlayer.x - this.chaseEnemy.x;
		var dy = this.chasePlayer.y - this.chaseEnemy.y;
		var dist = Math.sqrt(dx * dx + dy * dy);

		if(dist > 3){
			var mul = Phaser.Math.clamp(dist / 120, 0.15, 1.0);
			this.chaseEnemy.x += (dx / dist) * this.chaseEnemy.chaseSpeed * dt * mul;
			this.chaseEnemy.y += (dy / dist) * this.chaseEnemy.chaseSpeed * dt * 0.3 * mul;
		}

		// animacao baseada na direcao
		if(this.chasePlayer.speedX > 0){
			this.chasePlayer.animations.play('runRight');
		} else {
			this.chasePlayer.animations.play('runLeft');
		}
		if(dx > 8){
			this.chaseEnemy.animations.play('runRight');
		} else if(dx < -8){
			this.chaseEnemy.animations.play('runLeft');
		}

		// manter dentro da faixa vertical
		this.chasePlayer.y = Phaser.Math.clamp(this.chasePlayer.y, 90, game.height - 30);
		this.chaseEnemy.y = Phaser.Math.clamp(this.chaseEnemy.y, 90, game.height - 30);

		// respawn quando todos saem da tela
		var allOffRight = this.chasePlayer.x > game.width + 50 && this.chaseEnemy.x > game.width + 50;
		var allOffLeft = this.chasePlayer.x < -50 && this.chaseEnemy.x < -50;

		if(allOffRight || allOffLeft){
			this.respawnCreditsChase();
		}
	},

	update: function(){
		// animar personagens decorativos
		this.updateChaseAnimation();

		// bobbing da moeda indicadora
		this.coinBobTime += game.time.physicsElapsed * 4;
		this.menuCoin.y = this.txtBack.y + Math.sin(this.coinBobTime) * 3;
	}

};
