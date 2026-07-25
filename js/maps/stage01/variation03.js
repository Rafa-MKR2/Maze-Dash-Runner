// Stage 01 — Variação 3.
// Nome: Crossroads.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (1).
// Jogador spawn reposicionado para [7,10] (centro do cruzamento)
// para dar a cada variação uma identidade própria de entrada.
var Stage01Variation03 = {

	name: "Crossroads",

	maze: [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,1],
		[1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
		[1,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,1],
		[1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
		[1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1],
		[1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
		[1,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,3,1],
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