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

	// --- JOYSTICK TRACKING ---
	// Pointer ID que esta controlando o joystick.
	// Enquanto este pointer estiver ativo, as direcoes persistem.
	_joystickPointerId: null,

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
	JOYSTICK_TOUCH_RADIUS: 115,
	JOYSTICK_MAX_DRAG: 60,
	JOYSTICK_DEADZONE: 8,
	JOYSTICK_AXIS_MIN: 8,
	PADDING: 30,

	// escala dos sprites
	PAD_SCALE: 1.7,
	NUB_SCALE: 1.7,
	BTN_SCALE: 1.5,
	PAUSE_SCALE: 1.5,

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

		// recriar group se foi destruido por transicao de estado
		// (game.state.start() destroi game.world por padrao)
		if(!this.group || !this.group.exists){
			this.group = game.add.group();
			this.group.fixedToCamera = true;
			this._createJoystick();
			this._createButtons();
			this._joystickPointerId = null;
		}

		// garantir controles no topo da lista de renderizacao
		if(this.group.parent === game.world){
			game.world.bringToTop(this.group);
		}

		// resetar apenas estados de botoes (joystick e tratado separadamente)
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
	// JOYSTICK (sprites + pointer tracking)
	// ============================================================

	_createJoystick: function(){
		var x = this.PADDING + 115;
		var y = game.height - this.PADDING - 115;
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

		var joystickFound = false;
		var pauseTouched = false;

		for(var i = 0; i < pointers.length; i++){
			var p = pointers[i];
			if(!p || !p.active) continue;

			// pointer controlando joystick e ainda pressionado?
			if(this._joystickPointerId !== null && p.id === this._joystickPointerId){
				if(p.isDown){
					this._processJoystick(p.x, p.y);
					joystickFound = true;
				} else {
					// soltou o dedo - liberar joystick
					this._joystickPointerId = null;
					this._up = false;
					this._down = false;
					this._left = false;
					this._right = false;
				}
				continue;
			}

			if(!p.isDown) continue;

			// novo toque na area do joystick? Reivindicar
			if(!joystickFound && this._joystickPointerId === null){
				if(this._isInJoystickArea(p.x, p.y)){
					this._joystickPointerId = p.id;
					this._processJoystick(p.x, p.y);
					joystickFound = true;
					continue;
				}
			}

			// botoes de acao
			if(this._isInButton(p.x, p.y, this.buttonA)){
				this._space = true;
				this._enter = true;
			}

			// botao B: reservado para interacoes futuras
			if(this._isInButton(p.x, p.y, this.buttonB)){
				// nenhuma acao no momento
			}

			if(this._isInButton(p.x, p.y, this.buttonPause)){
				pauseTouched = true;
				if(!this._pauseHeld){
					this._escape = true;
				}
			}
		}

		// pointer que controlava joystick nao esta mais na lista
		if(!joystickFound && this._joystickPointerId !== null){
			this._joystickPointerId = null;
			this._up = false;
			this._down = false;
			this._left = false;
			this._right = false;
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

		// atualizar visual do nub (sempre)
		var maxDrag = this.JOYSTICK_MAX_DRAG;
		var thumbDx = dx;
		var thumbDy = dy;
		if(dist > maxDrag){
			thumbDx = dx / dist * maxDrag;
			thumbDy = dy / dist * maxDrag;
		}
		this._joystickThumbOffset = { x: thumbDx, y: thumbDy };

		// deadzone global - nao registrar nada se muito perto do centro
		if(dist < this.JOYSTICK_DEADZONE) return;

		// detectar direcoes usando threshold proporcional ao angulo.
		// Ao inves de exigir |dx| > 10 fixo, usa a razao entre
		// o componente do eixo e a distancia total. Isso permite
		// que diagonais registrem mesmo quando um eixo e menor.
		this._up = false;
		this._down = false;
		this._left = false;
		this._right = false;

		// normalizar componentes (0 a 1 em relacao a dist)
		var nx = dx / dist;
		var ny = dy / dist;

		// eixo X: registrar se o componente normalizado for significativo
		if(Math.abs(nx) > 0.3){
			if(nx > 0) this._right = true;
			else this._left = true;
		}

		// eixo Y: registrar se o componente normalizado for significativo
		if(Math.abs(ny) > 0.3){
			if(ny > 0) this._down = true;
			else this._up = true;
		}
	},

	// ============================================================
	// BOTOES (sprites + labels)
	// ============================================================

	_createButtons: function(){
		var sw = 64 * this.BTN_SCALE;
		var sh = 64 * this.BTN_SCALE;
		var ww = 128 * this.PAUSE_SCALE;
		var wh = 64 * this.PAUSE_SCALE;

		// botao B (square): canto inferior direito
		this.buttonB = this._createButton(
			game.width - this.PADDING - sw / 2,
			game.height - this.PADDING - sh / 2 - 10,
			'btn_square', this.BTN_SCALE, 'B'
		);

		// botao A (circle): a esquerda do B, nivelado
		this.buttonA = this._createButton(
			game.width - this.PADDING - sw - sw / 2 - 25,
			game.height - this.PADDING - sh / 2 + 15,
			'btn_circle', this.BTN_SCALE, 'A'
		);

		// botao pause (wide circle): centro inferior
		this.buttonPause = this._createButton(
			game.width / 2,
			game.height - this.PADDING - wh / 2,
			'btn_wide', this.PAUSE_SCALE, 'START'
		);
	},

	_createButton: function(x, y, key, scale, label){
		var spr = game.add.sprite(x, y, key, null, this.group);
		spr.anchor.set(0.5);
		spr.scale.set(scale);
		spr.smoothed = false;
		spr.alpha = 0.85;

		// raio de deteccao baseado no tamanho do sprite
		var hw = spr.width / 2;
		var hh = spr.height / 2;
		var radius = Math.max(hw, hh);

		// label de texto no centro do botao
		var txt = null;
		if(label){
			var fontSize = (key === 'btn_wide') ? '18px' : '24px';
			txt = game.add.text(x, y, label, {
				font: fontSize + ' emulogic',
				fill: '#fff'
			}, this.group);
			txt.anchor.set(0.5);
		}

		return { sprite: spr, label: txt, x: x, y: y, radius: radius };
	},

	_isInButton: function(px, py, button){
		if(!button) return false;
		var dx = px - button.x;
		var dy = py - button.y;
		return Math.sqrt(dx * dx + dy * dy) <= button.radius + 15;
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
