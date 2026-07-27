// PlayerController - responsavel pela criacao, movimentacao e sprint do player.
// Centraliza sprite, animacoes, input e estamina. A Stage apenas chama create e update.
var PlayerController = {

	sprite: null,
	controls: null,
	enterKey: null,
	escKey: null,
	sprintKey: null,

	stamina: 0,
	maxStamina: 0,
	isSprinting: false,
	recoveryTimer: 0,

	isFatigued: false,

	invulnTimer: 0,

	create: function(spawnX, spawnY){
		this.sprite = game.add.sprite(spawnX, spawnY, 'player');
		this.sprite.anchor.set(.5);
		game.physics.arcade.enable(this.sprite);

		// hitbox reduzido: foco nos pes do personagem
		// sprite tem 24x32 com anchor 0.5
		// body cobre apenas a parte inferior (pes) para colisao mais natural
		this.sprite.body.setSize(16, 18, 4, 14);

		this.sprite.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
		this.sprite.lastDirection = null;

		var cursorKeys = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.sprintKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		if(GameConfig.isMobile){
			this.controls = TouchControls.wrapCursorKeys(cursorKeys);
			this.enterKey = TouchControls.wrapKey(this.enterKey, 'enter');
			this.escKey = TouchControls.wrapKey(this.escKey, 'escape');
			this.sprintKey = TouchControls.wrapKey(this.sprintKey, 'space');
		} else {
			this.controls = cursorKeys;
		}

		this.maxStamina = GameConfig.STAMINA_MAX;
		this.stamina = this.maxStamina;
		this.isSprinting = false;
		this.isFatigued = false;
		this.invulnTimer = 0;

		return this.sprite;
	},

	update: function(){
		var s = this.sprite;
		s.body.velocity.x = 0;
		s.body.velocity.y = 0;

		var moving = this.controls.left.isDown || this.controls.right.isDown ||
		             this.controls.up.isDown || this.controls.down.isDown;

		this.isSprinting = false;
		if(moving && this.sprintKey.isDown && this.stamina > 0){
			this.isSprinting = true;
			this.recoveryTimer = GameConfig.STAMINA_RECOVERY_DELAY;
			this.stamina -= GameConfig.STAMINA_DRAIN * game.time.physicsElapsed;
			if(this.stamina <= 0){
				this.stamina = 0;
				this.isFatigued = true;
				this.recoveryTimer = GameConfig.STAMINA_RECOVERY_DELAY + GameConfig.FATIGUE_PENALTY_DELAY;
				AudioManager.playFatigue();
			}
		} else
		if(this.stamina < this.maxStamina){
			// aguardar delay antes de comecar a recuperar
			if(this.recoveryTimer > 0){
				this.recoveryTimer -= game.time.physicsElapsed;
			} else {
				this.stamina += GameConfig.STAMINA_RECOVERY * game.time.physicsElapsed;
				if(this.stamina > this.maxStamina) this.stamina = this.maxStamina;
				if(this.isFatigued && this.stamina > 0){
					this.isFatigued = false;
				}
			}
		}

		if(this.invulnTimer > 0){
			this.invulnTimer -= game.time.physicsElapsed;
		}

		var speed = this.isSprinting ? GameConfig.SPRINT_SPEED : GameConfig.PLAYER_SPEED;

		var movingX = false;
		var movingY = false;

		if(this.controls.left.isDown && !this.controls.right.isDown){
			s.body.velocity.x = -speed;
			movingX = true;
		} else
		if(this.controls.right.isDown && !this.controls.left.isDown){
			s.body.velocity.x = speed;
			movingX = true;
		}

		if(this.controls.up.isDown && !this.controls.down.isDown){
			s.body.velocity.y = -speed;
			movingY = true;
		} else
		if(this.controls.down.isDown && !this.controls.up.isDown){
			s.body.velocity.y = speed;
			movingY = true;
		}

		// limitar a dois eixos: se ambos pressionados, usa o ultimo registrado
		if(movingX && movingY){
			if(s.lastDirection === 'x'){
				s.body.velocity.y = 0;
			} else {
				s.body.velocity.x = 0;
			}
		} else
		if(movingX){
			s.lastDirection = 'x';
		} else
		if(movingY){
			s.lastDirection = 'y';
		}

		if(s.body.velocity.x < 0){
			s.animations.play('goLeft');
		} else if(s.body.velocity.x > 0){
			s.animations.play('goRight');
		} else if(s.body.velocity.y < 0){
			s.animations.play('goUp');
		} else if(s.body.velocity.y > 0){
			s.animations.play('goDown');
		} else {
			s.animations.stop();
		}
	},

	stop: function(){
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
		this.sprite.animations.stop();
	}

};
