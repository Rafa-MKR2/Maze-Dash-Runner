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
					Stage01Variation01,
					Stage01Variation02,
					Stage01Variation03
				];
				break;
			default:
				variations = [Stage01Variation01];
		}

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
	// informacoes de seleção ficam no nível superior.
	// o mapa original fica protegido dentro de data.
	// GameStage não precisa saber como a variação foi escolhida.
	buildStageData: function(variation, stageNumber) {
		var result = this.validateMap(variation);
		if(!result.valid){
			console.error('[Director] "' + variation.name + '" possui erros estruturais. Veja o console para detalhes.');
		}
		var coinCount = this.getCoinCount(variation);
		var enemyCount = this.getGoblinCount();

		// pega todas as posicoes walkable para spawn de itens
		var walkable = this.getWalkableTiles(variation.maze);

		// seleciona posicao para a chave e para a porta
		// ambas em tiles validos, sem sobrepor jogador ou inimigos
		var positions = this.placeItems(walkable, variation, enemyCount);

		return {
			stageId: stageNumber,
			variation: variation.name,
			difficulty: this.difficulty,
			enemyCount: enemyCount,
			coinCount: coinCount,
			musicKey: variation.musicKey,
			enemySpawns: this.selectSpawns(variation.enemySpawns, enemyCount),
			enemyType: variation.enemyType,
			keyPosition: positions.keyPosition,
			doorPosition: positions.doorPosition,
			data: variation
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
	// a porta precisa de 2 tiles horizontais livres (a porta tem 100px de largura
	// = 2 tiles de 50px), por isso verifica que ambos estao desocupados.
	// evita sobrepor com posicao do jogador, spawns de inimigos
	// e quaisquer outras restricoes do Director.
	placeItems: function(walkable, variation, enemyCount) {
		var maze = variation.maze;
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

		// seleciona posicao da porta: prefere extremidades de corredor
		// e becos sem saida (menos vizinhos walkable).
		// A porta precisa de 2 tiles horizontais livres consecutivos.
		// Ela representa a saida da fase, entao deve parecer
		// uma saida — nao bloquear circulacao principal nem aparecer
		// no meio de cruzamentos.
		var doorPosition = this.findBestDoorPosition(maze, occupied, walkable, maze.length, maze[0].length);

		return {
			keyPosition: keyPosition,
			doorPosition: doorPosition
		};
	},

	// encontra a melhor posicao para a porta dentre os tiles walkable livres.
	// A porta precisa de 2 tiles horizontais consecutivos livres.
	// Prefere posicoes com poucos vizinhos walkable livres —
	// ou seja, extremidades de corredor e becos sem saida —
	// onde a porta parece uma saída natural e nao bloqueia circulacao.
	findBestDoorPosition: function(maze, occupied, freeTiles, rows, cols) {
		var isFree = {};
		for(var i = 0; i < freeTiles.length; i++){
			isFree[freeTiles[i].row + ',' + freeTiles[i].col] = true;
		}

		var bestDoor = null;
		var bestScore = Infinity;

		for(var i = 0; i < freeTiles.length; i++){
			var r = freeTiles[i].row;
			var c = freeTiles[i].col;
			var cKey = r + ',' + c;

			if(occupied[cKey]) continue;

			// proximo tile a direita
			var nc = c + 1;
			if(nc >= cols) continue;
			var nKey = r + ',' + nc;
			if(occupied[nKey]) continue;
			if(maze[r][nc] === 1) continue;

		// ambos os tiles sao validos — calcula score
		// soma dos vizinhos walkable livres dos dois tiles
		// quanto menor o score, mais isolado o par = melhor candidato
		// bonus para tiles na borda do labirinto: a porta deve parecer
		// uma saida — aparece na extremidade do mapa, nao no meio do corredor
		var score = 0;
		var neighbors = [
			[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
			[r - 1, nc], [r + 1, nc], [r, nc - 1], [r, nc + 1]
		];
		for(var n = 0; n < neighbors.length; n++){
			var nr = neighbors[n][0];
			var nc2 = neighbors[n][1];
			if(nr < 0 || nr >= rows || nc2 < 0 || nc2 >= cols) continue;
			if(maze[nr][nc2] === 1) continue;
			var nk = nr + ',' + nc2;
			if(isFree[nk] || nk === cKey || nk === nKey) score++;
		}
		// bonus de borda: tiles proximos da parede externa recebem reducao no score
		if(r === 1 || r === rows - 2) score -= 2;
		if(c === 1 || c === cols - 2 || nc === cols - 2) score -= 2;

		if(score < bestScore){
				bestScore = score;
				bestDoor = { row: r, col: c };
			}
		}

		if(!bestDoor){
			bestDoor = { row: rows - 2, col: Math.max(0, cols - 3) };
		}

		return bestDoor;
	},

	// valida o mapa de uma variação e retorna um resultado estruturado.
	// usado apenas para desenvolvimento — não altera o mapa nem corrige nada.
	// o retorno prepara a API para futuras integrações (editor, testes automatizados, modo debug).
	//
	// Retorna:
	//   { valid: boolean, errors: [], warnings: [] }
	validateMap: function(variation) {
		var maze = variation.maze;
		var name = variation.name || '(sem nome)';
		var errors = [];
		var warnings = [];

		var expectedLen = maze[0] ? maze[0].length : 0;
		for(var i = 1; i < maze.length; i++){
			if(maze[i].length !== expectedLen){
				errors.push('Linha ' + i + ' possui ' + maze[i].length + ' colunas (esperado: ' + expectedLen + ')');
			}
		}

		var playerRow = -1, playerCol = -1;
		var playerFound = false;
		for(var r = 0; r < maze.length; r++){
			for(var c = 0; c < maze[r].length; c++){
				if(maze[r][c] === 2){
					playerRow = r;
					playerCol = c;
					playerFound = true;
				}
			}
		}
		if(!playerFound){
			errors.push('Mapa não possui posição inicial do jogador (tile 2 não encontrado)');
		}

		var spawns = variation.enemySpawns || [];
		for(var s = 0; s < spawns.length; s++){
			var spawn = spawns[s];
			var sr = spawn.row;
			var sc = spawn.col;

			if(sr < 0 || sr >= maze.length || sc < 0 || sc >= (maze[sr] ? maze[sr].length : 0)){
				errors.push('Spawn ' + s + ' está fora dos limites do mapa (row ' + sr + ', col ' + sc + ')');
				continue;
			}

			var tile = maze[sr][sc];
			if(tile === 1){
				errors.push('Spawn ' + s + ' (row ' + sr + ', col ' + sc + ') está posicionado em uma parede');
			}
			if(playerFound && sr === playerRow && sc === playerCol){
				errors.push('Spawn ' + s + ' (row ' + sr + ', col ' + sc + ') ocupa o mesmo tile do jogador');
			}
		}

		for(var e = 0; e < errors.length; e++){
			console.error('[Director] Erro em "' + name + '": ' + errors[e]);
		}
		for(var w = 0; w < warnings.length; w++){
			console.warn('[Director] Aviso em "' + name + '": ' + warnings[w]);
		}

		return {
			valid: errors.length === 0,
			errors: errors,
			warnings: warnings
		};
	},

	// quantidade de moedas na fase.
	// por enquanto usa o valor da variação,
	// mas o Director pode alterar conforme a dificuldade no futuro.
	getCoinCount: function(variation) {
		return variation.coinCount;
	},

	// quantidade de goblins.
	// escolhe entre 3 e 4.
	// porque aparentemente um só não era suficiente.
	getGoblinCount: function() {
		return Math.random() < 0.5 ? 3 : 4;
	},

	// seleciona apenas os primeiros N spawns da variação.
	// funciona como um filtro: se a variação tem 4 spawns
	// mas o Director quer só 3, o quarto fica de fora.
	selectSpawns: function(spawns, count) {
		return spawns.slice(0, count);
	}

};