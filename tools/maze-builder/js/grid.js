// Grid - modelo de dados do labirinto.
// Armazena um array bidimensional de inteiros.
// Nao conhece canvas, DOM, nem ferramentas de edicao.
// Apenas dados e operacoes estruturais.
var Grid = {

	// valores das celulas
	// seguem mesma convencao do MapParser do jogo
	WALL: 1,
	FLOOR: 0,
	PLAYER: 2,
	COIN: 3,

	// cria um grid vazio (preenchido com FLOOR)
	create: function(cols, rows){
		var data = [];
		for(var r = 0; r < rows; r++){
			data[r] = [];
			for(var c = 0; c < cols; c++){
				data[r][c] = this.FLOOR;
			}
		}
		return { cols: cols, rows: rows, data: data };
	},

	// define o valor de uma celula, validando os limites
	set: function(grid, col, row, value){
		if(col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return false;
		grid.data[row][col] = value;
		return true;
	},

	// retorna o valor de uma celula
	get: function(grid, col, row){
		if(col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return -1;
		return grid.data[row][col];
	},

	// preenche todas as celulas com um valor
	fill: function(grid, value){
		for(var r = 0; r < grid.rows; r++){
			for(var c = 0; c < grid.cols; c++){
				grid.data[r][c] = value;
			}
		}
	},

	// redimensiona o grid (preserva dados que couberem)
	resize: function(grid, newCols, newRows){
		var newData = [];
		for(var r = 0; r < newRows; r++){
			newData[r] = [];
			for(var c = 0; c < newCols; c++){
				if(r < grid.rows && c < grid.cols){
					newData[r][c] = grid.data[r][c];
				} else {
					newData[r][c] = this.FLOOR;
				}
			}
		}
		grid.cols = newCols;
		grid.rows = newRows;
		grid.data = newData;
	},

	// converte valor numerico para caractere (mesma tabela do MapParser)
	toChar: function(value){
		switch(value){
			case this.WALL:   return '#';
			case this.FLOOR:  return '.';
			case this.PLAYER: return 'S';
			case this.COIN:   return 'C';
			default:          return '?';
		}
	},

	// converte caractere para valor numerico
	fromChar: function(ch){
		switch(ch){
			case '#': return this.WALL;
			case '.': return this.FLOOR;
			case 'S': return this.PLAYER;
			case 'C': return this.COIN;
			default:  return -1;
		}
	}

};
