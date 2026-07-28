// Toolbar - gerencia a barra de ferramentas: selecao de ferramenta,
// zoom, contadores e botoes de acao (exportar, importar, novo).
// Nao conhece o grid nem o canvas — apenas notifica o Editor quando algo muda.
var Toolbar = {

	currentTool: null,
	onToolChange: null,

	// inicializa a barra de ferramentas
	init: function(config){
		this.onToolChange = config.onToolChange || function(){};

		// tools: botoes de ferramenta
		var tools = document.querySelectorAll('.tool-btn');
		for(var i = 0; i < tools.length; i++){
			tools[i].addEventListener('click', this._onToolClick.bind(this));
		}

		// selecionar parede como padrao
		this.select('wall');
	},

	// seleciona uma ferramenta pelo id
	select: function(toolId){
		var tools = document.querySelectorAll('.tool-btn');
		for(var i = 0; i < tools.length; i++){
			tools[i].classList.remove('active');
		}
	var btn = document.getElementById('tool-' + toolId);
	if(btn){
		btn.classList.add('active');
		this.currentTool = toolId;
	}
		if(this.onToolChange) this.onToolChange(this.currentTool);
	},

	// callback quando um botao de ferramenta e clicado
	_onToolClick: function(e){
		var btn = e.currentTarget;
		this.select(btn.id.replace('tool-', ''));
	},

	// retorna o valor numerico da ferramenta atual
	// (corresponde aos valores de Grid.WALL, FLOOR, etc.)
	getToolValue: function(){
		switch(this.currentTool){
			case 'wall':   return 1;
			case 'floor':  return 0;
			case 'player': return 2;
			case 'coin':   return 3;
			default:       return 0;
		}
	},

	// atualiza os contadores na interface
	updateCounters: function(grid){
		var counts = { 0: 0, 1: 0, 2: 0, 3: 0 };
		for(var r = 0; r < grid.rows; r++){
			for(var c = 0; c < grid.cols; c++){
				counts[grid.data[r][c]]++;
			}
		}
		document.getElementById('count-walls').textContent = counts[1];
		document.getElementById('count-floors').textContent = counts[0];
		document.getElementById('coin-count').textContent = counts[3];
		document.getElementById('player-count').textContent = counts[2];
		document.getElementById('map-size').textContent = grid.cols + 'x' + grid.rows;
	},

	// configura o botao de zoom
	setZoom: function(zoom){
		var btn = document.getElementById('zoom-level');
		if(btn) btn.textContent = Math.round(zoom * 100) + '%';
	},

	// mostra uma mensagem na barra de status
	showMessage: function(msg, isError){
		var el = document.getElementById('status-message');
		if(!el) return;
		el.textContent = msg;
		el.className = 'status-message' + (isError ? ' error' : '');
	},

	// limpa a mensagem de status
	clearMessage: function(){
		var el = document.getElementById('status-message');
		if(el) el.textContent = '';
	},

	// mostra o modal de erro com uma lista de problemas
	showErrors: function(errors){
		var el = document.getElementById('validation-errors');
		if(!el) return;
		if(errors.length === 0){
			el.innerHTML = '<span class="ok">Mapa valido!</span>';
			return;
		}
		var html = '<ul>';
		for(var i = 0; i < errors.length; i++){
			html += '<li>' + errors[i] + '</li>';
		}
		html += '</ul>';
		el.innerHTML = html;
	}

};
