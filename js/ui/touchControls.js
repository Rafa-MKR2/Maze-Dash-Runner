// TouchControls - controles touch para dispositivos moveis.
// Cria joystick virtual e botoes A, B e Pause na tela.
// Alimenta o mesmo sistema de input do teclado via wrappers transparentes.
// Quando GameConfig.isMobile e false, modulo nao faz nada.
var TouchControls = {

	// --- ESTADO DO INPUT (lido por outros modulos via wrappers) ---
	_up: false,
	_down: false,
	_left: false,
	_right: false,
	_enter: false,
	_escape: false,
	_space: false,

	// --- CONTROLE DE BORDA ---
	_prevEnter: false,
	_prevEscape: false,
	_pauseHeld: false,
	enterJustPressed: false,
	escapeJustPressed: false,

	// --- ELEMENTOS VISUAIS ---
	group: null,
	_joystickBase: null,
	_joystickThumb: null,
	_joystickCenter: { x: 0, y: 0 },
	_joystickThumbOffset: { x: 0, y: 0 },
	buttonA: null,
	buttonB: null,
	buttonPause: null,

	// --- CONFIGURACAO DE LAYOUT ---
	JOYSTICK_RADIUS: 40,
	BUTTON_RADIUS: 25,
	PADDING: 30,

	// se o modulo esta ativo
	active: false,

	// ============================================================
	// CRIACAO
	// ============================================================

	// chamado uma vez no inicio do jogo (game.js)
	// so cria interface se for dispositivo mobile
	create: function(){
		if(!GameConfig.isMobile) return;
		this.active = true;

		// suporte a multitouch: criar ponteiros extras (1 ja existe por padrao)
		game.input.maxPointers = 4;
		game.input.addPointer();
		game.input.addPointer();
		game.input.addPointer();

		// camada visual固定 na tela (nao move com a camera)
		this.group = game.add.group();
		this.group.fixedToCamera = true;

		this._createJoystick();
		this._createButtons();
	},

	// ============================================================
	// ATUALIZACAO
	// ============================================================

	// chamado a cada frame no inicio do update dos estados principais
	// le todos os ponteiros ativos e atualiza flags de input
	update: function(){
		if(!this.active) return;

		// garantir que controles ficam sempre no topo da lista de renderizacao
		// (grupo criado no boot fica atras de todos os elementos do jogo)
		if(this.group && this.group.parent === game.world){
			game.world.bringToTop(this.group);
		}

		// salvar estado anterior para deteccao de borda
		var prevEnter = this._enter;
		var prevEscape = this._escape;

		// resetar todos os estados
		this._up = false;
		this._down = false;
		this._left = false;
		this._right = false;
		this._enter = false;
		this._escape = false;
		this._space = false;
		this._joystickThumbOffset = { x: 0, y: 0 };

		// processar todos os ponteiros ativos
		this._processPointers();

		// deteccao de borda (util para menus)
		this.enterJustPressed = this._enter && !prevEnter;
		this.escapeJustPressed = this._escape && !prevEscape;

		// atualizar visuais do joystick
		this._updateVisuals();
	},

	// ============================================================
	// WRAPPERS DE INPUT
	// ============================================================

	// envolve cursor keys do teclado para tambem ler touch
	// retorna objeto com getters isDown que checam ambos
	wrapCursorKeys: function(cursorKeys){
		var self = this;
		return {
			up:    { get isDown(){ return cursorKeys.up.isDown    || self._up; } },
			down:  { get isDown(){ return cursorKeys.down.isDown  || self._down; } },
			left:  { get isDown(){ return cursorKeys.left.isDown  || self._left; } },
			right: { get isDown(){ return cursorKeys.right.isDown || self._right; } }
		};
	},

	// envolve uma tecla individual (ENTER, ESC, SPACE)
	// touchFlag: nome da flag interna ('enter', 'escape', 'space')
	wrapKey: function(key, touchFlag){
		var self = this;
		return {
			get isDown(){ return key.isDown || self['_' + touchFlag]; }
		};
	},

	// ============================================================
	// JOYSTICK VIRTUAL
	// ============================================================

	_createJoystick: function(){
		var x = this.PADDING + this.JOYSTICK_RADIUS + 10;
		var y = game.height - this.PADDING - this.JOYSTICK_RADIUS - 10;
		this._joystickCenter = { x: x, y: y };

		// base: borda forte, fundo visivel
		this._joystickBase = game.add.graphics(x, y, this.group);
		this._joystickBase.beginFill(0x333333, 0.6);
		this._joystickBase.lineStyle(3, 0xffffff, 0.9);
		this._joystickBase.drawCircle(0, 0, this.JOYSTICK_RADIUS * 2);
		this._joystickBase.endFill();

		// cruz central
		this._joystickBase.lineStyle(2, 0xffffff, 0.6);
		this._joystickBase.moveTo(-10, 0);
		this._joystickBase.lineTo(10, 0);
		this._joystickBase.moveTo(0, -10);
		this._joystickBase.lineTo(0, 10);

		// thumb: solido e visivel
		this._joystickThumb = game.add.graphics(0, 0, this.group);
		this._joystickThumb.beginFill(0xffffff, 0.7);
		this._joystickThumb.lineStyle(3, 0xffffff, 1.0);
		this._joystickThumb.drawCircle(0, 0, this.JOYSTICK_RADIUS * 0.6);
		this._joystickThumb.endFill();
	},

	_processPointers: function(){
		var pointers = [
			game.input.pointer1,
			game.input.pointer2,
			game.input.pointer3,
			game.input.pointer4
		];

		var joystickClaimed = false;
		var pauseTouched = false;

		for(var i = 0; i < pointers.length; i++){
			var p = pointers[i];
			if(!p || !p.active || !p.isDown) continue;

			var px = p.x;
			var py = p.y;

			// joystick: primeira area tocada na metade inferior esquerda
			if(!joystickClaimed && this._isInJoystickArea(px, py)){
				this._processJoystick(px, py);
				joystickClaimed = true;
			}

			// botao A: sprint (SPACE) + selecionar (ENTER)
			if(this._isInButton(px, py, this.buttonA)){
				this._space = true;
				this._enter = true;
			}

			// botao B: reservado para interacoes futuras
			// (conversar, abrir portas, usar itens, ativar mecanismos)
			if(this._isInButton(px, py, this.buttonB)){
				// nenhuma acao no momento
			}

			// botao pause: abre/fecha pausa (ESC) com deteccao de borda
			// so dispara no primeiro frame do toque (nao segurado)
			if(this._isInButton(px, py, this.buttonPause)){
				pauseTouched = true;
				if(!this._pauseHeld){
					this._escape = true;
				}
			}
		}

		// atualizar estado do pause para proximo frame
		this._pauseHeld = pauseTouched;
	},

	_isInJoystickArea: function(px, py){
		var dx = px - this._joystickCenter.x;
		var dy = py - this._joystickCenter.y;
		// area de toque: 2.5x o raio do joystick
		return Math.sqrt(dx * dx + dy * dy) <= this.JOYSTICK_RADIUS * 2.5;
	},

	_processJoystick: function(px, py){
		var dx = px - this._joystickCenter.x;
		var dy = py - this._joystickCenter.y;
		var dist = Math.sqrt(dx * dx + dy * dy);

		// zona morta: toque muito perto do centro = sem direcao
		if(dist < 10) return;

		// limitar thumb ao raio do joystick (para visual)
		var thumbDx = dx;
		var thumbDy = dy;
		if(dist > this.JOYSTICK_RADIUS){
			thumbDx = dx / dist * this.JOYSTICK_RADIUS;
			thumbDy = dy / dist * this.JOYSTICK_RADIUS;
		}
		this._joystickThumbOffset = { x: thumbDx, y: thumbDy };

		// detectar 4 direcoes + diagonais
		// eixo dominante decide a direcao principal
		if(Math.abs(dx) > 10){
			this._right = dx > 0;
			this._left = dx < 0;
		}
		if(Math.abs(dy) > 10){
			this._down = dy > 0;
			this._up = dy < 0;
		}
	},

	// ============================================================
	// BOTOES
	// ============================================================

	_createButtons: function(){
		// botao A: canto inferior direito (sprint + selecionar)
		this.buttonA = this._createButton(
			game.width - this.PADDING - this.BUTTON_RADIUS - 10,
			game.height - this.PADDING - this.BUTTON_RADIUS * 2 - 30,
			'A'
		);

		// botao B: abaixo do A, mais a esquerda (futuro)
		this.buttonB = this._createButton(
			game.width - this.PADDING - this.BUTTON_RADIUS * 2 - 35,
			game.height - this.PADDING - this.BUTTON_RADIUS - 15,
			'B'
		);

		// botao pause: centro inferior
		this.buttonPause = this._createButton(
			game.width / 2,
			game.height - this.PADDING - this.BUTTON_RADIUS + 5,
			'PAUSE'
		);
	},

	_createButton: function(x, y, label){
		var r = this.BUTTON_RADIUS;

		// botao solido e visivel
		var gfx = game.add.graphics(x, y, this.group);
		gfx.beginFill(0x333333, 0.6);
		gfx.lineStyle(3, 0xffffff, 0.9);
		gfx.drawCircle(0, 0, r);
		gfx.endFill();

		// label
		var txt = game.add.text(x, y, label, {
			font: '12px emulogic', fill: '#ffffff'
		}, this.group);
		txt.anchor.set(0.5);

		return { gfx: gfx, txt: txt, x: x, y: y, radius: r };
	},

	_isInButton: function(px, py, button){
		if(!button) return false;
		var dx = px - button.x;
		var dy = py - button.y;
		// margem extra de 10px para facilitar o toque
		return Math.sqrt(dx * dx + dy * dy) <= button.radius + 10;
	},

	// ============================================================
	// VISUAIS
	// ============================================================

	_updateVisuals: function(){
		if(!this._joystickThumb) return;

		// mover thumb conforme direcao tocada
		// se nenhum toque, volta suavemente ao centro
		var ox = this._joystickThumbOffset.x || 0;
		var oy = this._joystickThumbOffset.y || 0;

		this._joystickThumb.x = this._joystickCenter.x + ox;
		this._joystickThumb.y = this._joystickCenter.y + oy;
	}

};
