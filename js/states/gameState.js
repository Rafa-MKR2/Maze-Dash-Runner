var gameState = {

	hud: null,
	collisions: null,
	coinManager: null,
	keyDoor: null,

	init: function(data){
		if(data){
			this.persistedScore = data.score || 0;
			this.persistedTime = data.timeRemaining || GameConfig.TIME_LIMIT;
		} else {
			this.persistedScore = null;
			this.persistedTime = null;
		}
	},

	create: function(){
		SettingsManager.load();
		PlayerData.load();

		this._restoreScore();
		this._setupStage();
		this._setupCamera();
		this._setupEntities();
		this._setupAudio();
		this._setupUI();

		var self = this;
		this.collisions = new CollisionManager({
			player: PlayerController,
			enemyManager: EnemyManager,
			coinManager: this.coinManager,
			blocks: this.blocks,
			callbacks: {
				onCoinCollect: function(x, y){
					ParticleEffects.burstAt(x, y);
					AudioManager.playCoin();
					self.coins++;
					self.timeRemaining = Math.min(self.timeRemaining + GameConfig.TIME_BONUS_PER_COIN, GameConfig.TIME_LIMIT);
					self.hud.updateCoins(self.coins);
					self.hud.showFloatingText(x, y, '+2s', '#44cc44');
				},
				onPlayerCaught: function(){
					if(self.coins >= GameConfig.GOBLIN_STEAL_COINS){
						AudioManager.playLose();
						self.coins -= GameConfig.GOBLIN_STEAL_COINS;
						self.score += GameConfig.GOBLIN_STEAL_COINS;
						self.hud.updateCoins(self.coins);
						self.hud.showFloatingText(PlayerController.sprite.x, PlayerController.sprite.y, '-' + GameConfig.GOBLIN_STEAL_COINS, '#ff4444');
						PlayerController.sprite.x = self._startPosition.x;
						PlayerController.sprite.y = self._startPosition.y;
						PlayerController.invulnTimer = GameConfig.INVULNERABILITY_AFTER_TELEPORT;
						game.camera.roundPx = false;
						return;
					}
					self.triggerGameOver();
				}
			}
		});

		this.keyDoor = new KeyDoorManager({
			onKeyCollected: function(x, y){
				ParticleEffects.burstAt(x, y);
				AudioManager.playCoin();
				self.coins++;
				self.hud.updateCoins(self.coins);
				self.hud.showKeyIcon();
				self.hud.showMessage('Uma porta foi destrancada!');
			},
			onStageComplete: function(){
				self._transitionNextStage();
			}
		});
		this.keyDoor.spawn(this._map.keyPosition, this._map.doorPosition, GameConfig.TILE_SIZE);

		this._map.data.maze[this._map.doorPosition.row][this._map.doorPosition.col] = 1;

		this.coins = 0;
		this.pauseCooldown = false;
	},

	update: function(){
		TouchControls.update();

		if(PauseUI.isPaused){
			PauseUI.update(PlayerController.controls);
			return;
		}

		if(this.keyDoor.isComplete()) return;

		this.timeRemaining -= game.time.physicsElapsed;
		if(this.timeRemaining <= 0){
			this.timeRemaining = 0;
			this.timeoutGameOver();
			return;
		}
		this.hud.updateTimer(this.timeRemaining);
		this.hud.updateStamina(PlayerController.stamina, PlayerController.maxStamina, PlayerController.isFatigued);

		if(PlayerController.escKey.isDown && !this.pauseCooldown){
			PauseUI.pause(PlayerController.sprite, EnemyManager.sprites);
			this.pauseCooldown = true;
			game.time.events.add(300, function(){ this.pauseCooldown = false; }, this);
			return;
		}

		this.collisions.update();
		this.keyDoor.update(PlayerController.sprite);

		if(this.keyDoor.isComplete()){
			PlayerController.stop();
			return;
		}

		PlayerController.update();
		EnemyManager.update(PlayerController.sprite, this.coinManager);
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
	},

	_restoreScore: function(){
		if(this.persistedScore !== null){
			this.score = this.persistedScore;
			this.timeRemaining = this.persistedTime;
		} else {
			this.score = 0;
			this.timeRemaining = GameConfig.TIME_LIMIT;
		}
	},

	_setupStage: function(){
		this._map = Director.getStage(1);
		var tileSize = GameConfig.TILE_SIZE;

		this._built = MapBuilder.build(this._map.data, tileSize);
		this.blocks = this._built.blocks;
		this._startPosition = this._built.startPosition;

		PlayerController.create(this._built.startPosition.x, this._built.startPosition.y);
	},

	_setupCamera: function(){
		var tileSize = GameConfig.TILE_SIZE;
		var mapWidth = this._map.data.maze[0].length * tileSize;
		var mapHeight = this._map.data.maze.length * tileSize;
		game.world.setBounds(0, 0, mapWidth, mapHeight);
		game.camera.follow(PlayerController.sprite, Phaser.Camera.FOLLOW_LOCKON);
		game.camera.setBoundsToWorld();
	},

	_setupEntities: function(){
		EnemyManager.create(this._map.enemySpawns, this._map.enemyType, this._map.data.maze);

		var keyR = this._map.keyPosition.row;
		var keyC = this._map.keyPosition.col;
		var doorR = this._map.doorPosition.row;
		var doorC = this._map.doorPosition.col;

		var cleanPositions = [];
		for(var i = 0; i < this._built.walkablePositions.length; i++){
			var pos = this._built.walkablePositions[i];
			var row = Math.floor(pos.y / GameConfig.TILE_SIZE);
			var col = Math.floor(pos.x / GameConfig.TILE_SIZE);
			if(row === keyR && col === keyC) continue;
			if(row === doorR && col === doorC) continue;
			cleanPositions.push(pos);
		}

		this.coinManager = new CoinManager(this._map.data.maze, cleanPositions);
		this.coinManager.spawn(this._map.coinCount);
	},

	_setupAudio: function(){
		AudioManager.init(this._map.musicKey);
		ParticleEffects.init();
	},

	_setupUI: function(){
		PauseUI.create({
			onResume: function(){ AudioManager.resume(); },
			onRestart: function(){ AudioManager.stop(); game.state.start('game'); },
			onQuit: function(){ AudioManager.stop(); game.state.start('menu'); }
		});

		this.hud = new StageHUD();
		this.hud.create({
			coins: 0,
			score: this.score,
			time: this.timeRemaining,
			stamina: PlayerController.maxStamina,
			maxStamina: PlayerController.maxStamina
		});
	},

	_transitionNextStage: function(){
		this.hud.hideKeyIcon();

		game.state.start('game', true, false, {
			score: this.score,
			timeRemaining: this.timeRemaining
		});
	}

};
