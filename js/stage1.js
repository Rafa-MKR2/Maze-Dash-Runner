var stage1State = {

	create: function(){
		SettingsManager.load();
		PlayerData.load();

		this.isPaused = false;
		this.gameTime = 0;
		this.pauseCooldown = false;
		this.confirmActive = false;

		// musica
		if(SettingsManager.get('music')){
			this.music = game.add.audio('music1');
			this.music.loop = true;
			this.music.volume = SettingsManager.get('volume') / 100 * 0.5;
			this.music.play();
		}

		// sons
		this.sndCoin = game.add.audio('getitem');
		this.sndCoin.volume = .5;
		this.sndLoserCoin = game.add.audio('loseitem');
		this.sndLoserCoin.volume = .5;

		// fundo
		game.add.sprite(0, 0, 'bg');

		// labirinto
		this.maze = GameConfig.MAZE;
		var tileSize = GameConfig.TILE_SIZE;

		this.blocks = game.add.group();
		this.blocks.enableBody = true;
		this.coinPositions = [];

		for(var row = 0; row < this.maze.length; row++){
			for(var col = 0; col < this.maze[row].length; col++){
				var tile = this.maze[row][col];
				var x = col * tileSize;
				var y = row * tileSize;

				if(tile === 1){
					var block = this.blocks.create(x, y, 'block');
					block.body.immovable = true;
				} else
				if(tile === 2){
					this.startPosition = { x: x + tileSize / 2, y: y + tileSize / 2 };
					this.player = game.add.sprite(this.startPosition.x, this.startPosition.y, 'player');
					this.player.anchor.set(.5);
					game.physics.arcade.enable(this.player);
					this.player.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
					this.player.animations.add('goUp', [8,9,10,11,12,13,14,15], 12, true);
					this.player.animations.add('goLeft', [16,17,18,19,20,21,22,23], 12, true);
					this.player.animations.add('goRight', [24,25,26,27,28,29,30,31], 12, true);
					this.player.lastDirection = null;
				} else
				if(tile === 3){
					this.coinPositions.push({ x: x + tileSize / 2, y: y + tileSize / 2 });
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

		// moeda
		this.coin = {};
		this.coin.position = this.newPosition();
		this.coin = game.add.sprite(this.coin.position.x, this.coin.position.y, 'coin');
		this.coin.anchor.set(.5);
		this.coin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		game.physics.arcade.enable(this.coin);

		// placar
		this.coins = 0;
		this.txtCoins = game.add.text(15, 15, 'MOEDAS: ' + Utils.formatNumber(this.coins, 3), {
			font: '15px emulogic', fill: '#fff'
		});

		// timer
		this.txtTimer = game.add.text(game.width - 15, 15, 'TEMPO: 00:00', {
			font: '15px emulogic', fill: '#fff'
		});
		this.txtTimer.anchor.set(1, 0);

		// controles
		this.controls = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		// particulas
		this.emitter = game.add.emitter(0, 0, 20);
		this.emitter.makeParticles('part');
		this.emitter.setXSpeed(-50, 50);
		this.emitter.setYSpeed(-50, 50);
		this.emitter.gravity.y = 0;

		// overlay de pausa
		this.createPauseOverlay();

		// overlay de confirmacao de reinicio
		this.createRestartConfirm();
	},

	update: function(){
		if(this.isPaused){
			// atualizar bobbing das moedas indicadoras
			this.updatePauseCoinBobbing();

			if(this.confirmActive){
				this.updateConfirmInput();
			} else {
				this.updatePauseInput();
			}
			return;
		}

		// timer
		this.gameTime += game.time.physicsElapsed;
		this.txtTimer.text = 'TEMPO: ' + Utils.formatTime(this.gameTime);

		// ESC para pausar
		if(this.escKey.isDown && !this.pauseCooldown){
			this.togglePause();
			this.pauseCooldown = true;
			game.time.events.add(300, function(){ this.pauseCooldown = false; }, this);
			return;
		}

		game.physics.arcade.collide(this.player, this.blocks);
		game.physics.arcade.overlap(this.player, this.coin, this.getCoin, null, this);
		game.physics.arcade.overlap(this.player, this.enemy, this.loseCoin, null, this);

		this.moveEnemy();
		this.movePlayer();
	},

	// --- PAUSA ---

	createPauseOverlay: function(){
		this.pauseGroup = game.add.group();
		this.pauseGroup.visible = false;

		// fundo semi-transparente
		this.pauseBg = game.add.graphics(0, 0, this.pauseGroup);
		this.pauseBg.beginFill(0x000000, 0.6);
		this.pauseBg.drawRect(0, 0, game.width, game.height);
		this.pauseBg.endFill();

		this.pauseTitle = game.add.text(game.world.centerX, 100, 'PAUSADO', {
			font: '36px emulogic', fill: '#fff'
		}, this.pauseGroup);
		this.pauseTitle.anchor.set(.5);

		var pauseOptions = [
			'CONTINUAR',
			'REINICIAR',
			'CONFIGURACOES',
			'VOLTAR AO MENU'
		];

		this.pauseTexts = [];
		var startY = 200;
		var spacing = 50;
		for(var i = 0; i < pauseOptions.length; i++){
			var txt = game.add.text(game.world.centerX, startY + i * spacing, pauseOptions[i], {
				font: '20px emulogic', fill: '#fff'
			}, this.pauseGroup);
			txt.anchor.set(.5);
			this.pauseTexts.push(txt);
		}

		// moeda indicadora de selecao na pausa
		this.pauseCoin = game.add.sprite(0, 0, 'coin', null, this.pauseGroup);
		this.pauseCoin.anchor.set(.5);
		this.pauseCoin.scale.set(1.0);
		this.pauseCoin.smoothed = false;
		this.pauseCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.pauseCoin.visible = false;

		this.pauseIndex = 0;
		this.pauseCoinBobTime = 0;

		this.escKey2 = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	},

	togglePause: function(){
		if(this.isPaused){
			this.resumeGame();
		} else {
			this.pauseGame();
		}
	},

	pauseGame: function(){
		this.isPaused = true;
		this.inputReady = false;
		this.pauseGroup.visible = true;
		this.pauseIndex = 0;
		this.updatePauseCoin();
		this.confirmActive = false;
		this.confirmGroup.visible = false;

		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;
		this.player.animations.stop();

		if(this.music) this.music.pause();

		game.time.events.add(300, function(){ this.inputReady = true; }, this);
	},

	resumeGame: function(){
		this.isPaused = false;
		this.pauseGroup.visible = false;
		this.confirmActive = false;
		this.confirmGroup.visible = false;
		if(this.music) this.music.resume();
	},

	executePauseAction: function(){
		switch(this.pauseIndex){
			case 0: // continuar
				this.resumeGame();
				break;
			case 1: // reiniciar — mostrar confirmacao
				this.showRestartConfirm();
				break;
			case 2: // configuracoes
				// TODO:Abrir settings dentro da pausa
				this.resumeGame();
				break;
			case 3: // voltar ao menu
				if(this.music) this.music.stop();
				game.state.start('menu');
				break;
		}
	},

	updatePauseCoin: function(){
		var target = this.pauseTexts[this.pauseIndex];
		this.pauseCoin.x = game.world.centerX - target.width / 2 - 22;
		this.pauseCoin.y = target.y;
		this.pauseCoin.visible = true;
		this.pauseCoinBobTime = 0;
	},

	updatePauseInput: function(){
		if(!this.inputReady) return;

		if(this.controls.up.isDown){
			this.pauseIndex = (this.pauseIndex - 1 + this.pauseTexts.length) % this.pauseTexts.length;
			this.updatePauseCoin();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(this.controls.down.isDown){
			this.pauseIndex = (this.pauseIndex + 1) % this.pauseTexts.length;
			this.updatePauseCoin();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		if(this.enterKey.isDown){
			this.executePauseAction();
			Utils.debounce(this, 500);
		}

		if(this.escKey.isDown || this.escKey2.isDown){
			this.resumeGame();
			Utils.debounce(this, 300);
		}
	},

	updatePauseCoinBobbing: function(){
		// bobbing da moeda do menu de pausa
		if(this.pauseCoin.visible && !this.confirmActive){
			this.pauseCoinBobTime += game.time.physicsElapsed * 4;
			var target = this.pauseTexts[this.pauseIndex];
			this.pauseCoin.y = target.y + Math.sin(this.pauseCoinBobTime) * 3;
		}
		// bobbing da moeda do confirm restart
		if(this.confirmActive && this.confirmCoin.visible){
			this.confirmCoinBobTime += game.time.physicsElapsed * 4;
			var cTarget = this.confirmTexts[this.confirmIndex];
			this.confirmCoin.y = cTarget.y + Math.sin(this.confirmCoinBobTime) * 3;
		}
	},

	// --- CONFIRMACAO DE REINICIO ---

	createRestartConfirm: function(){
		this.confirmGroup = game.add.group();
		this.confirmGroup.visible = false;

		// fundo semi-transparente escuro
		this.confirmBg = game.add.graphics(0, 0, this.confirmGroup);
		this.confirmBg.beginFill(0x000000, 0.75);
		this.confirmBg.drawRect(0, 0, game.width, game.height);
		this.confirmBg.endFill();

		// titulo da confirmacao
		this.confirmTitle = game.add.text(game.world.centerX, 170, 'REINICIAR FASE?', {
			font: '24px emulogic', fill: '#fff'
		}, this.confirmGroup);
		this.confirmTitle.anchor.set(.5);

		// opcoes
		var confirmOptions = ['SIM', 'NAO'];
		this.confirmTexts = [];
		var startY = 260;
		var spacing = 50;

		for(var i = 0; i < confirmOptions.length; i++){
			var txt = game.add.text(game.world.centerX, startY + i * spacing, confirmOptions[i], {
				font: '20px emulogic', fill: '#fff'
			}, this.confirmGroup);
			txt.anchor.set(.5);
			this.confirmTexts.push(txt);
		}

		// moeda indicadora de selecao
		this.confirmCoin = game.add.sprite(0, 0, 'coin', null, this.confirmGroup);
		this.confirmCoin.anchor.set(.5);
		this.confirmCoin.scale.set(1.0);
		this.confirmCoin.smoothed = false;
		this.confirmCoin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
		this.confirmCoin.visible = false;

		this.confirmIndex = 0;
		this.confirmCoinBobTime = 0;
	},

	showRestartConfirm: function(){
		this.confirmActive = true;
		this.confirmGroup.visible = true;
		this.confirmIndex = 0;
		this.updateConfirmCoin();
		Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
	},

	hideRestartConfirm: function(){
		this.confirmActive = false;
		this.confirmGroup.visible = false;
		this.confirmCoin.visible = false;
		Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
	},

	updateConfirmCoin: function(){
		var target = this.confirmTexts[this.confirmIndex];
		this.confirmCoin.x = game.world.centerX - target.width / 2 - 22;
		this.confirmCoin.y = target.y;
		this.confirmCoin.visible = true;
		this.confirmCoinBobTime = 0;
	},

	updateConfirmInput: function(){
		if(!this.inputReady) return;

		if(this.controls.up.isDown){
			this.confirmIndex = (this.confirmIndex - 1 + this.confirmTexts.length) % this.confirmTexts.length;
			this.updateConfirmCoin();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		} else
		if(this.controls.down.isDown){
			this.confirmIndex = (this.confirmIndex + 1) % this.confirmTexts.length;
			this.updateConfirmCoin();
			this.playTick();
			Utils.debounce(this, GameConfig.DEBOUNCE_DELAY);
		}

		if(this.enterKey.isDown){
			this.executeConfirmAction();
			Utils.debounce(this, 500);
		}

		if(this.escKey.isDown || this.escKey2.isDown){
			this.hideRestartConfirm();
		}
	},

	executeConfirmAction: function(){
		if(this.confirmIndex === 0){
			// SIM — reiniciar
			if(this.music) this.music.stop();
			game.state.start('stage1');
		} else {
			// NAO — voltar ao menu de pausa
			this.hideRestartConfirm();
		}
	},

	// --- GAMEPLAY ---

	movePlayer: function(){
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		var movingX = false;
		var movingY = false;

		if(this.controls.left.isDown && !this.controls.right.isDown){
			this.player.body.velocity.x = -GameConfig.PLAYER_SPEED;
			movingX = true;
		} else
		if(this.controls.right.isDown && !this.controls.left.isDown){
			this.player.body.velocity.x = GameConfig.PLAYER_SPEED;
			movingX = true;
		}

		if(this.controls.up.isDown && !this.controls.down.isDown){
			this.player.body.velocity.y = -GameConfig.PLAYER_SPEED;
			movingY = true;
		} else
		if(this.controls.down.isDown && !this.controls.up.isDown){
			this.player.body.velocity.y = GameConfig.PLAYER_SPEED;
			movingY = true;
		}

		// se movendo em dois eixos, limitar ao ultimo pressionado
		if(movingX && movingY){
			if(this.player.lastDirection === 'x'){
				this.player.body.velocity.y = 0;
			} else {
				this.player.body.velocity.x = 0;
			}
		} else
		if(movingX){
			this.player.lastDirection = 'x';
		} else
		if(movingY){
			this.player.lastDirection = 'y';
		}

		// animacao
		if(this.player.body.velocity.x < 0){
			this.player.animations.play('goLeft');
		} else if(this.player.body.velocity.x > 0){
			this.player.animations.play('goRight');
		} else if(this.player.body.velocity.y < 0){
			this.player.animations.play('goUp');
		} else if(this.player.body.velocity.y > 0){
			this.player.animations.play('goDown');
		} else {
			this.player.animations.stop();
		}
	},

	moveEnemy: function(){
		var tileSize = GameConfig.TILE_SIZE;
		var enemyCol = Math.floor(this.enemy.x / tileSize);
		var enemyRow = Math.floor(this.enemy.y / tileSize);
		var centerX = enemyCol * tileSize + tileSize / 2;
		var centerY = enemyRow * tileSize + tileSize / 2;
		var speed = GameConfig.ENEMY_SPEED * game.time.physicsElapsed;

		if(!this.enemy.processedIntersection){
			if(Math.abs(this.enemy.x - centerX) < speed + 1 && Math.abs(this.enemy.y - centerY) < speed + 1){
				this.enemy.x = centerX;
				this.enemy.y = centerY;
				this.enemy.processedIntersection = true;

				var validPath = [];

				if(this.maze[enemyRow][enemyCol - 1] !== 1 && this.enemy.direction !== 'RIGHT'){
					validPath.push('LEFT');
				}
				if(this.maze[enemyRow][enemyCol + 1] !== 1 && this.enemy.direction !== 'LEFT'){
					validPath.push('RIGHT');
				}
				if(this.maze[enemyRow - 1] !== undefined && this.maze[enemyRow - 1][enemyCol] !== 1 && this.enemy.direction !== 'DOWN'){
					validPath.push('UP');
				}
				if(this.maze[enemyRow + 1] !== undefined && this.maze[enemyRow + 1][enemyCol] !== 1 && this.enemy.direction !== 'UP'){
					validPath.push('DOWN');
				}

				if(validPath.length > 0){
					this.enemy.direction = validPath[Math.floor(Math.random() * validPath.length)];
				} else {
					switch(this.enemy.direction){
						case 'LEFT': this.enemy.direction = 'RIGHT'; break;
						case 'RIGHT': this.enemy.direction = 'LEFT'; break;
						case 'UP': this.enemy.direction = 'DOWN'; break;
						case 'DOWN': this.enemy.direction = 'UP'; break;
					}
				}
			}
		}

		if(this.enemy.processedIntersection){
			var dx = Math.abs(this.enemy.x - centerX);
			var dy = Math.abs(this.enemy.y - centerY);
			if(dx > tileSize * 0.4 || dy > tileSize * 0.4){
				this.enemy.processedIntersection = false;
			}
		}

		switch(this.enemy.direction){
			case 'LEFT':
				this.enemy.x -= speed;
				this.enemy.animations.play('goLeft');
				break;
			case 'RIGHT':
				this.enemy.x += speed;
				this.enemy.animations.play('goRight');
				break;
			case 'UP':
				this.enemy.y -= speed;
				this.enemy.animations.play('goUp');
				break;
			case 'DOWN':
				this.enemy.y += speed;
				this.enemy.animations.play('goDown');
				break;
		}
	},

	getCoin: function(){
		this.emitter.x = this.coin.position.x;
		this.emitter.y = this.coin.position.y;
		this.emitter.start(true, 2000, null, 20);

		if(SettingsManager.get('sfx')) this.sndCoin.play();

		this.coins++;
		this.txtCoins.text = 'MOEDAS: ' + Utils.formatNumber(this.coins, 3);
		this.coin.position = this.newPosition();
	},

	loseCoin: function(){
		if(SettingsManager.get('sfx')) this.sndLoserCoin.play();

		this.emitter.x = this.player.position.x;
		this.emitter.y = this.player.position.y;
		this.emitter.start(true, 2000, null, 20);

		PlayerData.recordDeath();
		PlayerData.recordGame(this.coins, this.gameTime);

		game.state.start('end', true, false, { score: this.coins, time: this.gameTime });
	},

	newPosition: function(){
		var pos;
		do {
			pos = this.coinPositions[Math.floor(Math.random() * this.coinPositions.length)];
		} while(this.coin.position && pos.x === this.coin.position.x && pos.y === this.coin.position.y);
		return pos;
	},

	playTick: function(){
		if(!SettingsManager.get('sfx')) return;
		var tick = game.add.audio('getitem');
		tick.volume = 0.2;
		tick.play();
	},

	shutdown: function(){
		if(this.music) this.music.stop();
	}

};
