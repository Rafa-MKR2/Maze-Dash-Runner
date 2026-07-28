var Director = {

	difficulty: 1,

	// retorna o pacote completo da partida para o estágio solicitado.
	// o Director escolhe a variação, quantidade de moedas,
	// goblins e música. Tudo manualmente desenhado, sem procedural.
	// GameStage apenas recebe esse objeto e executa a partida.
	getStage: function(stageNumber) {
		var variation = this.pickVariation(stageNumber);
		return this.buildStageData(variation, stageNumber);
	},

	// escolhe uma variação aleatória para o estágio solicitado.
	// no futuro pode levar em conta dificuldade, histórico do jogador,
	// hora do dia, ou qualquer outra "vibe" do Director.
	// por enquanto é só sorteio simples.
	pickVariation: function(stageNumber) {
		var variations;

		switch(stageNumber) {
			case 1:
				variations = [
					Variation01,
					Variation02,
					Variation03
				];
				break;
			case 2:
				variations = [
					Variation01_Stage02
				];
				break;
			default:
				variations = [Variation01];
		}

		// Diretor do caos.
		// Hoje resolveu pegar leve.
		// Talvez.
		// Variações com maze vazio são ignoradas automaticamente.
		var validVariations = [];
		for(var i = 0; i < variations.length; i++){
			if(variations[i].maze.length > 0){
				validVariations.push(variations[i]);
			}
		}

		var index = Math.floor(Math.random() * validVariations.length);
		return validVariations[index];
	},

	// monta o pacote final da partida que o GameStage vai consumir.
	// o mapa textual (se houver) e convertido para numerico aqui mesmo,
	// antes de qualquer logica de gameplay — Director, GoblinAI, colisoes
	// e renderizacao so enxergam arrays de inteiros.
	buildStageData: function(variation, stageNumber) {
		var parsed = MapParser.parse(variation.maze);
		var maze = parsed.maze;

		var coinCount = variation.coinCount;
		var enemyCount = this.getGoblinCount();

		var walkable = this.getWalkableTiles(maze);

		var positions = this.placeItems(walkable, variation, enemyCount, maze);

		return {
			stageId: stageNumber,
			stageName: this.getStageName(stageNumber),
			variation: variation.name,
			difficulty: this.difficulty,
			enemyCount: enemyCount,
			coinCount: coinCount,
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
				if(tile !== 1){ // nao parede
					tiles.push({ row: r, col: c });
				}
			}
		}
		return tiles;
	},

	// posiciona a chave e a porta em tiles walkable validos.
	// a chave usa um tile livre.
	// a porta ocupa 1 tile (50x50), marcado com 4 no maze.
	// evita sobrepor com posicao do jogador, spawns de inimigos
	// e quaisquer outras restricoes do Director.
	placeItems: function(walkable, variation, enemyCount, maze) {
		maze = maze || variation.maze;
		var enemySpawns = variation.enemySpawns || [];

		// tiles ocupados (jogador, goblins)
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

		// tiles walkable livres
		var freeTiles = [];
		for(var i = 0; i < walkable.length; i++){
			var key = walkable[i].row + ',' + walkable[i].col;
			if(!occupied[key]){
				freeTiles.push(walkable[i]);
			}
		}

		// seleciona posicao da chave (qualquer tile livre)
		for(var i = freeTiles.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * (i + 1));
			var temp = freeTiles[i];
			freeTiles[i] = freeTiles[j];
			freeTiles[j] = temp;
		}

		var keyPosition = freeTiles[0] || { row: 1, col: 1 };

		// bloqueia o tile da chave pra porta nunca sobrepor
		occupied[keyPosition.row + ',' + keyPosition.col] = true;

		// seleciona posicao da porta: usa marcadores 4 do maze.
		// a porta ocupa 1 tile (50x50). sem marcadores, fallback simples.
		var doorPosition = this.pickDoorPosition(maze, occupied, freeTiles, maze.length, maze[0].length);

		return {
			keyPosition: keyPosition,
			doorPosition: doorPosition
		};
	},

	// escolhe a posicao da porta usando marcadores 4 do mapa.
	// cada 4 precisa ter parede ACIMA (r-1 = 1) e piso ABAIXO
	// walkavel (r+1 != 1) — acesso exclusivo por baixo.
	// sem marcadores, faz fallback com as mesmas exigencias.
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

		// fallback: primeiro tile com parede acima e piso abaixo
		for(var i = 0; i < freeTiles.length; i++){
			var r = freeTiles[i].row;
			var c = freeTiles[i].col;
			if(occupied[r + ',' + c]) continue;
			if(r > 0 && maze[r - 1][c] === 1 && r < rows - 1 && maze[r + 1][c] !== 1) return { row: r, col: c };
		}

		return { row: 1, col: 1 };
	},

	// quantidade de goblins.
	// escolhe entre 3 e 4.
	// porque aparentemente um só não era suficiente.
	getGoblinCount: function() {
		return Math.random() < 0.5 ? 3 : 4;
	},

	getStageName: function(stageNumber) {
		var names = {
			1: 'Brick Maze',
			2: 'Big Maze'
		};
		return names[stageNumber] || 'Stage ' + stageNumber;
	}

};