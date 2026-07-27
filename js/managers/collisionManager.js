var CollisionManager = function(config){
	this.player = config.player;
	this.enemyManager = config.enemyManager;
	this.coinManager = config.coinManager;
	this.blocks = config.blocks;
	this.callbacks = config.callbacks || {};
};

CollisionManager.prototype = {

	update: function(){
		game.physics.arcade.collide(this.player.sprite, this.blocks);
		this.checkCoinCollisions();
		this.checkEnemyCollisions();
	},

	checkCoinCollisions: function(){
		var coins = this.coinManager.coins;
		for(var i = 0; i < coins.length; i++){
			if(!coins[i].active) continue;
			game.physics.arcade.overlap(this.player.sprite, coins[i], this.playerCollectCoin, null, this);
		}
	},

	checkEnemyCollisions: function(){
		var coins = this.coinManager.coins;
		var enemies = this.enemyManager.sprites;

		for(var i = 0; i < enemies.length; i++){
			var enemy = enemies[i];

			for(var j = 0; j < coins.length; j++){
				if(!coins[j].active) continue;
				game.physics.arcade.overlap(enemy, coins[j], this.goblinCollectCoin, null, this);
			}

			game.physics.arcade.overlap(this.player.sprite, enemy, this.loseCoin, null, this);
		}
	},

	playerCollectCoin: function(player, coin){
		var result = this.coinManager.collect(coin);
		if(!result.collected) return;

		if(this.callbacks.onCoinCollect){
			this.callbacks.onCoinCollect(result.x, result.y);
		}
	},

	goblinCollectCoin: function(enemy, coin){
		this.coinManager.collect(coin);
		if(this.callbacks.onGoblinCollectCoin){
			this.callbacks.onGoblinCollectCoin();
		}
	},

	loseCoin: function(){
		if(this.player.invulnTimer > 0) return;

		if(this.callbacks.onPlayerCaught){
			this.callbacks.onPlayerCaught();
		}
	}

};
