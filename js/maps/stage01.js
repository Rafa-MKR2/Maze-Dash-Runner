// dados do nivel 1 - labirinto, spawns, configuracao da fase
// cada mapa define suas proprias regras. A Stage apenas carrega.
var Stage01Data = {

	maze: [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,3,0,0,0,0,0,0,0,0,0,0,0,3,1],
		[1,0,1,1,0,1,0,1,1,1,0,1,1,0,1],
		[1,0,1,3,0,1,3,0,0,1,0,3,1,3,1],
		[1,0,0,0,1,1,1,1,0,1,0,1,1,0,1],
		[1,0,0,0,0,1,0,2,0,0,0,0,0,0,1],
		[1,0,1,3,0,0,0,3,1,0,0,3,1,0,1],
		[1,0,1,1,1,1,0,1,1,0,1,1,1,0,1],
		[1,3,0,0,3,0,0,3,1,0,0,0,0,3,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	],

	coinCount: 6,

	enemyType: 'goblin',
	enemySpawns: [
		{ row: 1, col: 1 },
		{ row: 1, col: 13 },
		{ row: 8, col: 1 },
		{ row: 8, col: 13 }
	],

	musicKey: 'music1'

};
