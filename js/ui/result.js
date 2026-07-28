var ResultScreen = {

	group: null,
	onContinue: null,
	_timer: null,

	show: function(data){
		this.onContinue = data.onContinue || function(){};

		var vw = game.camera.view.width;
		var vh = game.camera.view.height;

		this.group = game.add.group();
		this.group.fixedToCamera = true;
		game.world.bringToTop(this.group);

		var bg = game.add.graphics(0, 0, this.group);
		bg.beginFill(0x000000, 0.65);
		bg.drawRect(0, 0, vw, vh);
		bg.endFill();

		var cx = vw / 2;
		var cy = vh / 2;
		var bw = 280;
		var bh = 230;

		var box = game.add.graphics(0, 0, this.group);
		box.beginFill(0x16213e, 1);
		box.lineStyle(1, 0xffd700, 0.4);
		box.drawRect(cx - bw / 2, cy - bh / 2, bw, bh);
		box.endFill();

		var ty = cy - bh / 2;

		game.add.text(cx, ty + 25, 'FASE COMPLETA!', {
			font: '16px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}, this.group).anchor.set(.5);

		game.add.text(cx, ty + 65, 'TEMPO  ' + data.time + 's', {
			font: '13px ' + GameConfig.UI_FONT, fill: '#ccc'
		}, this.group).anchor.set(.5);

		game.add.text(cx, ty + 90, 'PEGO   ' + data.enemiesDodged + 'x', {
			font: '13px ' + GameConfig.UI_FONT, fill: '#ccc'
		}, this.group).anchor.set(.5);

		game.add.text(cx, ty + 115, 'MOEDAS ' + data.coins, {
			font: '13px ' + GameConfig.UI_FONT, fill: '#ccc'
		}, this.group).anchor.set(.5);

		var sep = game.add.graphics(0, 0, this.group);
		sep.lineStyle(1, 0xffd700, 0.2);
		sep.moveTo(cx - 80, ty + 135);
		sep.lineTo(cx + 80, ty + 135);

		game.add.text(cx, ty + 155, 'TOTAL', {
			font: '11px ' + GameConfig.UI_FONT, fill: '#888'
		}, this.group).anchor.set(.5);

		game.add.text(cx, ty + 180, data.totalPoints.toString(), {
			font: '26px ' + GameConfig.UI_FONT, fill: '#ffd700'
		}, this.group).anchor.set(.5);

		this._timer = game.time.events.add(2500, this.close, this);
	},

	close: function(){
		if(this._timer){
			game.time.events.remove(this._timer);
			this._timer = null;
		}
		if(this.group){
			this.group.destroy();
			this.group = null;
		}
		if(this.onContinue) this.onContinue();
	}

};
