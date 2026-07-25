// Stage 01 — Variação 1.
// Nome: Classic.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (1).
// Jogador spawn reposicionado para [5,1] (meio-esquerda) para evitar
// sobreposição com goblin spawn em [1,1].
var Stage01Variation01 = {

	name: "Classic",

	maze: [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,3,0,1],
		[1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1],
		[1,3,1,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,3,1],
		[1,0,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,1],
		[1,2,0,0,1,3,0,0,0,0,0,0,0,3,0,0,0,1,0,0,1],
		[1,0,1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
		[1,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
		[1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
		[1,3,0,0,0,0,0,0,3,0,0,0,3,0,0,0,0,0,0,3,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	],

	coinCount: 8,

	enemyType: 'goblin',
	enemySpawns: [
		{ row: 1, col: 1 },
		{ row: 1, col: 19 },
		{ row: 9, col: 1 },
		{ row: 9, col: 19 }
	],

	musicKey: 'music1'

};