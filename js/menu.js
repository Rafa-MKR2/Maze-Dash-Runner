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
			font: '40px emulogic', fill: '#fff'
		});
		this.title.anchor.set(.5);
		game.add.tween(this.title).to({y: 150}, 800, Phaser.Easing.Quadratic.Out, true);

		// press enter - entra subindo
		this.txtPressStart = game.add.text(game.world.centerX, 550, 'PRESS ENTER', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtPressStart.anchor.set(.5);
		game.add.tween(this.txtPressStart).to({y: 250}, 800, Phaser.Easing.Quadratic.Out, true, 200);

		// settings - entra subindo
		this.txtSettings = game.add.text(game.world.centerX, 600, 'SETTINGS', {
			font: '20px emulogic', fill: '#fff'
		});
		this.txtSettings.anchor.set(.5);
		game.add.tween(this.txtSettings).to({y: 320}, 800, Phaser.Easing.Quadratic.Out, true, 400);

		// indicador de selecao
		this.arrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});
		this.updateArrowPosition();

		// --- elementos do settings (inicialmente ocultos) ---

		this.settingsTitle = game.add.text(game.world.centerX, 100, 'SETTINGS', {
			font: '40px emulogic', fill: '#fff'
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

		// entrada retardada
		game.time.events.add(1000, function(){
			this.inputReady = true;
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
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = 1;
			this.updateArrowPosition();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		}

		if(this.enterKey.isDown){
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
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.settingsIndex = (this.settingsIndex + 1) % 3;
			this.updateSettingsArrow();
			this.inputReady = false;
			game.time.events.add(200, function(){ this.inputReady = true; }, this);
		}

		if(this.settingsIndex === 0){
			if(this.cursors.left.isDown){
				this.settings.music = false;
				this.updateSettingsText();
				this.saveSettings();
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			} else
			if(this.cursors.right.isDown){
				this.settings.music = true;
				this.updateSettingsText();
				this.saveSettings();
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			}
		} else
		if(this.settingsIndex === 1){
			if(this.cursors.left.isDown){
				this.settings.sfx = false;
				this.updateSettingsText();
				this.saveSettings();
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			} else
			if(this.cursors.right.isDown){
				this.settings.sfx = true;
				this.updateSettingsText();
				this.saveSettings();
				this.inputReady = false;
				game.time.events.add(200, function(){ this.inputReady = true; }, this);
			}
		}

		if(this.enterKey.isDown && this.settingsIndex === 2){
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
		var y = this.selectedIndex === 0 ? 250 : 320;
		this.arrow.x = game.world.centerX - 110;
		this.arrow.y = y;
	},

	updateSettingsArrow: function(){
		var positions = [200, 260, 340];
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
		// moeda
		this.chaseCoin = game.add.sprite(-30, 430, 'coin');
		this.chaseCoin.anchor.set(.5);
		this.chaseCoin.scale.set(0.6);
		this.chaseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.chaseCoinSpeed = 40;

		// personagem
		this.chasePlayer = game.add.sprite(-80, 430, 'player');
		this.chasePlayer.anchor.set(.5);
		this.chasePlayer.scale.set(0.6);
		this.chasePlayer.animations.add('run', [24,25,26,27,28,29,30,31], 12, true).play();
		this.chasePlayerSpeed = 60;

		// inimigo
		this.chaseEnemy = game.add.sprite(-130, 430, 'enemy');
		this.chaseEnemy.anchor.set(.5);
		this.chaseEnemy.scale.set(0.6);
		this.chaseEnemy.animations.add('run', [24,25,26,27,28,29,30,31], 12, true).play();
		this.chaseEnemySpeed = 80;
	},

	updateChaseAnimation: function(){
		this.chaseCoin.x += this.chaseCoinSpeed * game.time.physicsElapsed;
		if(this.chaseCoin.x > game.width + 30){
			this.chaseCoin.x = -30;
		}

		this.chasePlayer.x += this.chasePlayerSpeed * game.time.physicsElapsed;
		if(this.chasePlayer.x > game.width + 30){
			this.chasePlayer.x = -30;
		}

		this.chaseEnemy.x += this.chaseEnemySpeed * game.time.physicsElapsed;
		if(this.chaseEnemy.x > game.width + 30){
			this.chaseEnemy.x = -30;
		}
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
