var stage1State = {

	create: function(){
		//Musica e sons
		this.music = game.add.audio('music1');
		this.music.loop = true;
		this.music.volume = .5;
		this.music.play();

		this.sndCoin = game.add.audio('getitem');
		this.sndCoin.volume = .5;

		this.sndLoserCoin = game.add.audio('loseitem');
		this.sndLoserCoin.volume = .5;

		game.add.sprite(0, 0, 'bg');

		this.maze = [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,3,0,0,0,0,0,0,0,0,0,0,0,3,1],
			[1,0,1,1,0,1,0,1,1,1,0,1,1,0,1],
			[1,0,1,3,0,1,3,0,0,1,0,3,1,3,1],
			[1,0,0,0,1,1,1,1,0,1,0,1,1,0,1],
			[1,0,0,0,0,1,0,2,0,0,0,0,0,0,1],
			[1,0,1,3,0,0,0,3,1,0,0,3,1,0,1],
			[1,0,1,1,1,1,0,1,1,0,1,1,1,0,1],
			[1,3,0,0,3,0,0,3,1,0,0,0,0,3,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
		];

		this.blocks = game.add.group();
		this.blocks.enableBody = true;

		this.coinPositions = [];

		for(var row in this.maze){
			for(var col in this.maze[row]){
				var tile = this.maze[row][col];

				var x = col * 50;
				var y = row * 50;

				if(tile === 1){
					var block = this.blocks.create(x, y, 'block');
					block.body.immovable = true;
				} else
				if(tile === 2){
					this.startPosition = { x: x + 25, y: y + 25 };
					this.player = game.add.sprite(this.startPosition.x, this.startPosition.y, 'player');
					this.player.anchor.set(.5);
					game.physics.arcade.enable(this.player);
					this.player.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
					this.player.animations.add('goUp', [8,9,10,11,12,13,14,15], 12, true);
					this.player.animations.add('goLeft', [16,17,18,19,20,21,22,23], 12, true);
					this.player.animations.add('goRight', [24,25,26,27,28,29,30,31], 12, true);
				} else
				if(tile === 3){
					var position = {
						x: x + 25,
						y: y + 25
					};
					this.coinPositions.push(position);
				}
			}
		}

		// inimigo
		this.enemy = game.add.sprite(75, 75, 'enemy');
		this.enemy.anchor.set(0.5);
		game.physics.arcade.enable(this.enemy);

		this.enemy.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
		this.enemy.animations.add('goUp', [8,9,10,11,12,13,14,15], 12, true);
		this.enemy.animations.add('goLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.enemy.animations.add('goRight', [24,25,26,27,28,29,30,31], 12, true);

		this.enemy.direction = 'DOWN';

		//Criar a moeda
		this.coin = {};
		this.coin.position = this.newPosition();
		this.coin = game.add.sprite(this.coin.position.x, this.coin.position.y, 'coin');
		this.coin.anchor.set(.5);
		this.coin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();

		this.physics.arcade.enable(this.coin);

		// coletar moeda
		this.coins = 0;
		this.txtCoins = game.add.text(15, 15, 'COINS:' + this.getText(this.coins), {
			font: '15px emulogic', fill: '#fff'
		});

		//controles
		this.controls = game.input.keyboard.createCursorKeys();

		// particulas
		this.emitter = game.add.emitter(0, 0, 20);
		this.emitter.makeParticles('part');
		this.emitter.setXSpeed(-50, 50);
		this.emitter.setYSpeed(-50, 50);
		this.emitter.gravity.y = 0;
	},

	update: function(){
		game.physics.arcade.collide(this.player, this.blocks);
		game.physics.arcade.overlap(this.player, this.coin, this.getCoin, null, this);
		game.physics.arcade.overlap(this.player, this.enemy, this.loseCoin, null, this);

		this.moveEnemy();
		this.movePlayer();
	},

	shutdown: function(){
		this.music.stop();
	},

	loseCoin: function(){
		this.sndLoserCoin.play();

		this.emitter.x = this.player.position.x;
		this.emitter.y = this.player.position.y;
		this.emitter.start(true, 2000, null, 20);

		// gameOver: vai para tela de fim com a pontuacao
		game.state.start('end', true, false, { score: this.coins });
	},

	moveEnemy: function(){
		if(Math.floor(this.enemy.x - 25) % 50 === 0 && Math.floor(this.enemy.y - 25) % 50 === 0){
			var enemyCol = Math.floor(this.enemy.x / 50);
			var enemyRow = Math.floor(this.enemy.y / 50);
			var validPath = [];

			if(this.maze[enemyRow][enemyCol - 1] !== 1 && this.enemy.direction !== 'RIGHT'){
				validPath.push('LEFT');
			}
			if(this.maze[enemyRow][enemyCol + 1] !== 1 && this.enemy.direction !== 'LEFT'){
				validPath.push('RIGHT');
			}
			if(this.maze[enemyRow - 1][enemyCol] !== 1 && this.enemy.direction !== 'DOWN'){
				validPath.push('UP');
			}
			if(this.maze[enemyRow + 1][enemyCol] !== 1 && this.enemy.direction !== 'UP'){
				validPath.push('DOWN');
			}

			this.enemy.direction = validPath[Math.floor(Math.random() * validPath.length)];
		}

		switch(this.enemy.direction){
			case 'LEFT':
				this.enemy.x -= 1;
				this.enemy.animations.play('goLeft');
				break;
			case 'RIGHT':
				this.enemy.x += 1;
				this.enemy.animations.play('goRight');
				break;
			case 'UP':
				this.enemy.y -= 1;
				this.enemy.animations.play('goUp');
				break;
			case 'DOWN':
				this.enemy.y += 1;
				this.enemy.animations.play('goDown');
				break;
		}
	},

	getCoin: function(){
		this.emitter.x = this.coin.position.x;
		this.emitter.y = this.coin.position.y;
		this.emitter.start(true, 2000, null, 20);

		this.sndCoin.play();

		this.coins++;
		this.txtCoins.text = 'COINS:' + this.getText(this.coins);
		this.coin.position = this.newPosition();
	},

	getText: function(value){
		if(value < 10){
			return '00' + value.toString();
		}
		if(value < 100){
			return '0' + value.toString();
		}

		return value.toString();
	},

	movePlayer: function(){
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		if(this.controls.left.isDown && !this.controls.right.isDown){
			this.player.body.velocity.x = -100;
			this.player.direction = "left";
		} else
		if(this.controls.right.isDown && !this.controls.left.isDown){
			this.player.body.velocity.x = 100;
			this.player.direction = "right";
		}

		if(this.controls.up.isDown && !this.controls.down.isDown){
			this.player.body.velocity.y = -100;
			this.player.direction = "up";
		} else
		if(this.controls.down.isDown && !this.controls.up.isDown){
			this.player.body.velocity.y = 100;
			this.player.direction = "down";
		}

		switch(this.player.direction){
			case "left":
				this.player.animations.play('goLeft');
				break;
			case "right":
				this.player.animations.play('goRight');
				break;
			case "up":
				this.player.animations.play('goUp');
				break;
			case "down":
				this.player.animations.play('goDown');
				break;
		}

		if(this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0){
			this.player.animations.stop();
		}
	},

	newPosition: function(){
		var pos;
		do {
			pos = this.coinPositions[Math.floor(Math.random() * this.coinPositions.length)];
		} while(this.coin.position && pos.x === this.coin.position.x && pos.y === this.coin.position.y);
		return pos;
	}

};
