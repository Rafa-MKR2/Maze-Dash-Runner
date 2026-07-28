// EnemyManager - responsavel por criar, gerenciar e atualizar todos os inimigos.
// Funciona como factory central: recebe as configuracoes do mapa e decide
// qual factory de inimigo usar. A Stage nao precisa conhecer detalhes
// de criacao de inimigos - apenas chama create e update.
var EnemyManager = {

	sprites: [],
	ais: [],

	create: function(spawnPositions, enemyType, maze, doorPosition, onGoblinLostPlayer){
		var self = this;
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
			var entity = factory.create(spawnX, spawnY, maze, doorPosition, onGoblinLostPlayer);
			this.sprites.push(entity.sprite);
			this.ais.push(entity.ai);
		}

		// configurar alerta entre goblins: se um perseguir por muito tempo
		for(var i = 0; i < this.ais.length; i++){
			(function(ai, allAis){
				ai.setLongChaseCallback(function(playerX, playerY){
					for(var j = 0; j < allAis.length; j++){
						if(allAis[j] !== ai){
							allAis[j].setAlertTarget(playerX, playerY);
						}
					}
				});
			})(this.ais[i], this.ais);
		}
	},

	getFactory: function(type){
		switch(type){
			case 'goblin': return GoblinFactory;
			default: return GoblinFactory;
		}
	},

	update: function(player, coinManager){
		for(var i = 0; i < this.sprites.length; i++){
			this.ais[i].update(player, coinManager);
		}
	},

	stopAll: function(){
		for(var i = 0; i < this.sprites.length; i++){
			this.sprites[i].animations.stop();
		}
	}

};
