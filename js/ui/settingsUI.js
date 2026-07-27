// SettingsOverlay - painel de configuracoes reutilizavel.
// Usado tanto pelo Menu Principal quanto pelo Menu de Pausa.
// Nao e um Phaser state - e um overlay manual que funciona sobre qualquer cena.
var SettingsOverlay = {

	isOpen: false,
	selectedIndex: 0,
	inputReady: false,
	onClose: null,

	group: null,
	labels: [],
	values: [],
	menuCoin: null,
	coinBobTime: 0,
	cursors: null,
	enterKey: null,
	escKey: null,

	options: [
		{ label: 'MUSICA',     type: 'toggle', key: 'music' },
		{ label: 'EFEITOS',    type: 'toggle', key: 'sfx' },
		{ label: 'VOLUME',     type: 'slider', key: 'volume' },
		{ label: 'TELA CHEIA', type: 'toggle', key: 'fullscreen' },
		{ label: 'VOLTAR',     type: 'action', key: 'back' }
	],

	open: function(config){
		config = config || {};
		this.onClose = config.onClose || null;
		this.selectedIndex = 0;
		this.inputReady = false;

		SettingsManager.load();
		this.buildUI();

		// sincronizar estado da musica ao abrir
		// resolve bug: musica paused do pause nao reseta ao abrir settings
		this.applyMusicState();

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

		this.isOpen = true;

		game.time.events.add(300, function(){
			this.inputReady = true;
		}, this);
	},

	buildUI: function(){
		this.group = game.add.group();

		this.visibleOptions = [];
		for(var i = 0; i < this.options.length; i++){
			if(this.options[i].key === 'fullscreen' && GameConfig.isMobile) continue;
			this.visibleOptions.push(this.options[i]);
		}

		var bg = game.add.graphics(0, 0, this.group);
		bg.beginFill(0x000000, 0.7);
		bg.drawRect(0, 0, game.width, game.height);
		bg.endFill();

		game.add.text(game.world.centerX, 60, 'CONFIGURACOES', {
			font: '36px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.group).anchor.set(.5);

		this.labels = [];
		this.values = [];
		var startY = 150;
		var spacing = 50;

		for(var i = 0; i < this.visibleOptions.length; i++){
			var opt = this.visibleOptions[i];

			var lbl = game.add.text(game.world.centerX - 180, startY + i * spacing, opt.label, {
				font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
			}, this.group);
			lbl.anchor.set(0, 0.5);
			this.labels.push(lbl);

			var valText = this.getValueText(opt);
			var val = game.add.text(game.world.centerX + 180, startY + i * spacing, valText, {
				font: '20px ' + GameConfig.UI_FONT, fill: '#fff'
			}, this.group);
			val.anchor.set(1, 0.5);
			this.values.push(val);
		}

		// moeda indicadora de selecao
		this.menuCoin = game.add.sprite(0, 0, 'coin', null, this.group);
		this.menuCoin.anchor.set(.5);
		this.menuCoin.scale.set(1.1);
		this.menuCoin.smoothed = false;
		this.menuCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.coinBobTime = 0;

		this.updateCoinPosition();
	},

	getValueText: function(opt){
		if(opt.type === 'toggle'){
			return SettingsManager.get(opt.key) ? '[ON]' : '[OFF]';
		}
		if(opt.type === 'slider'){
			var vol = SettingsManager.get(opt.key);
			var bars = Math.round(vol / 10);
			var str = '[';
			for(var i = 0; i < 10; i++){
				str += i < bars ? '=' : '-';
			}
			str += ']';
			return str;
		}
		return '';
	},

	updateValues: function(){
		for(var i = 0; i < this.visibleOptions.length; i++){
			this.values[i].text = this.getValueText(this.visibleOptions[i]);
		}
	},

	updateCoinPosition: function(){
		var target = this.labels[this.selectedIndex];
		this.menuCoin.x = target.x - 25;
		this.menuCoin.y = target.y;
		this.coinBobTime = 0;
		this.menuCoin.visible = true;
	},

	close: function(){
		if(this.group){
			this.group.destroy(true);
			this.group = null;
		}
		this.labels = [];
		this.values = [];
		this.menuCoin = null;
		this.isOpen = false;

		if(this.onClose){
			this.onClose();
			this.onClose = null;
		}

		// desabilitar input do pause menu por 300ms para evitar
		// que o mesmo ESC que fechou o overlay tambem feche a pausa
		if(typeof PauseUI !== 'undefined'){
			PauseUI.inputReady = false;
			game.time.events.add(300, function(){
				PauseUI.inputReady = true;
			});
		}
	},

	update: function(){
		if(!this.isOpen || !this.inputReady) return;

		// bobbing da moeda indicadora
		if(this.menuCoin && this.menuCoin.visible){
			this.coinBobTime += game.time.physicsElapsed * 4;
			var target = this.labels[this.selectedIndex];
			this.menuCoin.y = target.y + Math.sin(this.coinBobTime) * 3;
		}

		// navegacao vertical
		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.selectedIndex = (this.selectedIndex - 1 + this.visibleOptions.length) % this.visibleOptions.length;
			this.updateCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = (this.selectedIndex + 1) % this.visibleOptions.length;
			this.updateCoinPosition();
			AudioManager.playTick();
			Utils.debounce(this);
		}

		var opt = this.visibleOptions[this.selectedIndex];

		if(opt.type === 'toggle'){
			if(this.cursors.left.isDown){
				SettingsManager.set(opt.key, false);
				this.updateValues();
				this.applyToggleEffect(opt.key);
				AudioManager.playTick();
				Utils.debounce(this);
			} else
			if(this.cursors.right.isDown){
				SettingsManager.set(opt.key, true);
				this.updateValues();
				this.applyToggleEffect(opt.key);
				AudioManager.playTick();
				Utils.debounce(this);
			}
		}

		if(opt.type === 'slider'){
			if(this.cursors.left.isDown){
				var vol = SettingsManager.get('volume');
				vol = Math.max(0, vol - 10);
				SettingsManager.set('volume', vol);
				this.updateValues();
				this.applyMusicVolume();
				Utils.debounce(this);
			} else
			if(this.cursors.right.isDown){
				var vol2 = SettingsManager.get('volume');
				vol2 = Math.min(100, vol2 + 10);
				SettingsManager.set('volume', vol2);
				this.updateValues();
				this.applyMusicVolume();
				Utils.debounce(this);
			}
		}

		if(opt.type === 'action' && opt.key === 'back'){
			if(this.enterKey.isDown){
				AudioManager.playTick();
				this.close();
				Utils.debounce(this, 500);
				return;
			}
		}

		if(this.escKey.isDown){
			AudioManager.playTick();
			this.close();
			Utils.debounce(this, 500);
		}
	},

	applyMusicVolume: function(){
		var vol = SettingsManager.get('volume') / 100 * 0.5;

		if(window._menuMusic && window._menuMusic.isPlaying){
			window._menuMusic.volume = vol;
		}

		if(this.onClose && AudioManager.music && AudioManager.music.isPlaying){
			AudioManager.music.volume = vol;
		}
	},

	// liga ou desliga musica conforme configuracao
	applyMusicState: function(){
		var musicOn = SettingsManager.get('music');
		var vol = SettingsManager.get('volume') / 100 * 0.5;

		if(this.onClose){
			// contexto de gameplay: controlar AudioManager.music
			if(musicOn){
				if(AudioManager.music && !AudioManager.music.isPlaying){
					AudioManager.music.volume = vol;
					AudioManager.music.resume();
				}
			} else {
				if(AudioManager.music && AudioManager.music.isPlaying){
					AudioManager.music.pause();
				}
			}
			return;
		}

		// contexto de menu: controlar window._menuMusic
		if(musicOn){
			if(!window._menuMusic){
				window._menuMusic = game.add.audio('music');
				window._menuMusic.loop = true;
			}
			window._menuMusic.volume = vol;
			if(!window._menuMusic.isPlaying){
				window._menuMusic.play();
			}
		} else {
			if(window._menuMusic && window._menuMusic.isPlaying){
				window._menuMusic.stop();
			}
		}
	},

	applyToggleEffect: function(key){
		if(key === 'music'){
			this.applyMusicState();
		} else
		if(key === 'fullscreen'){
			this.applyFullscreen();
		}
	},

	applyFullscreen: function(){
		if(GameConfig.isMobile) return;
		if(!GameConfig.fullscreenEnabled) return;

		if(SettingsManager.get('fullscreen')){
			if(!GameConfig.fullscreenElement()){
				GameConfig.requestFullscreen();
			}
		} else {
			if(GameConfig.fullscreenElement()){
				GameConfig.exitFullscreen();
			}
		}
	}

};
