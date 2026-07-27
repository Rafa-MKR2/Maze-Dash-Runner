// Stage 01 — Variação 3.
// Nome: Crossroads.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (#).
// Jogador spawn (S) em [7,10] (centro do cruzamento)
// para dar a cada variação uma identidade própria de entrada.
var Variation03 = {

	name: "Crossroads",

	maze: [
		'#####################',
		'#..#.#.#.#.C...C...C#',
		'#.##.###.###.###..#.#',
		'#...................#',
		'#.##.###.###.###.##.#',
		'#C...C...C...C...C..#',
		'#.##.###.###.###.##.#',
		'#.........S.........#',
		'#..#.#.#.#.#.###.##.#',
		'#C...C...C...C...C.C#',
		'#####################'
	],

	coinCount: 4,

	enemyType: 'goblin',
	enemySpawns: [
		{ row: 1, col: 1 },
		{ row: 1, col: 19 },
		{ row: 9, col: 1 },
		{ row: 9, col: 19 }
	],

	musicKey: 'music1'

};
