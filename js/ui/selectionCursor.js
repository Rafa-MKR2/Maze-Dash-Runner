var SelectionCursor = function(game, group, scale){
	scale = scale || 1.1;
	var coin = game.add.sprite(0, 0, 'coin', null, group);
	coin.anchor.set(.5);
	coin.scale.set(scale);
	coin.smoothed = false;
	coin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
	coin.visible = false;
	this.coin = coin;
	this.bobTime = 0;
};

SelectionCursor.prototype = {
	placeLeftOf: function(textObj, centerX){
		this.coin.x = centerX - textObj.width / 2 - 22;
		this.coin.y = textObj.y;
		this.coin.visible = true;
		this.bobTime = 0;
	},

	placeAt: function(x, y){
		this.coin.x = x;
		this.coin.y = y;
		this.coin.visible = true;
		this.bobTime = 0;
	},

	bob: function(textObj){
		if(!this.coin.visible) return;
		this.bobTime += game.time.physicsElapsed * 4;
		this.coin.y = textObj.y + Math.sin(this.bobTime) * 3;
	},

	destroy: function(){
		if(this.coin) this.coin.destroy();
	}
};
