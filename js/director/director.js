var Director = {

	difficulty: 1,

	// retorna o pacote completo da partida para o estagio solicitado.
	// O Director carrega os dados brutos do StageData e os enriquece
	// com decisoes em tempo real: quantos goblins, posicao da chave,
	// posicao da porta. GameStage apenas executa o pacote recebido.
	getStage: function(stageNumber) {
		var variation = this.pickVariation(stageNumber);
		return this.buildStageData(variation, stageNumber);
	},

	// escolhe uma variacao aleatoria para o estagio solicitado.
	// as variacoes sao registradas como dados puros no StageData.
	// O Diretor do caos decide qual vai rolar.
	pickVariation: function(stageNumber) {
		var variations = StageData.getVariations(stageNumber);

		// fallback seguranca: se nao ha dados registrados
		if(variations.length === 0){
			variations = [this._getFallbackVariation(stageNumber)];
		}

		var validVariations = [];
		for(var i = 0; i < variations.length; i++){
			if(variations[i].map.length > 0){
				validVariations.push(variations[i]);
			}
		}

		if(validVariations.length === 0){
			validVariations = [this._getFallbackVariation(stageNumber)];
		}

		var index = Math.floor(Math.random() * validVariations.length);
		return validVariations[index];
	},

	// monta o pacote final da partida que o GameStage vai consumir.
	// o mapa textual e convertido para numerico aqui mesmo.
	// a posicao da chave e porta sao decididas em tempo real.
	buildStageData: function(variation, stageNumber) {
		var parsed = MapParser.parse(variation.map);
		var maze = parsed.maze;

		var coinCount = variation.coinCount;
		var enemyCount = this.getGoblinCount();

		var walkable = this.getWalkableTiles(maze);

		var positions = this.placeItems(walkable, variation, enemyCount, maze);

		return {
			stageId: stageNumber,
			stageName: variation.name,
			variation: variation.id,
			variationName: variation.name,
			difficulty: this.difficulty,
			enemyCount: enemyCount,
			coinCount: coinCount,
			timeLimit: variation.timeLimit || GameConfig.TIME_LIMIT,
			musicKey: variation.musicKey,
			enemySpawns: variation.enemySpawns.slice(0, enemyCount),
			enemyType: variation.enemyType,
			keyPosition: positions.keyPosition,
			doorPosition: positions.doorPosition,
			data: {
				maze: maze
			}
		};
	},

	// retorna todas as tiles walkable (0, 2, 3) como coordenadas de tile
	getWalkableTiles: function(maze) {
		var tiles = [];
		for(var r = 0; r < maze.length; r++){
			for(var c = 0; c < maze[r].length; c++){
				var tile = maze[r][c];
				if(tile !== 1){
					tiles.push({ row: r, col: c });
				}
			}
		}
		return tiles;
	},

	// posiciona a chave e a porta em tiles walkable validos.
	placeItems: function(walkable, variation, enemyCount, maze) {
		var enemySpawns = variation.enemySpawns || [];

		var occupied = {};

		for(var r = 0; r < maze.length; r++){
			for(var c = 0; c < maze[r].length; c++){
				if(maze[r][c] === 2){
					occupied[r + ',' + c] = true;
				}
			}
		}

		for(var s = 0; s < Math.min(enemySpawns.length, enemyCount); s++){
			occupied[enemySpawns[s].row + ',' + enemySpawns[s].col] = true;
		}

		var doorPosition;
		if(variation.doorPosition){
			doorPosition = variation.doorPosition;
			occupied[doorPosition.row + ',' + doorPosition.col] = true;
		}

		var freeTiles = [];
		for(var i = 0; i < walkable.length; i++){
			var key = walkable[i].row + ',' + walkable[i].col;
			if(!occupied[key]){
				freeTiles.push(walkable[i]);
			}
		}

		for(var i = freeTiles.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * (i + 1));
			var temp = freeTiles[i];
			freeTiles[i] = freeTiles[j];
			freeTiles[j] = temp;
		}

		var keyPosition = freeTiles[0] || { row: 1, col: 1 };

		occupied[keyPosition.row + ',' + keyPosition.col] = true;

		if(!doorPosition){
			doorPosition = this.pickDoorPosition(maze, occupied, freeTiles, maze.length, maze[0].length);
		}

		return {
			keyPosition: keyPosition,
			doorPosition: doorPosition
		};
	},

	// escolhe a posicao da porta usando marcadores 4 do mapa.
	pickDoorPosition: function(maze, occupied, freeTiles, rows, cols) {
		var anchors = [];
		for(var r = 0; r < maze.length; r++){
			for(var c = 0; c < maze[r].length; c++){
				if(maze[r][c] !== 4) continue;
				if(occupied[r + ',' + c]) continue;
				if(r === 0 || maze[r - 1][c] !== 1) continue;
				if(r === rows - 1 || maze[r + 1][c] === 1) continue;
				anchors.push({ row: r, col: c });
			}
		}

		if(anchors.length > 0){
			return anchors[Math.floor(Math.random() * anchors.length)];
		}

		for(var i = 0; i < freeTiles.length; i++){
			var r = freeTiles[i].row;
			var c = freeTiles[i].col;
			if(occupied[r + ',' + c]) continue;
			if(r > 0 && maze[r - 1][c] === 1 && r < rows - 1 && maze[r + 1][c] !== 1) return { row: r, col: c };
		}

		return { row: 1, col: 1 };
	},

	// quantidade de goblins: decisao em tempo real.
	getGoblinCount: function() {
		return Math.random() < 0.5 ? 3 : 4;
	},

	// fallback para quando nao ha dados registrados.
	_getFallbackVariation: function(stageNumber) {
		return {
			id: 'fallback_' + stageNumber,
			name: 'Stage ' + stageNumber,
			musicKey: 'music1',
			enemyType: 'goblin',
			coinCount: 4,
			timeLimit: GameConfig.TIME_LIMIT,
			enemySpawns: [
				{ row: 1, col: 1 },
				{ row: 1, col: 19 },
				{ row: 9, col: 1 },
				{ row: 9, col: 19 }
			],
			map: [
				'#####################',
				'#S..................#',
				'#.##.###.###.###.##.#',
				'#...................#',
				'#.##.###.###.###.##.#',
				'#..................C#',
				'#.##.###.###.###.##.#',
				'#...................#',
				'#.##.###.###.###.##.#',
				'#..................C#',
				'#####################'
			]
		};
	}

};
