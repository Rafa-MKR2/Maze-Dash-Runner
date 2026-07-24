var settingsUIState = {

	selectedIndex: 0,
	inputReady: false,

	options: [
		{ label: 'MUSICA',     type: 'toggle', key: 'music' },
		{ label: 'EFEITOS',    type: 'toggle', key: 'sfx' },
		{ label: 'VOLUME',     type: 'slider', key: 'volume' },
		{ label: 'TELA CHEIA', type: 'toggle', key: 'fullscreen' },
		{ label: 'VOLTAR',     type: 'action', key: 'back' }
	],

	create: function(){
		SettingsManager.load();
		this.selectedIndex = 0;
		this.inputReady = false;

		// titulo
		game.add.text(game.world.centerX, 60, 'CONFIGURACOES', {
			font: '36px emulogic', fill: '#fff'
		}).anchor.set(.5);

		// linhas de opcao
		this.labels = [];
		this.values = [];
		var startY = 150;
		var spacing = 50;

		for(var i = 0; i < this.options.length; i++){
			var opt = this.options[i];

			var lbl = game.add.text(game.world.centerX - 180, startY + i * spacing, opt.label, {
				font: '20px emulogic', fill: '#fff'
			});
			lbl.anchor.set(0, 0.5);
			this.labels.push(lbl);

			var valText = this.getValueText(opt);
			var val = game.add.text(game.world.centerX + 180, startY + i * spacing, valText, {
				font: '20px emulogic', fill: '#fff'
			});
			val.anchor.set(1, 0.5);
			this.values.push(val);
		}

		// seta
		this.arrow = game.add.text(0, 0, '>', {
			font: '20px emulogic', fill: '#fff'
		});

		// blink
		this.blinkTween = game.add.tween(this.labels[0]).to({alpha: 0.3}, 300, Phaser.Easing.Linear.None, true, 0, -1, true);

		this.updateArrowPosition();

		// controles
		this.cursors = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		game.time.events.add(300, function(){
			this.inputReady = true;
		}, this);
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
		if(opt.type === 'action'){
			return '';
		}
		return '';
	},

	updateValues: function(){
		for(var i = 0; i < this.options.length; i++){
			this.values[i].text = this.getValueText(this.options[i]);
		}
	},

	update: function(){
		if(!this.inputReady) return;

		if(this.cursors.up.isDown && !this.cursors.down.isDown){
			this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
			this.updateArrowPosition();
			this.playTick();
			Utils.debounce(this);
		} else
		if(this.cursors.down.isDown && !this.cursors.up.isDown){
			this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
			this.updateArrowPosition();
			this.playTick();
			Utils.debounce(this);
		}

		var opt = this.options[this.selectedIndex];

		if(opt.type === 'toggle'){
			if(this.cursors.left.isDown){
				SettingsManager.set(opt.key, false);
				this.updateValues();
				this.applyMusicState();
				this.playTick();
				Utils.debounce(this);
			} else
			if(this.cursors.right.isDown){
				SettingsManager.set(opt.key, true);
				this.updateValues();
				this.applyMusicState();
				this.playTick();
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
			if(this.enterKey.isDown || this.escKey.isDown){
				game.state.start('menu');
				Utils.debounce(this, 500);
			}
		}

		if(this.escKey.isDown && opt.key !== 'back'){
			game.state.start('menu');
			Utils.debounce(this, 500);
		}
	},

	updateArrowPosition: function(){
		var target = this.labels[this.selectedIndex];
		this.arrow.x = target.x - 25;
		this.arrow.y = target.y - 8;

		if(this.blinkTween) this.blinkTween.stop();
		for(var i = 0; i < this.labels.length; i++){
			this.labels[i].alpha = 1;
		}
		this.blinkTween = game.add.tween(target).to({alpha: 0.3}, 300, Phaser.Easing.Linear.None, true, 0, -1, true);
	},

	playTick: function(){
		if(!SettingsManager.get('sfx')) return;
		var tick = game.add.audio('getitem');
		tick.volume = 0.2;
		tick.play();
	},

	applyMusicVolume: function(){
		if(window._menuMusic && window._menuMusic.isPlaying){
			window._menuMusic.volume = SettingsManager.get('volume') / 100 * 0.5;
		}
	},

	applyMusicState: function(){
		if(SettingsManager.get('music')){
			if(!window._menuMusic){
				window._menuMusic = game.add.audio('music');
				window._menuMusic.loop = true;
			}
			window._menuMusic.volume = SettingsManager.get('volume') / 100 * 0.5;
			if(!window._menuMusic.isPlaying){
				window._menuMusic.play();
			}
		} else {
			if(window._menuMusic && window._menuMusic.isPlaying){
				window._menuMusic.stop();
			}
		}
	}

};
