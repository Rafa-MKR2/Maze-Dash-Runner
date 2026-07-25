var Director = {

	difficulty: 1,

	// retorna os dados completos de um estágio pelo número.
	// o Director escolhe a variação, a quantidade de moedas,
	// goblins e música. Tudo manualmente desenhado, sem procedural.
	getStage: function(stageNumber) {
		var variation = this.pickVariation(stageNumber);
		return this.buildStageData(variation);
	},

	// escolhe uma variação aleatória para o estágio solicitado.
	// no futuro pode levar em conta dificuldade, histórico do jogador,
	// hora do dia, ou qualquer outra "vibe" do Director.
	// por enquanto é só sorteio simples.
	pickVariation: function(stageNumber) {
		var variations;

		switch(stageNumber) {
			case 1:
				variations = [
					Stage01Variation01,
					Stage01Variation02,
					Stage01Variation03,
					Stage01Variation04
				];
				break;
			default:
				variations = [Stage01Variation01];
		}

		// Diretor do caos.
		// Hoje resolveu pegar leve.
		// Talvez.
		var index = Math.floor(Math.random() * variations.length);
		return variations[index];
	},

	// monta o pacote final de dados que a Stage vai consumir.
	// aqui o Director decide quantas moedas, quantos goblins
	// e qual música toca naquela partida.
	buildStageData: function(variation) {
		var coinCount = this.getCoinCount(variation);
		var enemyCount = this.getGoblinCount();

		return {
			maze: variation.maze,
			coinCount: coinCount,
			enemyType: variation.enemyType,
			enemySpawns: this.selectSpawns(variation.enemySpawns, enemyCount),
			enemyCount: enemyCount,
			musicKey: variation.musicKey,
			difficulty: this.difficulty
		};
	},

	// quantidade de moedas na fase.
	// por enquanto usa o valor da variação,
	// mas o Director pode alterar conforme a dificuldade.
	getCoinCount: function(variation) {
		return variation.coinCount;
	},

	// quantidade de goblins.
	// escolhe entre 3 e 4.
	// porque aparentemente um só não era suficiente.
	getGoblinCount: function() {
		return Math.random() < 0.5 ? 3 : 4;
	},

	// seleciona apenas os primeiros N spawns da variação.
	// funciona como um filtro: se a variação tem 4 spawns
	// mas o Director quer só 3, o quarto fica de fora.
	selectSpawns: function(spawns, count) {
		return spawns.slice(0, count);
	}

};