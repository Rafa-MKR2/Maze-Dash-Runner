// GoblinFactory - responsavel por criar e configurar inimigos do tipo Goblin.
// Cada novo tipo de inimigo tera sua propria factory (ex: SlimeFactory).
// A EnemyManager orquestra qual factory usar.
var GoblinFactory = {

	// posicoes padrao dos goblins nos cantos do labirinto
	DEFAULT_SPAWNS: [
		{ row: 1, col: 1 },
		{ row: 1, col: 13 },
		{ row: 8, col: 1 },
		{ row: 8, col: 13 }
	],

	// cria um unico goblin na posicao indicada
	// retorna { sprite, ai } para a EnemyManager gerenciar
	create: function(spawnX, spawnY, maze, doorPosition, onLostPlayer){
		var tileSize = GameConfig.TILE_SIZE;

		var sprite = game.add.sprite(spawnX, spawnY, 'enemy');
		sprite.anchor.set(0.5);
		game.physics.arcade.enable(sprite);

		sprite.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
		sprite.animations.add('goUp', [8,9,10,11,12,13,14,15], 12, true);
		sprite.animations.add('goLeft', [16,17,18,19,20,21,22,23], 12, true);
		sprite.animations.add('goRight', [24,25,26,27,28,29,30,31], 12, true);
		sprite.direction = 'DOWN';

		var ai = new GoblinAI(maze, sprite, doorPosition, onLostPlayer);

		return { sprite: sprite, ai: ai };
	}

};
