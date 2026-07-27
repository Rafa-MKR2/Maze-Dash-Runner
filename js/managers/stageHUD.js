var StageHUD = function() {
	this.txtCoins = null;
	this.txtScore = null;
	this.txtTimer = null;
	this.staminaBarBg = null;
	this.staminaBarFill = null;
};

StageHUD.prototype = {

	create: function(coins, score, timeLimit){
		this.txtCoins = game.add.text(15, 15, 'MOEDAS: ' + Utils.formatNumber(coins, 3), {
			font: '15px emulogic', fill: '#fff'
		});
		this.txtCoins.fixedToCamera = true;

		this.txtScore = game.add.text(15, 32, 'PONTUACAO: ' + Utils.formatNumber(score, 3), {
			font: '15px emulogic', fill: '#fff'
		});
		this.txtScore.fixedToCamera = true;

		this.txtTimer = game.add.text(game.camera.width - 15, 15, 'TEMPO: ' + Utils.formatTime(timeLimit), {
			font: '15px emulogic', fill: '#fff'
		});
		this.txtTimer.anchor.set(1, 0);
		this.txtTimer.fixedToCamera = true;

		this.staminaBarBg = game.add.graphics();
		this.staminaBarBg.fixedToCamera = true;
		this.staminaBarFill = game.add.graphics();
		this.staminaBarFill.fixedToCamera = true;
		this.updateStamina();
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

	updateStamina: function(){
		var barX = 15;
		var barY = 65;
		var barW = 120;
		var barH = 12;
		var ratio = PlayerController.stamina / PlayerController.maxStamina;

		this.staminaBarBg.clear();
		this.staminaBarBg.beginFill(0x000000, 0.6);
		this.staminaBarBg.drawRect(barX - 1, barY - 1, barW + 2, barH + 2);
		this.staminaBarBg.endFill();

		var fillColor = 0x4488cc;
		if(ratio < 0.33) fillColor = 0xcc4444;
		else if(ratio < 0.66) fillColor = 0xcccc44;

		this.staminaBarFill.clear();
		this.staminaBarFill.beginFill(fillColor);
		this.staminaBarFill.drawRect(barX, barY, barW * ratio, barH);
		this.staminaBarFill.endFill();

		if(PlayerController.isFatigued){
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

	showFloatingText: function(x, y, text, color){
		var t = game.add.text(x, y, text, {
			font: '13px emulogic', fill: color
		});
		t.anchor.set(0.5);
		game.add.tween(t).to({ y: y - 30, alpha: 0 }, GameConfig.FLOAT_TEXT_DURATION, Phaser.Easing.Linear.None, true);
		game.time.events.add(GameConfig.FLOAT_TEXT_DURATION, function(){ t.destroy(); });
	},

	destroy: function(){
		if(this.staminaBarFill) this.staminaBarFill.destroy();
		if(this.staminaBarBg) this.staminaBarBg.destroy();
		if(this.txtTimer) this.txtTimer.destroy();
		if(this.txtScore) this.txtScore.destroy();
		if(this.txtCoins) this.txtCoins.destroy();
	}
};
