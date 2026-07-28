// Editor - controlador principal do Maze Builder.
// Coordena grid, renderer, toolbar, parser e validator.
// Nao contem logica de desenho ou UI — apenas orquestracao.
var Editor = {

	grid: null,
	isMouseDown: false,
	isRightButton: false,

	// inicializa o editor com valores padrao (21x11)
	init: function(){
		Renderer.init('maze-canvas');

		// criar grid padrao 21x11 com bordas
		this.grid = Grid.create(21, 11);
		this._buildDefaultMap();
		Renderer.draw(this.grid);
		Toolbar.updateCounters(this.grid);

		// configurar toolbar
		Toolbar.init({
			onToolChange: function(){}
		});

		// eventos do mouse no canvas
		var canvas = Renderer.canvas;
		canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
		canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
		canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
		canvas.addEventListener('mouseleave', this._onMouseUp.bind(this));
		canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); });

		// botoes de acao
		document.getElementById('btn-export').addEventListener('click', this._onExport.bind(this));
		document.getElementById('btn-import').addEventListener('click', this._onImport.bind(this));
		document.getElementById('btn-new').addEventListener('click', this._onNew.bind(this));

		// zoom
		document.getElementById('btn-zoom-in').addEventListener('click', this._zoomIn.bind(this));
		document.getElementById('btn-zoom-out').addEventListener('click', this._zoomOut.bind(this));

		Toolbar.setZoom(1);
		Toolbar.showMessage('Clique para pintar. Botao direito apaga.');
	},

	// constroi o mapa padrao: bordas de parede, chao interno
	_buildDefaultMap: function(){
		for(var r = 0; r < this.grid.rows; r++){
			for(var c = 0; c < this.grid.cols; c++){
				if(r === 0 || r === this.grid.rows - 1 || c === 0 || c === this.grid.cols - 1){
					this.grid.data[r][c] = 1; // parede nas bordas
				} else {
					this.grid.data[r][c] = 0; // chao interno
				}
			}
		}
		// player no centro
		var pr = Math.floor(this.grid.rows / 2);
		var pc = Math.floor(this.grid.cols / 2);
		this.grid.data[pr][pc] = 2; // S
	},

	// pinta uma celula com a ferramenta atual
	_paint: function(col, row){
		if(!this.grid) return;
		if(this.isRightButton){
			Grid.set(this.grid, col, row, 0); // botao direito = apaga (chao)
		} else {
			var value = Toolbar.getToolValue();
			Grid.set(this.grid, col, row, value);
		}
		Renderer.draw(this.grid);
		Toolbar.updateCounters(this.grid);
		Toolbar.showErrors(Validator.validate(this.grid));
	},

	// --- EVENTOS DE MOUSE ---

	_onMouseDown: function(e){
		this.isMouseDown = true;
		this.isRightButton = e.button === 2;
		var cell = Renderer.mouseToCell(this.grid, e.clientX, e.clientY);
		if(cell) this._paint(cell.col, cell.row);
	},

	_onMouseMove: function(e){
		if(!this.isMouseDown) return;
		var cell = Renderer.mouseToCell(this.grid, e.clientX, e.clientY);
		if(cell) this._paint(cell.col, cell.row);
	},

	_onMouseUp: function(e){
		this.isMouseDown = false;
	},

	// --- BOTOES ---

	_onExport: function(){
		var text = Parser.export(this.grid);
		var textarea = document.getElementById('export-text');
		textarea.value = text;
		textarea.select();
		Toolbar.showMessage('Mapa exportado! Copie o texto acima.');
	},

	_onImport: function(){
		var text = document.getElementById('import-text').value.trim();
		if(!text){
			Toolbar.showMessage('Cole um mapa textual no campo Importar primeiro.', true);
			return;
		}
		var imported = Parser.parse(text);
		if(!imported){
			Toolbar.showMessage('Nao foi possivel interpretar o texto.', true);
			return;
		}
		this.grid = imported;
		Renderer.draw(this.grid);
		Toolbar.updateCounters(this.grid);
		var errors = Validator.validate(this.grid);
		Toolbar.showErrors(errors);
		if(errors.length === 0){
			Toolbar.showMessage('Mapa importado com sucesso!');
		} else {
			Toolbar.showMessage('Mapa importado com erros (veja acima).', true);
		}
	},

	_onNew: function(){
		var colsInput = prompt('Quantas colunas?', '21');
		if(colsInput === null) return;
		var rowsInput = prompt('Quantas linhas?', '11');
		if(rowsInput === null) return;
		var cols = parseInt(colsInput, 10);
		var rows = parseInt(rowsInput, 10);
		if(isNaN(cols) || isNaN(rows) || cols < 3 || rows < 3){
			Toolbar.showMessage('Dimensoes invalidas. Minimo 3x3.', true);
			return;
		}
		this.grid = Grid.create(cols, rows);
		this._buildDefaultMap();
		Renderer.draw(this.grid);
		Toolbar.setZoom(1);
		Renderer.setZoom(1, this.grid);
		Toolbar.updateCounters(this.grid);
		Toolbar.showErrors(Validator.validate(this.grid));
		Toolbar.showMessage('Novo mapa ' + cols + 'x' + rows + ' criado.');
	},

	// --- ZOOM ---

	_zoomIn: function(){
		var zoom = Math.min(Renderer.zoom + 0.25, 2);
		Renderer.setZoom(zoom, this.grid);
		Toolbar.setZoom(zoom);
	},

	_zoomOut: function(){
		var zoom = Math.max(Renderer.zoom - 0.25, 0.5);
		Renderer.setZoom(zoom, this.grid);
		Toolbar.setZoom(zoom);
	}

};
