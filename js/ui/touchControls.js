// TouchControls - controles touch para dispositivos moveis.
// Usa sprites reais do joysticks/ para joystick e botoes.
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
	_pauseHeld: false,

	// --- ELEMENTOS VISUAIS ---
	group: null,
	_joystickPad: null,
	_joystickNub: null,
	_joystickCenter: { x: 0, y: 0 },
	_joystickThumbOffset: { x: 0, y: 0 },
	buttonA: null,
	buttonB: null,
	buttonPause: null,

	// --- CONFIGURACAO ---
	JOYSTICK_TOUCH_RADIUS: 55,
	PADDING: 30,

	// escala dos sprites
	PAD_SCALE: 0.65,
	NUB_SCALE: 0.65,
	BTN_SCALE: 0.75,
	PAUSE_SCALE: 0.7,

	active: false,

	// ============================================================
	// CRIACAO
	// ============================================================

	create: function(){
		if(!GameConfig.isMobile) return;
		this.active = true;

		game.input.maxPointers = 4;
		game.input.addPointer();
		game.input.addPointer();
		game.input.addPointer();

		this.group = game.add.group();
		this.group.fixedToCamera = true;

		this._createJoystick();
		this._createButtons();
	},

	// ============================================================
	// ATUALIZACAO
	// ============================================================

	update: function(){
		if(!this.active) return;

		// garantir controles no topo da lista de renderizacao
		if(this.group && this.group.parent === game.world){
			game.world.bringToTop(this.group);
		}

		// resetar estados
		this._up = false;
		this._down = false;
		this._left = false;
		this._right = false;
		this._enter = false;
		this._escape = false;
		this._space = false;
		this._joystickThumbOffset = { x: 0, y: 0 };

		this._processPointers();
		this._updateVisuals();
	},

	// ============================================================
	// WRAPPERS DE INPUT
	// ============================================================

	wrapCursorKeys: function(cursorKeys){
		var self = this;
		return {
			up:    { get isDown(){ return cursorKeys.up.isDown    || self._up; } },
			down:  { get isDown(){ return cursorKeys.down.isDown  || self._down; } },
			left:  { get isDown(){ return cursorKeys.left.isDown  || self._left; } },
			right: { get isDown(){ return cursorKeys.right.isDown || self._right; } }
		};
	},

	wrapKey: function(key, touchFlag){
		var self = this;
		return {
			get isDown(){ return key.isDown || self['_' + touchFlag]; }
		};
	},

	// ============================================================
	// JOYSTICK (sprites)
	// ============================================================

	_createJoystick: function(){
		var x = this.PADDING + 64;
		var y = game.height - this.PADDING - 64;
		this._joystickCenter = { x: x, y: y };

		// pad (base) - sprite 128x128
		this._joystickPad = game.add.sprite(x, y, 'joy_pad', null, this.group);
		this._joystickPad.anchor.set(0.5);
		this._joystickPad.scale.set(this.PAD_SCALE);
		this._joystickPad.smoothed = false;
		this._joystickPad.alpha = 0.8;

		// nub (thumb que se move) - sprite 64x64
		this._joystickNub = game.add.sprite(x, y, 'joy_nub', null, this.group);
		this._joystickNub.anchor.set(0.5);
		this._joystickNub.scale.set(this.NUB_SCALE);
		this._joystickNub.smoothed = false;
		this._joystickNub.alpha = 0.9;
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

			if(!joystickClaimed && this._isInJoystickArea(px, py)){
				this._processJoystick(px, py);
				joystickClaimed = true;
			}

			if(this._isInButton(px, py, this.buttonA)){
				this._space = true;
				this._enter = true;
			}

			// botao B: reservado para interacoes futuras
			if(this._isInButton(px, py, this.buttonB)){
				// nenhuma acao no momento
			}

			if(this._isInButton(px, py, this.buttonPause)){
				pauseTouched = true;
				if(!this._pauseHeld){
					this._escape = true;
				}
			}
		}

		this._pauseHeld = pauseTouched;
	},

	_isInJoystickArea: function(px, py){
		var dx = px - this._joystickCenter.x;
		var dy = py - this._joystickCenter.y;
		return Math.sqrt(dx * dx + dy * dy) <= this.JOYSTICK_TOUCH_RADIUS;
	},

	_processJoystick: function(px, py){
		var dx = px - this._joystickCenter.x;
		var dy = py - this._joystickCenter.y;
		var dist = Math.sqrt(dx * dx + dy * dy);

		if(dist < 10) return;

		// limitar nub ao raio visual
		var maxDist = 35;
		var thumbDx = dx;
		var thumbDy = dy;
		if(dist > maxDist){
			thumbDx = dx / dist * maxDist;
			thumbDy = dy / dist * maxDist;
		}
		this._joystickThumbOffset = { x: thumbDx, y: thumbDy };

		// detectar direcoes
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
	// BOTOES (sprites)
	// ============================================================

	_createButtons: function(){
		var cw = 64 * this.BTN_SCALE;
		var ch = 64 * this.BTN_SCALE;
		var pw = 128 * this.PAUSE_SCALE;
		var ph = 64 * this.PAUSE_SCALE;

		// botao A (circle): canto inferior direito
		this.buttonA = this._createButton(
			game.width - this.PADDING - cw / 2 - 10,
			game.height - this.PADDING - ch - 25,
			'btn_circle', this.BTN_SCALE
		);

		// botao B (square): abaixo e a esquerda do A
		this.buttonB = this._createButton(
			game.width - this.PADDING - cw - 25,
			game.height - this.PADDING - ch / 2 - 10,
			'btn_square', this.BTN_SCALE
		);

		// botao pause (wide circle): centro inferior
		this.buttonPause = this._createButton(
			game.width / 2,
			game.height - this.PADDING - ph / 2 + 5,
			'btn_wide', this.PAUSE_SCALE
		);
	},

	_createButton: function(x, y, key, scale){
		var spr = game.add.sprite(x, y, key, null, this.group);
		spr.anchor.set(0.5);
		spr.scale.set(scale);
		spr.smoothed = false;
		spr.alpha = 0.85;

		// raio de deteccao baseado no tamanho do sprite
		var hw = spr.width / 2;
		var hh = spr.height / 2;
		var radius = Math.max(hw, hh);

		return { sprite: spr, x: x, y: y, radius: radius };
	},

	_isInButton: function(px, py, button){
		if(!button) return false;
		var dx = px - button.x;
		var dy = py - button.y;
		return Math.sqrt(dx * dx + dy * dy) <= button.radius + 10;
	},

	// ============================================================
	// VISUAIS
	// ============================================================

	_updateVisuals: function(){
		if(!this._joystickNub) return;

		var ox = this._joystickThumbOffset.x || 0;
		var oy = this._joystickThumbOffset.y || 0;

		this._joystickNub.x = this._joystickCenter.x + ox;
		this._joystickNub.y = this._joystickCenter.y + oy;
	}

};
