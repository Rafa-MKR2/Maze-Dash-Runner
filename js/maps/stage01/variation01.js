// Stage 01 — Variação 1.
// Nome: Classic.
// Layout desenhado manualmente, 21 colunas por 11 linhas.
// Perímetro completado com paredes (#).
// Jogador spawn (S) em [5,1] (meio-esquerda) para evitar
// sobreposição com goblin spawn em [1,1].
var Variation01 = {

	name: "Classic",

	maze: [
		'#####################',
		'#..#.#.#.#...#....C.#',
		'#.##.#.#.#.#.#.##.#.#',
		'#C#....#...#....#..C#',
		'#.#.##.###.###.###..#',
		'#S..#C.......C...#..#',
		'#.#.#.##.###.#.#.##.#',
		'#.#....#...#...#....#',
		'#.##.#.###.###.##.#.#',
		'#C......C...C......C#',
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
