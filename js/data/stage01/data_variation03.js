StageData.register({
	version: 1,
	stage: 1,
	id: 'stage01_variation03',
	name: 'Crossroads',
	musicKey: 'music1',
	enemyType: 'goblin',
	coinCount: 4,
	timeLimit: 150,
	doorPosition: { row: 1, col: 1 },
	enemySpawns: [
		{ row: 1, col: 1 },
		{ row: 1, col: 19 },
		{ row: 9, col: 1 },
		{ row: 9, col: 19 }
	],
	map: [
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
	]
});
