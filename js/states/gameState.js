var gameState = {

	hud: null,
	collisions: null,
	coinManager: null,
	keyDoor: null,

	init: function(data){
		if(data){
			this.persistedScore = data.score || 0;
			this.persistedPoints = data.points || 0;
			this.persistedCoins = data.coins || 0;
		} else {
			this.persistedScore = null;
			this.persistedPoints = null;
			this.persistedCoins = null;
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

		this.keyDoor = new KeyDoorManager({
			onKeyCollected: this._onKeyCollected.bind(this),
			onDoorTouch: function(){
				AudioManager.stop();
				AudioManager.playWin();
			},
			onStageComplete: this._onStageComplete.bind(this)
		});
		this.keyDoor.spawn(this._map.keyPosition, this._map.doorPosition, GameConfig.TILE_SIZE);

		var dr = this._map.doorPosition.row;
		var dc = this._map.doorPosition.col;
		this._map.data.maze[dr][dc] = 1;
		window._doorRow = dr;
		window._doorCol = dc;

		this._setupUI();

		this.collisions = new CollisionManager({
			player: PlayerController,
			enemyManager: EnemyManager,
			coinManager: this.coinManager,
			blocks: this.blocks,
			callbacks: {
				onCoinCollect: this._onCoinCollect.bind(this),
				onPlayerCaught: this._onPlayerCaught.bind(this)
			}
		});

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
			this.points = this.persistedPoints;
			this.coins = this.persistedCoins;
		} else {
			this.score = 0;
			this.points = 0;
			this.coins = 0;
		}
		this.timeRemaining = GameConfig.TIME_LIMIT;
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
		var self = this;
		EnemyManager.create(this._map.enemySpawns, this._map.enemyType, this._map.data.maze, function(){
			self.points += 5;
			self.hud.updateScore(self.points);
		});

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
		var self = this;
		PauseUI.create({
			onResume: function(){
				AudioManager.resume();
				self.pauseCooldown = true;
				game.time.events.add(300, function(){ self.pauseCooldown = false; });
			},
			onRestart: function(){ AudioManager.stop(); game.state.start('game'); },
			onQuit: function(){ AudioManager.stop(); game.state.start('menu'); }
		});

		this.hud = new StageHUD();
		this.hud.create({
			coins: this.coins,
			score: this.points,
			time: this.timeRemaining,
			stamina: PlayerController.maxStamina,
			maxStamina: PlayerController.maxStamina
		});
		game.world.bringToTop(this.hud.group);

		var txtLevel = game.add.text(15, game.height - 20, this._map.stageName + ' - ' + this._map.variation, {
			font: '11px ' + GameConfig.UI_FONT, fill: '#aaa'
		});
		txtLevel.fixedToCamera = true;
		game.time.events.add(4000, function(){
			game.add.tween(txtLevel).to({ alpha: 0 }, 500).start().onComplete.add(function(){
				txtLevel.destroy();
			});
		});
	},

	_onCoinCollect: function(x, y){
		ParticleEffects.burstAt(x, y);
		AudioManager.playCoin();
		this.coins++;
		this.points += 23;
		this.timeRemaining = Math.min(this.timeRemaining + GameConfig.TIME_BONUS_PER_COIN, GameConfig.TIME_LIMIT);
		this.hud.updateCoins(this.coins);
		this.hud.updateScore(this.points);
		this.hud.showFloatingText(x, y, '+2s', '#44cc44');
	},

	_onPlayerCaught: function(){
		if(this.coins >= GameConfig.GOBLIN_STEAL_COINS){
			AudioManager.playLose();
			this.coins -= GameConfig.GOBLIN_STEAL_COINS;
			this.score += GameConfig.GOBLIN_STEAL_COINS;
			this.points += 5;
			this.hud.updateCoins(this.coins);
			this.hud.updateScore(this.points);
			this.hud.showFloatingText(PlayerController.sprite.x, PlayerController.sprite.y, '-' + GameConfig.GOBLIN_STEAL_COINS, '#ff4444');
			PlayerController.sprite.x = this._startPosition.x;
			PlayerController.sprite.y = this._startPosition.y;
			PlayerController.invulnTimer = GameConfig.INVULNERABILITY_AFTER_TELEPORT;
			game.camera.roundPx = false;
			return;
		}
		this.triggerGameOver();
	},

	_onKeyCollected: function(x, y){
		ParticleEffects.burstAt(x, y);
		AudioManager.playCoin();
		this.points += 100;
		this.hud.updateScore(this.points);
		this.hud.showKeyIcon();
		this.hud.showMessage('Uma porta foi destrancada!');
	},

	_onStageComplete: function(){
		this._transitionNextStage();
	},

	_transitionNextStage: function(){
		this.hud.hideKeyIcon();

		game.state.start('game', true, false, {
			score: this.score,
			points: this.points,
			coins: this.coins
		});
	}

};
