var GoblinAI = function(maze, enemy, onLostPlayer){
	this.maze = maze;
	this.enemy = enemy;
	this.state = 'PATROL';
	this.speed = GameConfig.ENEMY_SPEED;
	this.hintTimer = 0;
	this.hintUsed = false;
	this.onLostPlayer = onLostPlayer || function(){};
	this.onLongChase = function(){};
	this.chaseTimer = 0;
	this.speedBoosted = false;
	this.alertTarget = null;
	this.alertTimer = 0;
};

GoblinAI.prototype = {

	update: function(player, coinManager){
		this.player = player;
		this.coinManager = coinManager;
		this.checkVision();
		this.checkCoinVision();
		this.updateState();
		this.updateHint();
		this.updateChaseTimer();
		this.move();
	},

	checkVision: function(){
		var tileSize = GameConfig.TILE_SIZE;
		var maxDist = this.state === 'ALERT' ? GameConfig.GOBLIN_VISION_DISTANCE * 2 : GameConfig.GOBLIN_VISION_DISTANCE;
		var goblinCol = Math.floor(this.enemy.x / tileSize);
		var goblinRow = Math.floor(this.enemy.y / tileSize);
		var playerCol = Math.floor(this.player.x / tileSize);
		var playerRow = Math.floor(this.player.y / tileSize);

		var dx = this.player.x - this.enemy.x;
		var dy = this.player.y - this.enemy.y;
		var distance = Math.sqrt(dx * dx + dy * dy);

		if(distance > maxDist){
			this.canSeePlayer = false;
			return;
		}

		switch(this.enemy.direction){
			case 'LEFT':  if(dx >= 0){ this.canSeePlayer = false; return; } break;
			case 'RIGHT': if(dx <= 0){ this.canSeePlayer = false; return; } break;
			case 'UP':    if(dy >= 0){ this.canSeePlayer = false; return; } break;
			case 'DOWN':  if(dy <= 0){ this.canSeePlayer = false; return; } break;
		}

		if(goblinRow !== playerRow && goblinCol !== playerCol){
			this.canSeePlayer = false;
			return;
		}

		if(!this.checkLineOfSight(goblinRow, goblinCol, playerRow, playerCol)){
			this.canSeePlayer = false;
			return;
		}

		this.canSeePlayer = true;
	},

	checkCoinVision: function(){
		this.targetCoin = null;
		if(!this.coinManager) return;

		var nearest = this.coinManager.getNearestActive(this.enemy.x, this.enemy.y);
		if(!nearest) return;

		var tileSize = GameConfig.TILE_SIZE;
		var goblinCol = Math.floor(this.enemy.x / tileSize);
		var goblinRow = Math.floor(this.enemy.y / tileSize);
		var coinCol = Math.floor(nearest.x / tileSize);
		var coinRow = Math.floor(nearest.y / tileSize);

		var dx = nearest.x - this.enemy.x;
		var dy = nearest.y - this.enemy.y;

		// moedas so sao visiveis na direcao que o goblin esta andando
		switch(this.enemy.direction){
			case 'LEFT':  if(dx >= 0) return; break;
			case 'RIGHT': if(dx <= 0) return; break;
			case 'UP':    if(dy >= 0) return; break;
			case 'DOWN':  if(dy <= 0) return; break;
		}

		if(goblinRow !== coinRow && goblinCol !== coinCol) return;

		if(!this.checkLineOfSight(goblinRow, goblinCol, coinRow, coinCol)) return;

		this.targetCoin = nearest;
	},

	// verifica se nao ha paredes entre dois pontos na mesma linha/coluna
	_isDoorTile: function(row, col){
		return window._doorRow === row && window._doorCol === col;
	},

	checkLineOfSight: function(fromRow, fromCol, toRow, toCol){
		if(fromRow === toRow){
			var step = fromCol < toCol ? 1 : -1;
			var c = fromCol + step;
			while(c !== toCol){
				if(this.maze[fromRow][c] === 1) return false;
				c += step;
			}
		} else {
			var step = fromRow < toRow ? 1 : -1;
			var r = fromRow + step;
			while(r !== toRow){
				if(this.maze[r][fromCol] === 1) return false;
				r += step;
			}
		}
		return true;
	},

	updateState: function(){
		if(this.canSeePlayer){
			if(this.state !== 'CHASE'){
				if(this.state === 'ALERT') this.exitAlert();
				this.enterChase();
			}
		} else
		if(this.state === 'CHASE'){
			this.exitChase();
		} else
		if(this.state === 'ALERT'){
			this.alertTimer += game.time.physicsElapsed;
			if(this.alertTimer >= GameConfig.GOBLIN_ALERT_DURATION || this._atAlertTarget()){
				this.exitAlert();
			}
		} else
		if(this.targetCoin){
			if(this.state !== 'COLLECT') this.enterCollect();
		} else
		if(this.state === 'COLLECT'){
			this.exitCollect();
		}
	},

	enterChase: function(){
		this.state = 'CHASE';
		this.speed = GameConfig.GOBLIN_CHASE_SPEED;
		this.hintTimer = 0;
		this.hintUsed = false;
		this.targetCoin = null;
		this.chaseTimer = 0;
		this.speedBoosted = false;
		this.alertTarget = null;
	},

	exitChase: function(){
		this.hintTimer = 0;
		this.hintUsed = false;
		this.enemy.processedIntersection = false;
		this.chaseTimer = 0;
		this.speedBoosted = false;
		this.onLostPlayer();
		this.enterAlert(this.player.x, this.player.y);
	},

	enterCollect: function(){
		this.state = 'COLLECT';
		this.speed = GameConfig.ENEMY_SPEED;
		this.enemy.processedIntersection = false;
	},

	exitCollect: function(){
		this.state = 'PATROL';
		this.speed = GameConfig.ENEMY_SPEED;
		this.enemy.processedIntersection = false;
	},

	updateHint: function(){
		if(this.state !== 'PATROL') return;

		this.hintTimer += game.time.physicsElapsed;

		if(this.hintTimer >= GameConfig.GOBLIN_HINT_INTERVAL){
			this.hintTimer = 0;
			this.hintUsed = true;
		}
	},

	updateChaseTimer: function(){
		if(this.state === 'CHASE'){
			this.chaseTimer += game.time.physicsElapsed;
			if(this.chaseTimer >= GameConfig.GOBLIN_LONG_CHASE_TIME && !this.speedBoosted){
				this.speedBoosted = true;
				this.speed = GameConfig.GOBLIN_CHASE_BOOST_SPEED;
				this.onLongChase(this.player.x, this.player.y);
			}
		}
	},

	enterAlert: function(x, y){
		this.state = 'ALERT';
		this.speed = GameConfig.ENEMY_SPEED;
		this.hintTimer = 0;
		this.hintUsed = false;
		this.alertTarget = { x: x, y: y };
		this.alertTimer = 0;
	},

	exitAlert: function(){
		this.state = 'PATROL';
		this.speed = GameConfig.ENEMY_SPEED;
		this.alertTarget = null;
		this.hintTimer = 0;
		this.hintUsed = false;
	},

	_atAlertTarget: function(){
		if(!this.alertTarget) return true;
		var dx = Math.abs(this.enemy.x - this.alertTarget.x);
		var dy = Math.abs(this.enemy.y - this.alertTarget.y);
		return dx < GameConfig.TILE_SIZE * 0.8 && dy < GameConfig.TILE_SIZE * 0.8;
	},

	setAlertTarget: function(x, y){
		this.alertTarget = { x: x, y: y };
	},

	setLongChaseCallback: function(cb){
		this.onLongChase = cb;
	},

	move: function(){
		var tileSize = GameConfig.TILE_SIZE;
		var enemyCol = Math.floor(this.enemy.x / tileSize);
		var enemyRow = Math.floor(this.enemy.y / tileSize);
		var centerX = enemyCol * tileSize + tileSize / 2;
		var centerY = enemyRow * tileSize + tileSize / 2;
		var speed = this.speed * game.time.physicsElapsed;

		if(!this.enemy.processedIntersection){
			if(Math.abs(this.enemy.x - centerX) < speed + 1 && Math.abs(this.enemy.y - centerY) < speed + 1){
				this.enemy.x = centerX;
				this.enemy.y = centerY;
				this.enemy.processedIntersection = true;

				if(this.state === 'CHASE'){
					this.chooseChaseDirection();
				} else
				if(this.state === 'COLLECT'){
					this.chooseCollectDirection();
				} else {
					this.choosePatrolDirection();
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

	// --- DIRECOES ---

	getValidPaths: function(){
		var tileSize = GameConfig.TILE_SIZE;
		var col = Math.floor(this.enemy.x / tileSize);
		var row = Math.floor(this.enemy.y / tileSize);
		var paths = [];

		if(this._isWalkable(row, col - 1) && this.enemy.direction !== 'RIGHT'){
			paths.push('LEFT');
		}
		if(this._isWalkable(row, col + 1) && this.enemy.direction !== 'LEFT'){
			paths.push('RIGHT');
		}
		if(this.maze[row - 1] !== undefined && this._isWalkable(row - 1, col) && this.enemy.direction !== 'DOWN'){
			paths.push('UP');
		}
		if(this.maze[row + 1] !== undefined && this._isWalkable(row + 1, col) && this.enemy.direction !== 'UP'){
			paths.push('DOWN');
		}

		return this.filterDoorPaths(row, col, paths);
	},

	_isWalkable: function(row, col){
		var tile = this.maze[row][col];
		if(tile !== 1) return true;
		return this._isDoorTile(row, col);
	},

	filterDoorPaths: function(row, col, paths){
		if(this.canSeePlayer) return paths;

		var filtered = [];
		for(var i = 0; i < paths.length; i++){
			var nextRow = row;
			var nextCol = col;
			switch(paths[i]){
				case 'LEFT':  nextCol--; break;
				case 'RIGHT': nextCol++; break;
				case 'UP':    nextRow--; break;
				case 'DOWN':  nextRow++; break;
			}
			if(!this._isDoorTile(nextRow, nextCol)){
				filtered.push(paths[i]);
			}
		}
		return filtered;
	},

	// PATROL: direcao aleatoria, ou dica do player, ou alerta de posicao
	choosePatrolDirection: function(){
		if(this.alertTarget){
			this.chooseDirectionToward(this.alertTarget.x, this.alertTarget.y);
			return;
		}
		if(this.hintUsed){
			this.hintUsed = false;
			this.chooseChaseDirection();
			return;
		}
		var paths = this.getValidPaths();
		if(paths.length > 0){
			this.enemy.direction = paths[Math.floor(Math.random() * paths.length)];
		} else {
			this.reverseDirection();
		}
	},

	// CHASE: direcao que mais se aproxima do jogador
	// CHASE: direcao que mais se aproxima do jogador
	chooseChaseDirection: function(){
		this.chooseDirectionToward(this.player.x, this.player.y);
	},

	// COLLECT: direcao que mais se aproxima da moeda alvo
	// COLLECT: direcao que mais se aproxima da moeda alvo
	chooseCollectDirection: function(){
		if(!this.targetCoin || !this.targetCoin.active){
			this.exitCollect();
			return;
		}
		this.chooseDirectionToward(this.targetCoin.x, this.targetCoin.y);
	},

	// logica compartilhada: escolhe a direcao que mais se aproxima de um alvo
	chooseDirectionToward: function(targetX, targetY){
		var tileSize = GameConfig.TILE_SIZE;
		var paths = this.getValidPaths();
		if(paths.length === 0){
			this.reverseDirection();
			return;
		}

		var col = Math.floor(this.enemy.x / tileSize);
		var row = Math.floor(this.enemy.y / tileSize);
		var targetCol = Math.floor(targetX / tileSize);
		var targetRow = Math.floor(targetY / tileSize);

		var bestDir = paths[0];
		var bestDist = Infinity;

		for(var i = 0; i < paths.length; i++){
			var nextRow = row;
			var nextCol = col;
			switch(paths[i]){
				case 'LEFT':  nextCol--; break;
				case 'RIGHT': nextCol++; break;
				case 'UP':    nextRow--; break;
				case 'DOWN':  nextRow++; break;
			}
			var dist = Math.abs(nextRow - targetRow) + Math.abs(nextCol - targetCol);
			if(dist < bestDist){
				bestDist = dist;
				bestDir = paths[i];
			}
		}

		this.enemy.direction = bestDir;
	},

	reverseDirection: function(){
		switch(this.enemy.direction){
			case 'LEFT':  this.enemy.direction = 'RIGHT'; break;
			case 'RIGHT': this.enemy.direction = 'LEFT';  break;
			case 'UP':    this.enemy.direction = 'DOWN';  break;
			case 'DOWN':  this.enemy.direction = 'UP';    break;
		}
	},

	getState: function(){
		return this.state;
	},

	getSpeed: function(){
		return this.speed;
	}

};
