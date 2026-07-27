var StageHUD = function() {
	this.group = null;
	this.txtCoins = null;
	this.txtScore = null;
	this.txtTimer = null;
	this.staminaBarBg = null;
	this.staminaBarFill = null;
	this.sprKeyHUD = null;
	this.txtKeyHUD = null;
	this.winMessage = null;
	this.winMessageTimer = null;
};

StageHUD.prototype = {

	create: function(config){
		this.group = game.add.group();
		this.group.fixedToCamera = true;

		this.txtCoins = game.add.text(15, 15, 'MOEDAS: ' + Utils.formatNumber(config.coins, 3), {
			font: '15px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.group);

		this.txtScore = game.add.text(15, 32, 'PONTUACAO: ' + Utils.formatNumber(config.score, 3), {
			font: '15px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.group);

		this.txtTimer = game.add.text(game.width - 15, 15, 'TEMPO: ' + Utils.formatTime(config.time), {
			font: '15px ' + GameConfig.UI_FONT, fill: '#fff'
		}, this.group);
		this.txtTimer.anchor.set(1, 0);

		this.staminaBarBg = game.add.graphics(0, 0, this.group);
		this.staminaBarFill = game.add.graphics(0, 0, this.group);
		this.updateStamina(config.stamina, config.maxStamina, false);
	},

	updateCoins: function(value){
		this.txtCoins.text = 'MOEDAS: ' + Utils.formatNumber(value, 3);
	},

	updateScore: function(value){
		this.txtScore.text = 'PONTUACAO: ' + Utils.formatNumber(value, 3);
	},

	updateTimer: function(seconds){
		this.txtTimer.text = 'TEMPO: ' + Utils.formatTime(Math.max(0, seconds));
	},

	updateStamina: function(stamina, maxStamina, isFatigued){
		var barX = 15;
		var barY = 65;
		var barW = 120;
		var barH = 12;
		var ratio = stamina / maxStamina;

		this.staminaBarBg.clear();
		this.staminaBarBg.beginFill(0x000000, 0.6);
		this.staminaBarBg.drawRect(barX - 1, barY - 1, barW + 2, barH + 2);
		this.staminaBarBg.endFill();

		var fillColor = 0x4488cc;
		if(ratio < 0.33) fillColor = 0xcc4444;
		else if(ratio < 0.66) fillColor = 0xcccc44;

		if(isFatigued){
			var flashing = Math.floor(game.time.now / 300) % 2 === 0;
			this.staminaBarFill.clear();
			this.staminaBarFill.beginFill(flashing ? 0xff0000 : 0x330000);
			this.staminaBarFill.drawRect(barX, barY, barW * ratio, barH);
			this.staminaBarFill.endFill();
		} else {
			this.staminaBarFill.clear();
			this.staminaBarFill.beginFill(fillColor);
			this.staminaBarFill.drawRect(barX, barY, barW * ratio, barH);
			this.staminaBarFill.endFill();
		}
	},

	showKeyIcon: function(){
		if(this.sprKeyHUD) return;

		this.sprKeyHUD = game.add.sprite(game.width / 2, 24, 'key', 0, this.group);
		this.sprKeyHUD.anchor.set(0.5, 0.5);
		this.sprKeyHUD.scale.set(.75);

		this.txtKeyHUD = game.add.text(game.width / 2, 36, 'CHAVE', {
			font: '11px ' + GameConfig.UI_FONT, fill: '#ffcc00'
		}, this.group);
		this.txtKeyHUD.anchor.set(0.5, 0);
	},

	hideKeyIcon: function(){
		if(this.sprKeyHUD){
			this.sprKeyHUD.destroy();
			this.sprKeyHUD = null;
		}
		if(this.txtKeyHUD){
			this.txtKeyHUD.destroy();
			this.txtKeyHUD = null;
		}
	},

	showMessage: function(text){
		if(this.winMessage) this.winMessage.destroy();
		if(this.winMessageTimer) game.time.events.remove(this.winMessageTimer);

		this.winMessage = game.add.text(
			game.camera.view.centerX,
			game.camera.view.centerY - 60,
			text,
			{ font: '20px ' + GameConfig.UI_FONT, fill: '#00ff88' }
		);
		this.winMessage.anchor.set(.5);

		var self = this;
		this.winMessageTimer = game.time.events.add(Phaser.Timer.SECOND * 2, function(){
			if(self.winMessage){
				self.winMessage.destroy();
				self.winMessage = null;
			}
		});
	},

	showFloatingText: function(x, y, text, color){
		var t = game.add.text(x, y, text, {
			font: '13px ' + GameConfig.UI_FONT, fill: color
		});
		t.anchor.set(0.5);
		game.add.tween(t).to({ y: y - 30, alpha: 0 }, GameConfig.FLOAT_TEXT_DURATION, Phaser.Easing.Linear.None, true);
		game.time.events.add(GameConfig.FLOAT_TEXT_DURATION, function(){ t.destroy(); });
	},

	destroy: function(){
		if(this.winMessageTimer) game.time.events.remove(this.winMessageTimer);
		if(this.winMessage) this.winMessage.destroy();
		this.hideKeyIcon();
		if(this.staminaBarFill) this.staminaBarFill.destroy();
		if(this.staminaBarBg) this.staminaBarBg.destroy();
		if(this.txtTimer) this.txtTimer.destroy();
		if(this.txtScore) this.txtScore.destroy();
		if(this.txtCoins) this.txtCoins.destroy();
	}

};
