// Stage1 - orquestrador da fase.
// Seu papel e apenas: carregar mapa, inicializar sistemas, atualizar sistemas.
// Toda logica especifica vive em modulos proprios.
var stage1State = {

	create: function(){
		SettingsManager.load();
		PlayerData.load();

		// carrega dados do mapa atual - trocar Stage01Data por outro mapa
		// permite criar novas fases sem alterar este arquivo
		var map = Stage01Data;
		var tileSize = GameConfig.TILE_SIZE;

		// constroi o labirinto: paredes, posicao do player, retorna grupo de blocos
		this.blocks = this.buildMap(map, tileSize);

		// inicializa player
		PlayerController.create(this.startPosition.x, this.startPosition.y);

		// inicializa inimigos - EnemyManager decide qual factory usar
		EnemyManager.create(map.enemySpawns, map.enemyType, map.maze);

		// inicializa moedas
		var tilePositions = this.getWalkablePositions(map.maze, tileSize);
		this.coinManager = new CoinManager(map.maze, tilePositions);
		this.coinManager.spawn(map.coinCount);

		// inicializa sistemas de suporte
		AudioManager.init(map.musicKey);
		ParticleEffects.init();

		// pausa - define o que cada acao faz
		PauseUI.create({
			onResume: function(){ AudioManager.resume(); },
			onRestart: function(){ AudioManager.stop(); game.state.start('stage1'); },
			onQuit: function(){ AudioManager.stop(); game.state.start('menu'); }
		});

		// placar e timer
		this.coins = 0;
		this.gameTime = 0;
		this.createHUD();
		this.pauseCooldown = false;

		// sincronizar estado de fullscreen quando muda externamente (ex: usuario apertou Escape)
		if(GameConfig.fullscreenEnabled && GameConfig.fullscreenChange){
			var self = this;
			document.addEventListener(GameConfig.fullscreenChange, function(){
				var isFs = !!GameConfig.fullscreenElement();
				SettingsManager.set('fullscreen', isFs);
				// atualizar UI do settings se estiver aberto
				if(SettingsOverlay && SettingsOverlay.isOpen){
					SettingsOverlay.updateValues();
				}
			});
		}
	},

	// constroi o labirinto a partir dos dados do mapa
	// retorna o grupo de blocos para colisao
	buildMap: function(map, tileSize){
		var maze = map.maze;

		game.add.sprite(0, 0, 'bg');

		var blocks = game.add.group();
		blocks.enableBody = true;

		for(var row = 0; row < maze.length; row++){
			for(var col = 0; col < maze[row].length; col++){
				var tile = maze[row][col];
				var x = col * tileSize;
				var y = row * tileSize;

				if(tile === 1){
					var block = blocks.create(x, y, 'block');
					block.body.immovable = true;
				} else
				if(tile === 2){
					this.startPosition = { x: x + tileSize / 2, y: y + tileSize / 2 };
				}
			}
		}

		return blocks;
	},

	// retorna posicoes walkable (sem parede, sem player) para spawn de moedas
	getWalkablePositions: function(maze, tileSize){
		var positions = [];
		for(var row = 0; row < maze.length; row++){
			for(var col = 0; col < maze[row].length; col++){
				if(maze[row][col] !== 1 && maze[row][col] !== 2){
					positions.push({
						x: col * tileSize + tileSize / 2,
						y: row * tileSize + tileSize / 2
					});
				}
			}
		}
		return positions;
	},

	// --- UPDATE ---

	update: function(){
		// quando pausado, delega input para o PauseUI e retorna
		if(PauseUI.isPaused){
			PauseUI.update(PlayerController.controls);
			return;
		}

		// timer
		this.gameTime += game.time.physicsElapsed;
		this.txtTimer.text = 'TEMPO: ' + Utils.formatTime(this.gameTime);

		// barra de estamina
		this.updateStaminaBar();

		// ESC para pausar
		if(PlayerController.escKey.isDown && !this.pauseCooldown){
			PauseUI.pause(PlayerController.sprite, EnemyManager.sprites);
			this.pauseCooldown = true;
			game.time.events.add(300, function(){ this.pauseCooldown = false; }, this);
			return;
		}

		// fisica e colisoes
		game.physics.arcade.collide(PlayerController.sprite, this.blocks);
		this.checkCoinCollisions();
		this.checkEnemyCollisions();

		// atualizar sistemas
		PlayerController.update();
		EnemyManager.update(PlayerController.sprite, this.coinManager);
	},

	// player coleta moedas
	checkCoinCollisions: function(){
		var coins = this.coinManager.coins;
		for(var i = 0; i < coins.length; i++){
			if(!coins[i].active) continue;
			game.physics.arcade.overlap(PlayerController.sprite, coins[i], this.playerCollectCoin, null, this);
		}
	},

	// goblins coletam moedas e tocam no player
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

	// --- CALLBACKS DE COLISAO ---

	playerCollectCoin: function(player, coin){
		var result = this.coinManager.collect(coin);
		if(!result.collected) return;

		ParticleEffects.burstAt(result.x, result.y);
		AudioManager.playCoin();

		this.coins++;
		this.txtCoins.text = 'MOEDAS: ' + Utils.formatNumber(this.coins, 3);
	},

	goblinCollectCoin: function(enemy, coin){
		this.coinManager.collect(coin);
	},

	loseCoin: function(){
		AudioManager.playLose();
		ParticleEffects.burstAt(PlayerController.sprite.x, PlayerController.sprite.y);

		PlayerData.recordDeath();
		PlayerData.recordGame(this.coins, this.gameTime);

		game.state.start('end', true, false, { score: this.coins, time: this.gameTime });
	},

	// --- HUD ---

	createHUD: function(){
		this.txtCoins = game.add.text(15, 15, 'MOEDAS: ' + Utils.formatNumber(this.coins, 3), {
			font: '15px emulogic', fill: '#fff'
		});

		this.txtTimer = game.add.text(game.width - 15, 15, 'TEMPO: 00:00', {
			font: '15px emulogic', fill: '#fff'
		});
		this.txtTimer.anchor.set(1, 0);

		// barra de estamina
		this.staminaBarBg = game.add.graphics();
		this.staminaBarBg.fixedToCamera = true;
		this.staminaBarFill = game.add.graphics();
		this.staminaBarFill.fixedToCamera = true;
		this.updateStaminaBar();
	},

	// atualiza a barra de estamina na HUD
	updateStaminaBar: function(){
		var barX = 15;
		var barY = 45;
		var barW = 120;
		var barH = 12;
		var ratio = PlayerController.stamina / PlayerController.maxStamina;

		// fundo
		this.staminaBarBg.clear();
		this.staminaBarBg.beginFill(0x000000, 0.6);
		this.staminaBarBg.drawRect(barX - 1, barY - 1, barW + 2, barH + 2);
		this.staminaBarBg.endFill();

		// preenchimento
		var fillColor = 0x44cc44;
		if(ratio < 0.33) fillColor = 0xcc4444;
		else if(ratio < 0.66) fillColor = 0xcccc44;

		this.staminaBarFill.clear();
		this.staminaBarFill.beginFill(fillColor);
		this.staminaBarFill.drawRect(barX, barY, barW * ratio, barH);
		this.staminaBarFill.endFill();
	},

	shutdown: function(){
		AudioManager.stop();
	}

};
