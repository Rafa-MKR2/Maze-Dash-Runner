var CoinManager = function(maze, tilePositions){
	this.maze = maze;
	this.tilePositions = tilePositions;
	this.coins = [];
};

CoinManager.prototype = {

	// cria todas as moedas em posicoes aleatorias
	spawn: function(count){
		this.coins = [];
		var positions = this.getRandomPositions(count);
		for(var i = 0; i < count; i++){
			var coin = this.createCoinSprite(positions[i].x, positions[i].y);
			this.coins.push(coin);
		}
	},

	// cria sprite de moeda
	createCoinSprite: function(x, y){
		var coin = game.add.sprite(x, y, 'coin');
		coin.anchor.set(.5);
		coin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		game.physics.arcade.enable(coin);
		coin.active = true;
		return coin;
	},

	// coleta uma moeda: esconde, desativa, reativa em nova posicao
	// retorna { collected: true, x, y } para a stage aplicar efeitos
	collect: function(coin){
		if(!coin.active) return { collected: false };

		coin.active = false;
		coin.visible = false;
		coin.body.enable = false;

		var pos = this.getFreePosition();
		coin.x = pos.x;
		coin.y = pos.y;

		coin.active = true;
		coin.visible = true;
		coin.body.enable = true;

		return { collected: true, x: pos.x, y: pos.y };
	},

	// retorna lista de posicoes livres (fora do array de moedas atuais)
	getRandomPositions: function(count){
		var available = [];
		for(var i = 0; i < this.tilePositions.length; i++){
			available.push(this.tilePositions[i]);
		}

		// embaralhar
		for(var i = available.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * (i + 1));
			var temp = available[i];
			available[i] = available[j];
			available[j] = temp;
		}

		return available.slice(0, count);
	},

	// retorna uma posicao que nao esta ocupada por outra moeda
	getFreePosition: function(){
		var occupied = {};
		for(var i = 0; i < this.coins.length; i++){
			if(this.coins[i].active){
				var key = this.coins[i].x + ',' + this.coins[i].y;
				occupied[key] = true;
			}
		}

		var available = [];
		for(var i = 0; i < this.tilePositions.length; i++){
			var pos = this.tilePositions[i];
			var key = pos.x + ',' + pos.y;
			if(!occupied[key]){
				available.push(pos);
			}
		}

		if(available.length === 0) return this.tilePositions[0];
		return available[Math.floor(Math.random() * available.length)];
	},

	// retorna a moeda ativa mais proxima de uma posicao
	getNearestActive: function(x, y){
		var nearest = null;
		var bestDist = Infinity;
		for(var i = 0; i < this.coins.length; i++){
			if(!this.coins[i].active) continue;
			var dx = this.coins[i].x - x;
			var dy = this.coins[i].y - y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			if(dist < bestDist){
				bestDist = dist;
				nearest = this.coins[i];
			}
		}
		return nearest;
	}

};
