// Stage 01 — Variação 2.
// Nome: Long Corridors.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (1).
// Jogador spawn reposicionado para [5,1] (meio-esquerda).
// Goblin 3 spawn movido de [9,19] (parede) para [9,18] (token de moeda).
var Variation02 = {

	name: "Long Corridors",

	maze: [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,1,4,1,0,0,0,1,4,1,0,0,0,0,0,3,1],
		[1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,1],
		[1,3,0,1,0,1,0,0,0,1,3,1,0,0,0,1,3,0,0,0,1],
		[1,0,0,1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,1],
		[1,2,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
		[1,0,1,0,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,0,1],
		[1,0,0,0,3,1,0,0,0,3,0,0,0,1,0,0,0,3,0,0,1],
		[1,1,1,0,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,0,1],
		[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	],

	coinCount: 4,

	enemyType: 'goblin',
	enemySpawns: [
		{ row: 1, col: 1 },
		{ row: 1, col: 19 },
		{ row: 9, col: 1 },
		{ row: 9, col: 18 }
	],

	musicKey: 'music1'

};
