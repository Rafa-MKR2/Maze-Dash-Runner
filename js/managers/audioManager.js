// AudioManager - responsavel por toda logica de audio do jogo.
// Musica, efeitos sonoros e ticks de navegacao ficam centralizados aqui.
// Assim novas fases podem trocar musicas sem alterar a Stage.
var AudioManager = {

	music: null,
	sndCoin: null,
	sndLose: null,
	sndFatigue: null,
	sndWin: null,

	init: function(musicKey){
		this.music = null;
		this.sndCoin = game.add.audio('getitem');
		this.sndCoin.volume = 0.5;
		this.sndLose = game.add.audio('loseitem');
		this.sndLose.volume = 0.5;
		this.sndFatigue = game.add.audio('fatigue');
		this.sndFatigue.volume = 0.4;
		this.sndWin = game.add.audio('win');
		this.sndWin.volume = SettingsManager.get('volume') / 100 * 0.5;

		if(musicKey && SettingsManager.get('music')){
			this.music = game.add.audio(musicKey);
			this.music.loop = true;
			this.music.volume = SettingsManager.get('volume') / 100 * 0.5;
			this.music.play();
		}
	},

	playCoin: function(){
		if(SettingsManager.get('sfx')) this.sndCoin.play();
	},

	playLose: function(){
		if(SettingsManager.get('sfx')) this.sndLose.play();
	},

	playFatigue: function(){
		if(SettingsManager.get('sfx')) this.sndFatigue.play();
	},

	playWin: function(){
		if(SettingsManager.get('sfx')) this.sndWin.play();
	},

	// som de navegacao em menus - reutilizavel por qualquer tela
	sndTick: null,
	playTick: function(){
		if(!SettingsManager.get('sfx')) return;
		if(!this.sndTick){
			this.sndTick = game.add.audio('getitem');
			this.sndTick.volume = 0.2;
		}
		this.sndTick.play();
	},

	pause: function(){
		if(this.music) this.music.pause();
	},

	resume: function(){
		if(this.music) this.music.resume();
	},

	stop: function(){
		if(this.music) this.music.stop();
	}

};
