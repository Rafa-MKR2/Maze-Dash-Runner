// Stage 01 — Variação 4.
// Preencha com um layout manual diferente.
// mesma estrutura de Stage01Variation01.
var Stage01Variation04 = {

	maze: [
		// [preencher com mapa 15x10]
		// perímetro fechado (tudo 1 nas bordas),
		// 2 para spawn do player, 3 para cofre de moeda,
		// 0 para caminho livre, 1 para parede.
	],

	coinCount: 6,

	enemyType: 'goblin',
	enemySpawns: [
		// { row: <linha>, col: <coluna> },
		// usar exatamente 4 spawns no total
		// (Director vai escolher 3 ou 4),
	],

	musicKey: 'music1'

};