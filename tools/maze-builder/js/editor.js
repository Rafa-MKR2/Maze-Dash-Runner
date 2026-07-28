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
		this._updatePropCoins();
		Toolbar.showErrors(Validator.validate(this.grid));
	},

	_updatePropCoins: function(){
		var el = document.getElementById('prop-coins');
		if(!el) return;
		var count = 0;
		for(var r = 0; r < this.grid.rows; r++){
			for(var c = 0; c < this.grid.cols; c++){
				if(this.grid.data[r][c] === 3) count++;
			}
		}
		el.textContent = count;
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
		var name = document.getElementById('prop-name').value || 'Novo Mapa';
		var stage = parseInt(document.getElementById('prop-stage').value, 10) || 1;
		var timeLimit = parseInt(document.getElementById('prop-time').value, 10) || 150;

		var mapText = Parser.export(this.grid);
		var mapLines = mapText.split('\n');

		var coinCount = 0;
		var playerPos = null;
		for(var r = 0; r < this.grid.rows; r++){
			for(var c = 0; c < this.grid.cols; c++){
				var v = this.grid.data[r][c];
				if(v === 3) coinCount++;
				if(v === 2) playerPos = { row: r, col: c };
			}
		}

		var id = 'stage' + stage + '_manual';

		var enemySpawns = [];
		if(playerPos){
			enemySpawns.push({ row: Math.max(1, playerPos.row - 2), col: playerPos.col });
			enemySpawns.push({ row: Math.min(this.grid.rows - 2, playerPos.row + 2), col: playerPos.col });
			enemySpawns.push({ row: playerPos.row, col: Math.max(1, playerPos.col - 2) });
			enemySpawns.push({ row: playerPos.row, col: Math.min(this.grid.cols - 2, playerPos.col + 2) });
		}

		var code =
			'StageData.register({\n' +
			'\tversion: 1,\n' +
			'\tstage: ' + stage + ',\n' +
			'\tid: \'' + id + '\',\n' +
			'\tname: \'' + name + '\',\n' +
			'\tmusicKey: \'music1\',\n' +
			'\tenemyType: \'goblin\',\n' +
			'\tcoinCount: ' + coinCount + ',\n' +
			'\ttimeLimit: ' + timeLimit + ',\n' +
			'\tenemySpawns: ' + JSON.stringify(enemySpawns, null, '\t').replace(/\n/g, '\n\t') + ',\n' +
			'\tmap: [\n';

		for(var i = 0; i < mapLines.length; i++){
			code += '\t\t\'' + mapLines[i] + '\'';
			if(i < mapLines.length - 1) code += ',';
			code += '\n';
		}

		code +=
			'\t]\n' +
			'});';

		var textarea = document.getElementById('export-text');
		textarea.value = code;
		textarea.select();
		Toolbar.showMessage('Codigo gerado! Copie e cole em um arquivo .js.');
	},

	_onImport: function(){
		var text = document.getElementById('import-text').value.trim();
		if(!text){
			Toolbar.showMessage('Cole um mapa ou JSON no campo Importar primeiro.', true);
			return;
		}

		var grid = null;

		// tenta interpretar como JSON (formato StageData.register)
		try {
			var parsed = JSON.parse(text);
			if(parsed.map && Array.isArray(parsed.map)){
				grid = Parser.parse(parsed.map.join('\n'));
				if(grid && parsed.name){
					document.getElementById('prop-name').value = parsed.name;
				}
				if(grid && parsed.stage){
					document.getElementById('prop-stage').value = parsed.stage;
				}
				if(grid && parsed.timeLimit){
					document.getElementById('prop-time').value = parsed.timeLimit;
				}
			}
		} catch(e) {}

		// fallback: tenta como texto de mapa puro
		if(!grid){
			grid = Parser.parse(text);
		}

		if(!grid){
			Toolbar.showMessage('Nao foi possivel interpretar o conteudo.', true);
			return;
		}

		this.grid = grid;
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
