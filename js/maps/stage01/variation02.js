// Stage 01 — Variação 2.
// Nome: Long Corridors.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (#).
// Jogador spawn (S) em [5,1] (meio-esquerda).
// Goblin 3 spawn movido de [9,19] (parede) para [9,18] (token de moeda).
var Variation02 = {

	name: "Long Corridors",

	maze: [
		'#####################',
		'#....#.#...#.#.....C#',
		'####.#.#.#.#.#.###.##',
		'#C.#.#...#C#...#C...#',
		'#..#.###.#.#.#.#.##.#',
		'#S.....#.....#......#',
		'#.#.##.#####.###.#..#',
		'#...C#...C...#...C..#',
		'###.##.#.###.#.#.##.#',
		'#C................C##',
		'#####################'
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
