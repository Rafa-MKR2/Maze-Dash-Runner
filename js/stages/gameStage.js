var stage1State = {

	create: function(){
		SettingsManager.load();
		PlayerData.load();

		var map = Director.getStage(1);
		var tileSize = GameConfig.TILE_SIZE;

		var result = MapBuilder.build(map.data, tileSize);
		this.blocks = result.blocks;
		this.startPosition = result.startPosition;

		PlayerController.create(this.startPosition.x, this.startPosition.y);

		var mapWidth = map.data.maze[0].length * tileSize;
		var mapHeight = map.data.maze.length * tileSize;
		game.world.setBounds(0, 0, mapWidth, mapHeight);
		game.camera.follow(PlayerController.sprite, Phaser.Camera.FOLLOW_LOCKON);
		game.camera.setBoundsToWorld();

		EnemyManager.create(map.enemySpawns, map.enemyType, map.data.maze);

		var tilePositions = MapBuilder.getWalkablePositions(map.data.maze, tileSize);
		this.coinManager = new CoinManager(map.data.maze, tilePositions);
		this.coinManager.spawn(map.coinCount);

		AudioManager.init(map.musicKey);
		ParticleEffects.init();

		PauseUI.create({
			onResume: function(){ AudioManager.resume(); },
			onRestart: function(){ AudioManager.stop(); game.state.start('stage1'); },
			onQuit: function(){ AudioManager.stop(); game.state.start('menu'); }
		});

		this.coins = 0;
		this.score = 0;
		this.timeRemaining = GameConfig.TIME_LIMIT;
		this.hud = new StageHUD();
		this.hud.create(this.coins, this.score, this.timeRemaining);
		this.pauseCooldown = false;
	},

	update: function(){
		TouchControls.update();

		if(PauseUI.isPaused){
			PauseUI.update(PlayerController.controls);
			return;
		}

		this.timeRemaining -= game.time.physicsElapsed;
		if(this.timeRemaining <= 0){
			this.timeRemaining = 0;
			this.timeoutGameOver();
			return;
		}
		this.hud.updateTimer(this.timeRemaining);
		this.hud.updateStamina();

		if(PlayerController.escKey.isDown && !this.pauseCooldown){
			PauseUI.pause(PlayerController.sprite, EnemyManager.sprites);
			this.pauseCooldown = true;
			game.time.events.add(300, function(){ this.pauseCooldown = false; }, this);
			return;
		}

		game.physics.arcade.collide(PlayerController.sprite, this.blocks);
		this.checkCoinCollisions();
		this.checkEnemyCollisions();

		PlayerController.update();
		EnemyManager.update(PlayerController.sprite, this.coinManager);
	},

	checkCoinCollisions: function(){
		var coins = this.coinManager.coins;
		for(var i = 0; i < coins.length; i++){
			if(!coins[i].active) continue;
			game.physics.arcade.overlap(PlayerController.sprite, coins[i], this.playerCollectCoin, null, this);
		}
	},

	checkEnemyCollisions: function(){
		var coins = this.coinManager.coins;
		var enemies = EnemyManager.sprites;

		for(var i = 0; i < enemies.length; i++){
			var enemy = enemies[i];

			for(var j = 0; j < coins.length; j++){
				if(!coins[j].active) continue;
				game.physics.arcade.overlap(enemy, coins[j], this.goblinCollectCoin, null, this);
			}

			game.physics.arcade.overlap(PlayerController.sprite, enemy, this.loseCoin, null, this);
		}
	},

	playerCollectCoin: function(player, coin){
		var result = this.coinManager.collect(coin);
		if(!result.collected) return;

		ParticleEffects.burstAt(result.x, result.y);
		AudioManager.playCoin();

		this.coins++;
		this.hud.updateCoins(this.coins);

		this.timeRemaining = Math.min(this.timeRemaining + GameConfig.TIME_BONUS_PER_COIN, GameConfig.TIME_LIMIT);
		this.hud.showFloatingText(result.x, result.y, '+2s', '#44cc44');
	},

	goblinCollectCoin: function(enemy, coin){
		this.coinManager.collect(coin);
	},

	loseCoin: function(){
		if(PlayerController.invulnTimer > 0) return;

		if(this.coins >= GameConfig.GOBLIN_STEAL_COINS){
			AudioManager.playLose();
			this.coins -= GameConfig.GOBLIN_STEAL_COINS;
			this.score += GameConfig.GOBLIN_STEAL_COINS;
			this.hud.updateCoins(this.coins);
			this.hud.showFloatingText(PlayerController.sprite.x, PlayerController.sprite.y, '-' + GameConfig.GOBLIN_STEAL_COINS, '#ff4444');

			PlayerController.sprite.x = this.startPosition.x;
			PlayerController.sprite.y = this.startPosition.y;
			PlayerController.invulnTimer = GameConfig.INVULNERABILITY_AFTER_TELEPORT;
			game.camera.roundPx = false;
			return;
		}

		this.triggerGameOver();
	},

	timeoutGameOver: function(){
		this.triggerGameOver('timeout');
	},

	triggerGameOver: function(reason){
		AudioManager.playLose();
		ParticleEffects.burstAt(PlayerController.sprite.x, PlayerController.sprite.y);

		PlayerData.recordDeath();
		PlayerData.recordGame(this.coins, GameConfig.TIME_LIMIT - this.timeRemaining);

		var data = { score: this.coins, time: this.timeRemaining, thiefScore: this.score };
		if(reason) data.reason = reason;
		game.state.start('end', true, false, data);
	},

	shutdown: function(){
		AudioManager.stop();
	}

};
