var menuState = {

	selectedIndex: 0,
	menuCount: 5,
	inputReady: false,
	settingsOpen: false,
	enterWasDown: false,

	menuItems: [
		{ label: 'JOGAR',         action: 'play' },
		{ label: 'CONFIGURACOES', action: 'settings' },
		{ label: 'RECORDES',      action: 'records' },
		{ label: 'CREDITOS',      action: 'credits' },
		{ label: 'SAIR',          action: 'quit' }
	],

	create: function(){
		SettingsManager.load();
		PlayerData.load();
		this.selectedIndex = 0;
		this.inputReady = false;
		this.settingsOpen = false;
		this.enterWasDown = false;

		// animacao de fundo - moeda lidera, player persegue, goblin persegue player
		this.chaseAnim = ChaseAnimation.create({ y: 145, includeCoin: true });

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

		// centraliza na tela independente da posição da câmera
		var cx = game.camera.view.centerX;
		var cy = game.camera.view.centerY;

		// titulo
		this.title = game.add.text(cx, -50, 'MAZE DASH RUNNER', {
			font: '36px emulogic', fill: '#fff'
		});
		this.title.anchor.set(.5);
		game.add.tween(this.title).to({y: 60}, 800, Phaser.Easing.Quadratic.Out, true);

		// sincronizar fullscreen quando muda externamente
		if(GameConfig.fullscreenEnabled && GameConfig.fullscreenChange){
			document.addEventListener(GameConfig.fullscreenChange, function(){
				var isFs = !!GameConfig.fullscreenElement();
				SettingsManager.set('fullscreen', isFs);
				if(SettingsOverlay && SettingsOverlay.isOpen){
					SettingsOverlay.updateValues();
				}
			});
		}

		// itens do menu
		this.menuTexts = [];
		this.tweensComplete = 0;
		var startY = 170;
		var spacing = 40;

		for(var i = 0; i < this.menuItems.length; i++){
			var txt = game.add.text(cx, 550, this.menuItems[i].label, {
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

		// controles de teclado (+ touch se mobile)
		var cursorKeys = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		if(GameConfig.isMobile){
			this.cursors = TouchControls.wrapCursorKeys(cursorKeys);
			this.enterKey = TouchControls.wrapKey(this.enterKey, 'enter');
			this.escKey = TouchControls.wrapKey(this.escKey, 'escape');
		} else {
			this.cursors = cursorKeys;
		}

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
		// atualizar controles touch antes de qualquer leitura de input
		TouchControls.update();

		// delega atualizacao para overlay de configuracoes quando aberto
		if(SettingsOverlay.isOpen){
			SettingsOverlay.update();
			return;
		}

		// rastrear estado do ENTER sempre, mesmo quando bloqueado
		var enterDown = this.enterKey.isDown;

		// bloquear input do menu apos fechar overlay para evitar
		// que ENTER residual seja processado como nova selecao
		if(this.settingsOpen){
			// so libera quando usuario soltar ENTER completamente
			if(!enterDown){
				this.settingsOpen = false;
			}
			this.enterWasDown = enterDown;
			return;
		}

		ChaseAnimation.update(this.chaseAnim, true);

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
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = (this.selectedIndex + 1) % this.menuCount;
			this.updateCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		// detectar apenas nova pressao de ENTER (nao segurado)
		var enterJustPressed = enterDown && !this.enterWasDown;
		this.enterWasDown = enterDown;

		if(enterJustPressed){
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
				this.settingsOpen = true;
				SettingsOverlay.open({ returnState: 'menu' });
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

		this.quitText = game.add.text(cx, cy, 'OBRIGADO POR JOGAR!', {
			font: '20px emulogic', fill: '#fff'
		});
		this.quitText.anchor.set(.5);

		game.time.events.add(2000, function(){
			game.state.start('menu');
		}, this);
	},

	updateCoinPosition: function(){
		var target = this.menuTexts[this.selectedIndex];
		this.menuCoin.x = game.camera.view.centerX - target.width / 2 - 22;
		this.menuCoin.y = target.y;
		this.coinBobTime = 0;
	},

	flashSelected: function(){
		var target = this.menuTexts[this.selectedIndex];
		game.add.tween(target).to({alpha: 0.3}, 50, Phaser.Easing.Linear.None, true, 0, 0, true);
	},

	shutdown: function(){
		// nao parar musica aqui - ela continua para settings/records/credits
	},

	startGame: function(){
		if(window._menuMusic){
			window._menuMusic.stop();
			window._menuMusic = null;
		}
		game.state.start('stage1');
	}

};
