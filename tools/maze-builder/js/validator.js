// Validator - valida a estrutura de um grid de labirinto.
// Nao conhece regras de gameplay (goblins, chave, porta).
// Verifica apenas problemas estruturais do mapa em si.
var Validator = {

	// executa todas as validacoes e retorna um array de mensagens de erro
	// se o array for vazio, o mapa e valido
	validate: function(grid){
		var errors = [];

		this._checkRowLengths(grid, errors);
		this._checkBorders(grid, errors);
		this._checkPlayerCount(grid, errors);
		this._checkInvalidChars(grid, errors);

		return errors;
	},

	// todas as linhas devem ter o mesmo comprimento
	_checkRowLengths: function(grid, errors){
		for(var r = 0; r < grid.rows; r++){
			if(grid.data[r].length !== grid.cols){
				errors.push('Linha ' + (r + 1) + ' tem ' + grid.data[r].length + ' colunas (esperado ' + grid.cols + ').');
			}
		}
	},

	// bordas devem ser completamente fechadas com paredes (#)
	_checkBorders: function(grid, errors){
		if(grid.rows < 3 || grid.cols < 3) return; // mapas muito pequenos nao tem borda viavel

		var hasError = false;

		// borda superior e inferior
		for(var c = 0; c < grid.cols; c++){
			if(grid.data[0][c] !== 1){
				errors.push('Borda superior: linha 1, coluna ' + (c + 1) + ' nao e parede (#).');
				hasError = true;
			}
			if(grid.data[grid.rows - 1][c] !== 1){
				errors.push('Borda inferior: linha ' + grid.rows + ', coluna ' + (c + 1) + ' nao e parede (#).');
				hasError = true;
			}
		}

		// borda esquerda e direita
		for(var r = 1; r < grid.rows - 1; r++){
			if(grid.data[r][0] !== 1){
				errors.push('Borda esquerda: linha ' + (r + 1) + ', coluna 1 nao e parede (#).');
				hasError = true;
			}
			if(grid.data[r][grid.cols - 1] !== 1){
				errors.push('Borda direita: linha ' + (r + 1) + ', coluna ' + grid.cols + ' nao e parede (#).');
				hasError = true;
			}
		}
	},

	// deve haver exatamente um player (S)
	_checkPlayerCount: function(grid, errors){
		var count = 0;
		for(var r = 0; r < grid.rows; r++){
			for(var c = 0; c < grid.cols; c++){
				if(grid.data[r][c] === 2) count++;
			}
		}
		if(count === 0){
			errors.push('Nenhum spawn de jogador (S) encontrado. Coloque exatamente um S.');
		} else if(count > 1){
			errors.push('Multiplos spawns de jogador (S) encontrados (' + count + '). Deve haver exatamente um.');
		}
	},

	// verifica se existem valores numericos fora da faixa esperada
	_checkInvalidChars: function(grid, errors){
		for(var r = 0; r < grid.rows; r++){
			for(var c = 0; c < grid.cols; c++){
				var v = grid.data[r][c];
				if(v < 0 || v > 3){
					errors.push('Valor invalido na linha ' + (r + 1) + ', coluna ' + (c + 1) + ': ' + v);
				}
			}
		}
	}

};
