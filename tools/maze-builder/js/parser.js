// Parser - converte texto de mapa para grid e vice-versa.
// Usa a mesma tabela de conversao do MapParser do jogo original,
// mas e uma implementacao independente — sem dependencias do projeto.
var Parser = {

	// converte um texto de mapa para um objeto grid (Grid.create)
	// Exemplo de entrada:
	//   "#####\n#S..#\n#C..#\n#####"
	// Retorna o objeto grid ou null se houver erro de formato grave.
	parse: function(text){
		var lines = text.split('\n');
		// remove linhas vazias do inicio e fim
		while(lines.length > 0 && lines[0].trim() === '') lines.shift();
		while(lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();

		if(lines.length === 0) return null;

		var cols = lines[0].length;
		var rows = lines.length;
		var grid = Grid.create(cols, rows);

		for(var r = 0; r < rows; r++){
			var line = lines[r];
			// se alguma linha for mais curta, preenche com chao
			for(var c = 0; c < cols; c++){
				var ch = c < line.length ? line[c] : '.';
				var value = Grid.fromChar(ch);
				if(value === -1) value = 0; // caracteres desconhecidos viram chao
				grid.data[r][c] = value;
			}
		}

		return grid;
	},

	// converte um grid para texto (formato de linhas separadas por \n)
	// Exemplo de saida:
	//   "#####\n#S..#\n#C..#\n#####"
	export: function(grid){
		var lines = [];
		for(var r = 0; r < grid.rows; r++){
			var line = '';
			for(var c = 0; c < grid.cols; c++){
				line += Grid.toChar(grid.data[r][c]);
			}
			lines.push(line);
		}
		return lines.join('\n');
	}

};
