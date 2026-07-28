// Renderer - desenha o grid em um canvas e traduz eventos do mouse
// para coordenadas de celula.
// Nao conhece ferramentas nem logica de edicao — apenas pintura.
var Renderer = {

	CELL_SIZE: 30,       // tamanho base de cada celula em pixels (zoom 100%)
	GRID_LINE_COLOR: '#ccc',
	GRID_LINE_WIDTH: 1,

	// cores de preenchimento para cada tipo de celula
	COLORS: {
		0: '#e8e0d4',  // FLOOR - bege claro (chao)
		1: '#5c4033',  // WALL  - marrom escuro
		2: '#4caf50',  // PLAYER - verde
		3: '#ffd700'   // COIN  - dourado
	},

	// cores do texto para cada tipo de celula
	TEXT_COLORS: {
		0: '#aaa',
		1: '#fff',
		2: '#fff',
		3: '#333'
	},

	canvas: null,
	ctx: null,
	zoom: 1,

	// inicializa o renderer com um canvas existente
	init: function(canvasId){
		this.canvas = document.getElementById(canvasId);
		if(!this.canvas) throw new Error('Renderer: canvas nao encontrado');
		this.ctx = this.canvas.getContext('2d');
	},

	// calcula o tamanho real de cada celula considerando zoom
	getCellSize: function(){
		return this.CELL_SIZE * this.zoom;
	},

	// redimensiona o canvas para caber o grid
	resizeCanvas: function(grid){
		var cellSize = this.getCellSize();
		this.canvas.width = grid.cols * cellSize + 1;
		this.canvas.height = grid.rows * cellSize + 1;
	},

	// desenha o grid inteiro
	draw: function(grid){
		this.resizeCanvas(grid);
		var ctx = this.ctx;
		var cellSize = this.getCellSize();
		var colors = this.COLORS;
		var textColors = this.TEXT_COLORS;

		for(var r = 0; r < grid.rows; r++){
			for(var c = 0; c < grid.cols; c++){
				var value = grid.data[r][c];
				var x = c * cellSize;
				var y = r * cellSize;

				// fundo da celula
				ctx.fillStyle = colors[value] || colors[0];
				ctx.fillRect(x, y, cellSize, cellSize);

				// borda sutil
				ctx.strokeStyle = this.GRID_LINE_COLOR;
				ctx.lineWidth = this.GRID_LINE_WIDTH;
				ctx.strokeRect(x, y, cellSize, cellSize);

				// caractere centralizado
				var ch = Grid.toChar(value);
				if(ch !== '.' || cellSize >= 20){
					ctx.fillStyle = textColors[value] || '#000';
					var fontSize = Math.max(10, Math.floor(cellSize * 0.55));
					ctx.font = fontSize + 'px monospace';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(ch, x + cellSize / 2, y + cellSize / 2 + 1);
				}
			}
		}
	},

	// converte coordenada do mouse para celula { col, row }
	// retorna null se estiver fora do grid
	mouseToCell: function(grid, mouseX, mouseY){
		var rect = this.canvas.getBoundingClientRect();
		var scaleX = this.canvas.width / rect.width;
		var scaleY = this.canvas.height / rect.height;
		var x = (mouseX - rect.left) * scaleX;
		var y = (mouseY - rect.top) * scaleY;
		var cellSize = this.getCellSize();
		var col = Math.floor(x / cellSize);
		var row = Math.floor(y / cellSize);
		if(col < 0 || col >= grid.cols || row < 0 || row >= grid.rows) return null;
		return { col: col, row: row };
	},

	// altera o zoom e redesenha
	setZoom: function(zoom, grid){
		this.zoom = zoom;
		if(grid) this.draw(grid);
	}

};
