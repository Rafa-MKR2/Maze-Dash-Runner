var menuState = {

	settings: { music: true, sfx: true },
	selectedIndex: 0,
	settingsMode: false,
	settingsIndex: 0,
	inputReady: false,

	create: function(){
		this.loadSettings();
		this.selectedIndex = 0;
		this.settingsMode = false;
		this.settingsIndex = 0;
		this.inputReady = false;

		// animacao de fundo - perseguição estilo pac-man
		this.createChaseAnimation();

		// musica do menu
		if(this.settings.music){
			this.menuMusic = game.add.audio('music');
			this.menuMusic.loop = true;
			this.menuMusic.volume = .5;
			this.menuMusic.play();
		}

		// titulo - entra descendo
		this.title = game.add.text(game.world.centerX, -50, 'MAZE DASH RUNNER', {
			font: '36px emulogic', fill: '#fff'
		});
		this.title.anchor.set(.5);
		game.add.tween(this.title).to({y: 80}, 800, Phaser.Easing.Quadratic.Out, true);

		// enter the maze - entra subindo
		this.txtPressStart = game.add.text(game.world.centerX, 550, 'ENTER THE MAZE', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtPressStart.anchor.set(.5);
		var tweenPressStart = game.add.tween(this.txtPressStart).to({y: 270}, 800, Phaser.Easing.Quadratic.Out, true, 200);

		// settings - entra subindo (ultima tween)
		this.txtSettings = game.add.text(game.world.centerX, 600, 'SETTINGS', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtSettings.anchor.set(.5);
		var tweenSettings = game.add.tween(this.txtSettings).to({y: 330}, 800, Phaser.Easing.Quadratic.Out, true, 400);

		// indicador de selecao (criado invisivel)
		this.arrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});
		this.arrow.visible = false;

		// habilitar input somente apos a ultima tween
		tweenSettings.onComplete.add(function(){
			this.inputReady = true;
			this.arrow.visible = true;
			this.updateArrowPosition();
		}, this);

		// efeito de blink no "ENTER THE MAZE"
		this.blinkTween = game.add.tween(this.txtPressStart).to({alpha: 0.3}, 300, Phaser.Easing.Linear.None, true, 0, -1, true);

		// --- elementos do settings (inicialmente ocultos) ---

		this.settingsTitle = game.add.text(game.world.centerX, 80, 'SETTINGS', {
			font: '36px emulogic', fill: '#fff'
		});
		this.settingsTitle.anchor.set(.5);
		this.settingsTitle.visible = false;

		this.txtMusic = game.add.text(game.world.centerX, 200, '', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtMusic.anchor.set(.5);
		this.txtMusic.visible = false;

		this.txtSfx = game.add.text(game.world.centerX, 260, '', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtSfx.anchor.set(.5);
		this.txtSfx.visible = false;

		this.txtBack = game.add.text(game.world.centerX, 340, 'BACK', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtBack.anchor.set(.5);
		this.txtBack.visible = false;

		this.settingsArrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});
		this.settingsArrow.visible = false;

		// controles
		this.cursors = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		// garantir que audio funcione apos interacao do usuario
		game.input.onDown.addOnce(function(){
			if(game.sound.context && game.sound.context.state === 'suspended'){
				game.sound.context.resume();
			}
			if(this.settings.music && this.menuMusic && !this.menuMusic.isPlaying){
				this.menuMusic.play();
			}
		}, this);
	},

	update: function(){
		this.updateChaseAnimation();

		if(!this.inputReady) return;

		if(this.settingsMode){
			this.updateSettings();
		} else {
			this.updateMenu();
		}
	},

	updateMenu: function(){
		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.selectedIndex = 0;
			this.updateArrowPosition();
			this.playTick();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = 1;
			this.updateArrowPosition();
			this.playTick();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		}

		if(this.enterKey.isDown){
			this.flashSelected();
			if(this.selectedIndex === 0){
				this.startGame();
			} else {
				this.openSettings();
			}
			this.inputReady = false;
			game.time.events.add(500, function(){ this.inputReady = true; }, this);
		}
	},

	updateSettings: function(){
		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.settingsIndex = (this.settingsIndex + 2) % 3;
			this.updateSettingsArrow();
			this.playTick();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.settingsIndex = (this.settingsIndex + 1) % 3;
			this.updateSettingsArrow();
			this.playTick();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		}

		if(this.settingsIndex === 0){
			if(this.cursors.left.isDown){
				if(this.settings.music){
					this.settings.music = false;
					this.updateSettingsText();
					this.saveSettings();
					this.applyMusicSettings();
				}
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			} else
			if(this.cursors.right.isDown){
				if(!this.settings.music){
					this.settings.music = true;
					this.updateSettingsText();
					this.saveSettings();
					this.applyMusicSettings();
				}
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			}
		} else
		if(this.settingsIndex === 1){
			if(this.cursors.left.isDown){
				if(this.settings.sfx){
					this.settings.sfx = false;
					this.updateSettingsText();
					this.saveSettings();
				}
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			} else
			if(this.cursors.right.isDown){
				if(!this.settings.sfx){
					this.settings.sfx = true;
					this.updateSettingsText();
					this.saveSettings();
					this.applySfxFeedback();
				}
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			}
		}

		if(this.enterKey.isDown && this.settingsIndex === 2){
			this.flashSelectedSettings();
			this.closeSettings();
			this.inputReady = false;
			game.time.events.add(500, function(){ this.inputReady = true; }, this);
		}

		if(this.escKey.isDown){
			this.closeSettings();
			this.inputReady = false;
			game.time.events.add(500, function(){ this.inputReady = true; }, this);
		}
	},

	updateArrowPosition: function(){
		var y = this.selectedIndex === 0 ? 270 : 330;
		var target = this.selectedIndex === 0 ? this.txtPressStart : this.txtSettings;
		this.arrow.x = game.world.centerX - target.width / 2 - 20;
		this.arrow.y = y - 12;

		// blink so no item selecionado
		if(this.selectedIndex === 0){
			this.txtPressStart.alpha = 1;
			if(!this.blinkTween.isRunning) this.blinkTween.start();
		} else {
			this.blinkTween.stop();
			this.txtPressStart.alpha = 1;
		}
	},

	updateSettingsArrow: function(){
		var positions = [190, 250, 330];
		this.settingsArrow.x = game.world.centerX - 130;
		this.settingsArrow.y = positions[this.settingsIndex];
	},

	updateSettingsText: function(){
		this.txtMusic.text = 'MUSIC: ' + (this.settings.music ? 'ON' : 'OFF');
		this.txtSfx.text = 'SFX: ' + (this.settings.sfx ? 'ON' : 'OFF');
	},

	openSettings: function(){
		this.settingsMode = true;
		this.settingsIndex = 0;

		this.blinkTween.stop();
		this.txtPressStart.alpha = 1;
		this.title.visible = false;
		this.txtPressStart.visible = false;
		this.txtSettings.visible = false;
		this.arrow.visible = false;

		this.settingsTitle.visible = true;
		this.txtMusic.visible = true;
		this.txtSfx.visible = true;
		this.txtBack.visible = true;
		this.settingsArrow.visible = true;

		this.updateSettingsText();
		this.updateSettingsArrow();
	},

	closeSettings: function(){
		this.settingsMode = false;

		this.settingsTitle.visible = false;
		this.txtMusic.visible = false;
		this.txtSfx.visible = false;
		this.txtBack.visible = false;
		this.settingsArrow.visible = false;

		this.title.visible = true;
		this.txtPressStart.visible = true;
		this.txtSettings.visible = true;
		this.arrow.visible = true;

		this.updateArrowPosition();
	},

	createChaseAnimation: function(){
		this.chaseGap = 60;
		this.chaseSpeed = 180;
		this.chaseTrack = game.width + 60 + this.chaseGap * 2;

		this.chaseCoin = game.add.sprite(-30, 165, 'coin');
		this.chaseCoin.anchor.set(.5);
		this.chaseCoin.smoothed = false;
		this.chaseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		this.chasePlayer = game.add.sprite(-30 - this.chaseGap, 165, 'player');
		this.chasePlayer.anchor.set(.5);
		this.chasePlayer.smoothed = false;
		this.chasePlayer.animations.add('run', [24,25,26,27,28,29,30,31], 12, true).play();

		this.chaseEnemy = game.add.sprite(-30 - this.chaseGap * 2, 165, 'enemy');
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
		if(!this.settings.sfx) return;
		var tick = game.add.audio('getitem');
		tick.volume = 0.2;
		tick.play();
	},

	flashSelected: function(){
		var target = this.selectedIndex === 0 ? this.txtPressStart : this.txtSettings;
		game.add.tween(target).to({alpha: 0.3}, 50, Phaser.Easing.Linear.None, true, 0, 0, true);
	},

	flashSelectedSettings: function(){
		game.add.tween(this.txtBack).to({alpha: 0.3}, 50, Phaser.Easing.Linear.None, true, 0, 0, true);
	},

	applyMusicSettings: function(){
		if(this.settings.music){
			if(!this.menuMusic){
				this.menuMusic = game.add.audio('music');
				this.menuMusic.loop = true;
				this.menuMusic.volume = .5;
			}
			this.menuMusic.play();
		} else {
			if(this.menuMusic){
				this.menuMusic.stop();
			}
		}
	},

	applySfxFeedback: function(){
		var snd = game.add.audio('getitem');
		snd.volume = .5;
		snd.play();
	},

	shutdown: function(){
		if(this.menuMusic){
			this.menuMusic.stop();
		}
	},

	startGame: function(){
		if(this.menuMusic){
			this.menuMusic.stop();
		}
		game.state.start('stage1');
	},

	loadSettings: function(){
		try {
			var saved = localStorage.getItem('mazeDashSettings');
			if(saved){
				this.settings = JSON.parse(saved);
			}
		} catch(e){
			this.settings = { music: true, sfx: true };
		}
	},

	saveSettings: function(){
		localStorage.setItem('mazeDashSettings', JSON.stringify(this.settings));
	}

};
