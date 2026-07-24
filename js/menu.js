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
					this.updateArrowPosition();
					this.arrow.visible = true;
				}
			}, this);
			this.menuTexts.push(txt);
		}

		// seta de selecao
		this.arrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});
		this.arrow.visible = false;

		// blink tween
		this.blinkTween = game.add.tween(this.menuTexts[0]).to({alpha: 0.3}, 300, Phaser.Easing.Linear.None, true, 0, -1, true);

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
		if(!this.inputReady) return;

		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.selectedIndex = (this.selectedIndex - 1 + this.menuCount) % this.menuCount;
			this.updateArrowPosition();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = (this.selectedIndex + 1) % this.menuCount;
			this.updateArrowPosition();
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
		this.arrow.visible = false;
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

	updateArrowPosition: function(){
		var target = this.menuTexts[this.selectedIndex];
		this.arrow.x = game.world.centerX - target.width / 2 - 20;
		this.arrow.y = target.y - 12;

		// blink no item selecionado
		if(this.blinkTween) this.blinkTween.stop();
		for(var i = 0; i < this.menuTexts.length; i++){
			this.menuTexts[i].alpha = 1;
		}
		this.blinkTween = game.add.tween(target).to({alpha: 0.3}, 300, Phaser.Easing.Linear.None, true, 0, -1, true);
	},

	createChaseAnimation: function(){
		this.chaseGap = 60;
		this.chaseSpeed = 180;
		this.chaseTrack = game.width + 60 + this.chaseGap * 2;

		this.chaseCoin = game.add.sprite(-30, 145, 'coin');
		this.chaseCoin.anchor.set(.5);
		this.chaseCoin.smoothed = false;
		this.chaseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		this.chasePlayer = game.add.sprite(-30 - this.chaseGap, 145, 'player');
		this.chasePlayer.anchor.set(.5);
		this.chasePlayer.smoothed = false;
		this.chasePlayer.animations.add('run', [24,25,26,27,28,29,30,31], 12, true).play();

		this.chaseEnemy = game.add.sprite(-30 - this.chaseGap * 2, 145, 'enemy');
		this.chaseEnemy.anchor.set(.5);
		this.chaseEnemy.smoothed = false;
		this.chaseEnemy.animations.add('run', [24,25,26,27,28,29,30,31], 12, true).play();
	},

	updateChaseAnimation: function(){
		var speed = this.chaseSpeed * game.time.physicsElapsed;

		this.chaseCoin.x += speed;
		this.chasePlayer.x += speed;
		this.chaseEnemy.x += speed;

		if(this.chaseCoin.x > game.width + 30){
			this.chaseCoin.x -= this.chaseTrack;
		}
		if(this.chasePlayer.x > game.width + 30){
			this.chasePlayer.x -= this.chaseTrack;
		}
		if(this.chaseEnemy.x > game.width + 30){
			this.chaseEnemy.x -= this.chaseTrack;
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
