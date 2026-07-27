// PauseUI - responsavel por todo o sistema de pausa e confirmacao de reinicio.
// Recebe callbacks para cada acao (continuar, reiniciar, voltar ao menu).
// A Stage define o que cada acao faz - o UI nao toma decisoes de gameplay.
var PauseUI = {

	isPaused: false,
	confirmActive: false,
	inputReady: false,

	// referencias de sprites e textos
	pauseGroup: null,
	confirmGroup: null,
	pauseTexts: [],
	confirmTexts: [],
	pauseCoin: null,
	confirmCoin: null,
	pauseIndex: 0,
	confirmIndex: 0,
	pauseCoinBobTime: 0,
	confirmCoinBobTime: 0,
	escKey2: null,

	// callbacks definidos pela Stage
	onResume: null,
	onRestart: null,
	onQuit: null,

	// cria os overlays de pausa e confirmacao
	// callbacks: { onResume, onRestart, onQuit }
	create: function(callbacks){
		this.onResume = callbacks.onResume || function(){};
		this.onRestart = callbacks.onRestart || function(){};
		this.onQuit = callbacks.onQuit || function(){};
		this.isPaused = false;
		this.confirmActive = false;

		this.createPauseOverlay();
		this.createRestartConfirm();
	},

	createPauseOverlay: function(){
		this.pauseGroup = game.add.group();
		this.pauseGroup.visible = false;
		this.pauseGroup.fixedToCamera = true;

		var bg = game.add.graphics(0, 0, this.pauseGroup);
		bg.beginFill(0x000000, 0.6);
		bg.drawRect(0, 0, game.width, game.height);
		bg.endFill();

		var cx = game.width / 2;
		game.add.text(cx, 100, 'PAUSADO', {
			font: '36px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.pauseGroup).anchor.set(.5);

		var pauseOptions = ['CONTINUAR', 'REINICIAR', 'CONFIGURACOES', 'VOLTAR AO MENU'];
		this.pauseTexts = [];
		var startY = 200;
		var spacing = 50;
		for(var i = 0; i < pauseOptions.length; i++){
			var txt = game.add.text(cx, startY + i * spacing, pauseOptions[i], {
				font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
			}, this.pauseGroup);
			txt.anchor.set(.5);
			this.pauseTexts.push(txt);
		}

		this.pauseCoin = game.add.sprite(0, 0, 'coin', null, this.pauseGroup);
		this.pauseCoin.anchor.set(.5);
		this.pauseCoin.scale.set(1.0);
		this.pauseCoin.smoothed = false;
		this.pauseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.pauseCoin.visible = false;

		this.escKey2 = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		if(GameConfig.isMobile){
			this.escKey2 = TouchControls.wrapKey(this.escKey2, 'escape');
		}
	},

	createRestartConfirm: function(){
		this.confirmGroup = game.add.group();
		this.confirmGroup.visible = false;
		this.confirmGroup.fixedToCamera = true;

		var bg = game.add.graphics(0, 0, this.confirmGroup);
		bg.beginFill(0x000000, 0.75);
		bg.drawRect(0, 0, game.width, game.height);
		bg.endFill();

		var cx = game.width / 2;
		game.add.text(cx, 170, 'REINICIAR FASE?', {
			font: '24px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.confirmGroup).anchor.set(.5);

		var confirmOptions = ['SIM', 'NAO'];
		this.confirmTexts = [];
		var startY = 260;
		var spacing = 50;
		for(var i = 0; i < confirmOptions.length; i++){
			var txt = game.add.text(cx, startY + i * spacing, confirmOptions[i], {
				font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
			}, this.confirmGroup);
			txt.anchor.set(.5);
			this.confirmTexts.push(txt);
		}

		this.confirmCoin = game.add.sprite(0, 0, 'coin', null, this.confirmGroup);
		this.confirmCoin.anchor.set(.5);
		this.confirmCoin.scale.set(1.0);
		this.confirmCoin.smoothed = false;
		this.confirmCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.confirmCoin.visible = false;
	},

	// ativa a pausa - chamada pela Stage quando ESC e pressionado
	pause: function(player, enemies){
		this.isPaused = true;
		this.inputReady = false;
		this.pauseGroup.visible = true;
		this.pauseIndex = 0;
		this.confirmActive = false;
		this.confirmGroup.visible = false;
		this.updatePauseCoinPosition();

		// parar movimento e animacoes do player
		if(player){
			player.body.velocity.x = 0;
			player.body.velocity.y = 0;
			player.animations.stop();
		}
		// parar movimento e animacoes dos inimigos
		if(enemies){
			for(var i = 0; i < enemies.length; i++){
				enemies[i].body.velocity.x = 0;
				enemies[i].body.velocity.y = 0;
				enemies[i].animations.stop();
			}
		}

		AudioManager.pause();

		game.time.events.add(300, function(){ this.inputReady = true; }, this);
	},

	// retoma o jogo
	resume: function(){
		this.isPaused = false;
		this.pauseGroup.visible = false;
		this.confirmActive = false;
		this.confirmGroup.visible = false;
		this.onResume();
	},

	// chamado pela Stage a cada frame quando pausado
	update: function(controls){
		// delega para overlay de configuracoes quando aberto
		if(SettingsOverlay.isOpen){
			SettingsOverlay.update();
			return;
		}

		if(this.confirmActive){
			this.updateConfirmInput(controls);
		} else {
			this.updatePauseInput(controls);
		}
		this.updateBobbing();
	},

	updatePauseInput: function(controls){
		if(!this.inputReady) return;

		if(controls.up.isDown){
			this.pauseIndex = (this.pauseIndex - 1 + this.pauseTexts.length) % this.pauseTexts.length;
			this.updatePauseCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(controls.down.isDown){
			this.pauseIndex = (this.pauseIndex + 1) % this.pauseTexts.length;
			this.updatePauseCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		if(PlayerController.enterKey.isDown){
			this.executePauseAction();
			Utils.debounce(this, 500);
		}

		if(PlayerController.escKey.isDown || this.escKey2.isDown){
			this.resume();
			Utils.debounce(this, 300);
		}
	},

	executePauseAction: function(){
		switch(this.pauseIndex){
			case 0: // continuar
				this.resume();
				break;
			case 1: // reiniciar - mostrar confirmacao
				this.confirmActive = true;
				this.confirmGroup.visible = true;
				this.confirmIndex = 0;
				this.updateConfirmCoinPosition();
				Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
				break;
			case 2: // configuracoes - abre overlay de configuracoes
				// esconde pauseMenu enquanto settings esta aberto
				this.pauseGroup.visible = false;
				var self = this;
				SettingsOverlay.open({
					returnState: 'game',
					onClose: function(){
						// quando settings fecha, mostra pauseMenu novamente
						self.pauseGroup.visible = true;
						self.updatePauseCoinPosition();
					}
				});
				break;
			case 3: // voltar ao menu
				this.onQuit();
				break;
		}
	},

	updateConfirmInput: function(controls){
		if(!this.inputReady) return;

		if(controls.up.isDown){
			this.confirmIndex = (this.confirmIndex - 1 + this.confirmTexts.length) % this.confirmTexts.length;
			this.updateConfirmCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(controls.down.isDown){
			this.confirmIndex = (this.confirmIndex + 1) % this.confirmTexts.length;
			this.updateConfirmCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		if(PlayerController.enterKey.isDown){
			if(this.confirmIndex === 0){
				// SIM - reiniciar
				this.onRestart();
			} else {
				// NAO - voltar ao menu de pausa
				this.confirmActive = false;
				this.confirmGroup.visible = false;
				this.confirmCoin.visible = false;
				Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
			}
			Utils.debounce(this, 500);
		}

		if(PlayerController.escKey.isDown || this.escKey2.isDown){
			this.confirmActive = false;
			this.confirmGroup.visible = false;
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}
	},

	updatePauseCoinPosition: function(){
		var target = this.pauseTexts[this.pauseIndex];
		this.pauseCoin.x = game.width / 2 - target.width / 2 - 22;
		this.pauseCoin.y = target.y;
		this.pauseCoin.visible = true;
		this.pauseCoinBobTime = 0;
	},

	updateConfirmCoinPosition: function(){
		var target = this.confirmTexts[this.confirmIndex];
		this.confirmCoin.x = game.width / 2 - target.width / 2 - 22;
		this.confirmCoin.y = target.y;
		this.confirmCoin.visible = true;
		this.confirmCoinBobTime = 0;
	},

	// bobbing suave das moedas indicadoras
	updateBobbing: function(){
		if(this.pauseCoin.visible && !this.confirmActive){
			this.pauseCoinBobTime += game.time.physicsElapsed * 4;
			var target = this.pauseTexts[this.pauseIndex];
			this.pauseCoin.y = target.y + Math.sin(this.pauseCoinBobTime) * 3;
		}
		if(this.confirmActive && this.confirmCoin.visible){
			this.confirmCoinBobTime += game.time.physicsElapsed * 4;
			var cTarget = this.confirmTexts[this.confirmIndex];
			this.confirmCoin.y = cTarget.y + Math.sin(this.confirmCoinBobTime) * 3;
		}
	}

};
