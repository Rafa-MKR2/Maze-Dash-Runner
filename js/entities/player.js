// PlayerController - responsavel pela criacao e movimentacao do player.
// Centraliza sprite, animacoes e input. A Stage apenas chama create e update.
var PlayerController = {

	sprite: null,
	controls: null,
	enterKey: null,
	escKey: null,

	// cria o player na posicao indicada e configura animacoes
	create: function(spawnX, spawnY){
		this.sprite = game.add.sprite(spawnX, spawnY, 'player');
		this.sprite.anchor.set(.5);
		game.physics.arcade.enable(this.sprite);

		this.sprite.animations.add('goDown', [0,1,2,3,4,5,6,7], 12, true);
		this.sprite.animations.add('goUp', [8,9,10,11,12,13,14,15], 12, true);
		this.sprite.animations.add('goLeft', [16,17,18,19,20,21,22,23], 12, true);
		this.sprite.animations.add('goRight', [24,25,26,27,28,29,30,31], 12, true);
		this.sprite.lastDirection = null;

		// controles de teclado usados pela gameplay e pela pausa
		this.controls = game.input.keyboard.createCursorKeys();
		this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);

		return this.sprite;
	},

	// processa input do teclado e move o player
	// limita a dois eixos: se ambos pressionados, usa o ultimo registrado
	update: function(){
		var s = this.sprite;
		s.body.velocity.x = 0;
		s.body.velocity.y = 0;

		var movingX = false;
		var movingY = false;

		if(this.controls.left.isDown && !this.controls.right.isDown){
			s.body.velocity.x = -GameConfig.PLAYER_SPEED;
			movingX = true;
		} else
		if(this.controls.right.isDown && !this.controls.left.isDown){
			s.body.velocity.x = GameConfig.PLAYER_SPEED;
			movingX = true;
		}

		if(this.controls.up.isDown && !this.controls.down.isDown){
			s.body.velocity.y = -GameConfig.PLAYER_SPEED;
			movingY = true;
		} else
		if(this.controls.down.isDown && !this.controls.up.isDown){
			s.body.velocity.y = GameConfig.PLAYER_SPEED;
			movingY = true;
		}

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

		// animacao baseada na direcao do movimento
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

	// zera velocidade (usado na pausa)
	stop: function(){
		this.sprite.body.velocity.x = 0;
		this.sprite.body.velocity.y = 0;
		this.sprite.animations.stop();
	}

};
