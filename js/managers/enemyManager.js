// EnemyManager - responsavel por criar, gerenciar e atualizar todos os inimigos.
// Funciona como factory central: recebe as configuracoes do mapa e decide
// qual factory de inimigo usar. A Stage nao precisa conhecer detalhes
// de criacao de inimigos - apenas chama create e update.
var EnemyManager = {

	sprites: [],
	ais: [],

	// cria todos os inimigos do nivel baseado na configuracao do mapa
	// spawnPositions: array de { row, col }
	// enemyType: string ('goblin', futuro 'slime', etc)
	// maze: array do labirinto para a IA
	create: function(spawnPositions, enemyType, maze){
		var tileSize = GameConfig.TILE_SIZE;
		this.sprites = [];
		this.ais = [];

		// embaralhar posicoes para variar a disposicao dos inimigos
		var spawns = spawnPositions.slice();
		for(var i = spawns.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * (i + 1));
			var temp = spawns[i];
			spawns[i] = spawns[j];
			spawns[j] = temp;
		}

		// seleciona a factory correta para o tipo de inimigo
		var factory = this.getFactory(enemyType);

		for(var i = 0; i < spawns.length; i++){
			var spawnX = spawns[i].col * tileSize + tileSize / 2;
			var spawnY = spawns[i].row * tileSize + tileSize / 2;
			var entity = factory.create(spawnX, spawnY, maze);
			this.sprites.push(entity.sprite);
			this.ais.push(entity.ai);
		}
	},

	// retorna a factory de inimigos baseado no tipo
	// para adicionar novos inimigos, basta adicionar um novo caso aqui
	getFactory: function(type){
		switch(type){
			case 'goblin': return GoblinFactory;
			default: return GoblinFactory;
		}
	},

	// atualiza IA de todos os inimigos e verifica coleta de moedas
	update: function(player, coinManager){
		for(var i = 0; i < this.sprites.length; i++){
			this.ais[i].update(player, coinManager);
		}
	},

	// para animacoes na pausa
	stopAll: function(){
		for(var i = 0; i < this.sprites.length; i++){
			this.sprites[i].animations.stop();
		}
	}

};
