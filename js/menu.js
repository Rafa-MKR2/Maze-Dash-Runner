var menuState = {

	selectedIndex: 0,
	menuCount: 5,
	inputReady: false,

	menuItems: [
		{ label: 'JOGAR',         action: 'play' },
		{ label: 'CONFIGURACOES', action: 'settings' },
		{ label: 'RECORDES',      action: 'records' },
		{ label: 'CRÉDITOS',      action: 'credits' },
		{ label: 'SAIR',          action: 'quit' }
	],

	create: function(){
		SettingsManager.load();
		PlayerData.load();
		this.selectedIndex = 0;
		this.inputReady = false;

		// animacao de fundo
		this.createChaseAnimation();

		// musica do menu
		if(SettingsManager.get('music')){
			if(!window._menuMusic || !window._menuMusic.isPlaying){
				window._menuMusic = game.add.audio('music');
				window._menuMusic.loop = true;
			}
			window._menuMusic.volume = SettingsManager.get('volume') / 100 * 0.5;
			if(!window._menuMusic.isPlaying){
				window._menuMusic.play();
			}
			this.menuMusic = window._menuMusic;
		}

		// titulo
		this.title = game.add.text(game.world.centerX, -50, 'MAZE DASH RUNNER', {
			font: '36px emulogic', fill: '#fff'
		});
		this.title.anchor.set(.5);
		game.add.tween(this.title).to({y: 60}, 800, Phaser.Easing.Quadratic.Out, true);

		// itens do menu
		this.menuTexts = [];
		this.tweensComplete = 0;
		var startY = 170;
		var spacing = 40;

		for(var i = 0; i < this.menuItems.length; i++){
			var txt = game.add.text(game.world.centerX, 550, this.menuItems[i].label, {
				font: '20px emulogic', fill: '#fff'
			});
			txt.anchor.set(.5);
			var delay = 200 + i * 100;
			var tw = game.add.tween(txt).to({y: startY + i * spacing}, 800, Phaser.Easing.Quadratic.Out, true, delay);
			tw.onComplete.add(function(){
				this.tweensComplete++;
				if(this.tweensComplete >= this.menuItems.length){
					this.inputReady = true;
					this.updateCoinPosition();
					this.menuCoin.visible = true;
				}
			}, this);
			this.menuTexts.push(txt);
		}

		// moeda indicadora de selecao
		this.menuCoin = game.add.sprite(0, 0, 'coin');
		this.menuCoin.anchor.set(.5);
		this.menuCoin.scale.set(1.1);
		this.menuCoin.smoothed = false;
		this.menuCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.menuCoin.visible = false;
		this.coinBobTime = 0;

		// controles
		this.cursors = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		// audio unlock
		game.input.onDown.addOnce(function(){
			if(game.sound.context && game.sound.context.state === 'suspended'){
				game.sound.context.resume();
			}
			if(SettingsManager.get('music') && this.menuMusic && !this.menuMusic.isPlaying){
				this.menuMusic.play();
			}
		}, this);
	},

	update: function(){
		this.updateChaseAnimation();

		// bobbing da moeda indicadora
		if(this.menuCoin.visible){
			this.coinBobTime += game.time.physicsElapsed * 4;
			var target = this.menuTexts[this.selectedIndex];
			this.menuCoin.y = target.y + Math.sin(this.coinBobTime) * 3;
		}

		if(!this.inputReady) return;

		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.selectedIndex = (this.selectedIndex - 1 + this.menuCount) % this.menuCount;
			this.updateCoinPosition();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = (this.selectedIndex + 1) % this.menuCount;
			this.updateCoinPosition();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		if(this.enterKey.isDown){
			this.flashSelected();
			this.executeAction();
			Utils.debounce(this, 500);
		}
	},

	executeAction: function(){
		var action = this.menuItems[this.selectedIndex].action;
		switch(action){
			case 'play':
				this.startGame();
				break;
			case 'settings':
				game.state.start('settingsUI');
				break;
			case 'records':
				game.state.start('records');
				break;
			case 'credits':
				game.state.start('credits');
				break;
			case 'quit':
				this.showQuitMessage();
				break;
		}
	},

	showQuitMessage: function(){
		for(var i = 0; i < this.menuTexts.length; i++){
			this.menuTexts[i].visible = false;
		}
		this.menuCoin.visible = false;
		this.title.visible = false;

		if(window._menuMusic){
			window._menuMusic.stop();
			window._menuMusic = null;
		}

		this.quitText = game.add.text(game.world.centerX, game.world.centerY, 'OBRIGADO POR JOGAR!', {
			font: '20px emulogic', fill: '#fff'
		});
		this.quitText.anchor.set(.5);

		game.time.events.add(2000, function(){
			game.state.start('menu');
		}, this);
	},

	updateCoinPosition: function(){
		var target = this.menuTexts[this.selectedIndex];
		this.menuCoin.x = game.world.centerX - target.width / 2 - 22;
		this.menuCoin.y = target.y;
		this.coinBobTime = 0;
	},

	// --- personagens decorativos do menu ---
	// a moeda lidera, o player persegue a moeda, o goblin persegue o player
	// às vezes aparecem da esquerda pra direita, às vezes da direita pra esquerda

	createChaseAnimation: function(){
		// moeda lidera — velocidade constante com leve variacao
		this.chaseCoin = game.add.sprite(0, 145, 'coin');
		this.chaseCoin.anchor.set(.5);
		this.chaseCoin.smoothed = false;
		this.chaseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.chaseCoin.speedX = 180;
		this.chaseCoin.speedY = 0;

		// player persegue a moeda
		this.chasePlayer = game.add.sprite(0, 145, 'player');
		this.chasePlayer.anchor.set(.5);
		this.chasePlayer.smoothed = false;
		this.chasePlayer.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		this.chasePlayer.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.chasePlayer.chaseSpeed = 165;

		// goblin persegue o player
		this.chaseEnemy = game.add.sprite(0, 145, 'enemy');
		this.chaseEnemy.anchor.set(.5);
		this.chaseEnemy.smoothed = false;
		this.chaseEnemy.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		this.chaseEnemy.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.chaseEnemy.chaseSpeed = 180;

		// posicao inicial aleatoria
		this.respawnChaseGroup();
	},

	// respawn em grupo — todos reaparecem juntos na mesma lateral
	respawnChaseGroup: function(){
		var goRight = Math.random() < 0.5;
		var baseSpeed = 150 + Math.random() * 40;

		if(goRight){
			this.chaseCoin.x = -30;
			this.chaseCoin.speedX = baseSpeed;
			this.chasePlayer.x = -30 - 80;
			this.chaseEnemy.x = -30 - 160;
			this.chasePlayer.animations.play('runRight');
			this.chaseEnemy.animations.play('runRight');
		} else {
			this.chaseCoin.x = game.width + 30;
			this.chaseCoin.speedX = -baseSpeed;
			this.chasePlayer.x = game.width + 30 + 80;
			this.chaseEnemy.x = game.width + 30 + 160;
			this.chasePlayer.animations.play('runLeft');
			this.chaseEnemy.animations.play('runLeft');
		}

		var baseY = 100 + Math.random() * 100;
		this.chaseCoin.y = baseY;
		this.chasePlayer.y = baseY;
		this.chaseEnemy.y = baseY;
		this.chaseCoin.speedY = (Math.random() - 0.5) * 30;
	},

	updateChaseAnimation: function(){
		var dt = game.time.physicsElapsed;

		// moeda lidera — movimento livre
		this.chaseCoin.x += this.chaseCoin.speedX * dt;
		this.chaseCoin.y += this.chaseCoin.speedY * dt;

		// player persegue a moeda — desacelera ao chegar perto pra nunca alcançar
		var dxCoin = this.chaseCoin.x - this.chasePlayer.x;
		var dyCoin = this.chaseCoin.y - this.chasePlayer.y;
		var distCoin = Math.sqrt(dxCoin * dxCoin + dyCoin * dyCoin);

		if(distCoin > 3){
			var mul = Phaser.Math.clamp(distCoin / 150, 0.15, 1.0);
			this.chasePlayer.x += (dxCoin / distCoin) * this.chasePlayer.chaseSpeed * dt * mul;
			this.chasePlayer.y += (dyCoin / distCoin) * this.chasePlayer.chaseSpeed * dt * 0.3 * mul;
		}

		// goblin persegue o player — desacelera ao chegar perto
		var dxPlayer = this.chasePlayer.x - this.chaseEnemy.x;
		var dyPlayer = this.chasePlayer.y - this.chaseEnemy.y;
		var distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);

		if(distPlayer > 3){
			var mul2 = Phaser.Math.clamp(distPlayer / 150, 0.15, 1.0);
			this.chaseEnemy.x += (dxPlayer / distPlayer) * this.chaseEnemy.chaseSpeed * dt * mul2;
			this.chaseEnemy.y += (dyPlayer / distPlayer) * this.chaseEnemy.chaseSpeed * dt * 0.3 * mul2;
		}

		// animacao baseada na direcao horizontal
		if(dxCoin > 8){
			this.chasePlayer.animations.play('runRight');
		} else if(dxCoin < -8){
			this.chasePlayer.animations.play('runLeft');
		}
		if(dxPlayer > 8){
			this.chaseEnemy.animations.play('runRight');
		} else if(dxPlayer < -8){
			this.chaseEnemy.animations.play('runLeft');
		}

		// manter dentro da faixa vertical visivel
		this.chaseCoin.y = Phaser.Math.clamp(this.chaseCoin.y, 80, game.height - 30);
		this.chasePlayer.y = Phaser.Math.clamp(this.chasePlayer.y, 80, game.height - 30);
		this.chaseEnemy.y = Phaser.Math.clamp(this.chaseEnemy.y, 80, game.height - 30);

		// todos sairam da tela → respawn em grupo
		var allOffRight = this.chaseCoin.x > game.width + 50 &&
		                   this.chasePlayer.x > game.width + 50 &&
		                   this.chaseEnemy.x > game.width + 50;

		var allOffLeft = this.chaseCoin.x < -50 &&
		                  this.chasePlayer.x < -50 &&
		                  this.chaseEnemy.x < -50;

		if(allOffRight || allOffLeft){
			this.respawnChaseGroup();
		}
	},

	playTick: function(){
		if(!SettingsManager.get('sfx')) return;
		var tick = game.add.audio('getitem');
		tick.volume = 0.2;
		tick.play();
	},

	flashSelected: function(){
		var target = this.menuTexts[this.selectedIndex];
		game.add.tween(target).to({alpha: 0.3}, 50, Phaser.Easing.Linear.None, true, 0, 0, true);
	},

	shutdown: function(){
		// nao parar musica aqui — ela continua para settings/records/credits
	},

	startGame: function(){
		if(window._menuMusic){
			window._menuMusic.stop();
			window._menuMusic = null;
		}
		game.state.start('stage1');
	}

};
