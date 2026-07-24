// ChaseAnimation -- animacao decorativa compartilhada entre menu e credits.
// A moeda lidera, o player persegue a moeda, o goblin persegue o player.
// Ao inves de duplicar essa logica, ambos os estados criam uma instancia
// e chamam update a cada frame.
var ChaseAnimation = {

	// cria o grupo de perseguicao decorativo
	// config: { y, includeCoin }
	// includeCoin: se true, cria a moeda liderando (usado no menu)
	// se false, apenas player e goblin (usado nos creditos)
	create: function(config){
		var y = config.y || 145;
		var includeCoin = config.includeCoin !== false;

		var anim = {};
		anim.sprites = [];

		if(includeCoin){
			anim.coin = game.add.sprite(0, y, 'coin');
			anim.coin.anchor.set(.5);
			anim.coin.smoothed = false;
			anim.coin.animations.add('spin', [0,1,2,3,4,5,6,7,8,9], 10, true).play();
			anim.coin.speedX = 180;
			anim.coin.speedY = 0;
			anim.sprites.push(anim.coin);
		}

		anim.player = game.add.sprite(0, y, 'player');
		anim.player.anchor.set(.5);
		anim.player.smoothed = false;
		anim.player.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		anim.player.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		anim.player.chaseSpeed = 165;
		anim.sprites.push(anim.player);

		anim.enemy = game.add.sprite(0, y, 'enemy');
		anim.enemy.anchor.set(.5);
		anim.enemy.smoothed = false;
		anim.enemy.animations.add('runRight', [24,25,26,27,28,29,30,31], 12, true);
		anim.enemy.animations.add('runLeft', [16,17,18,19,20,21,22,23], 12, true);
		anim.enemy.chaseSpeed = 180;
		anim.sprites.push(anim.enemy);

		ChaseAnimation.respawn(anim, includeCoin);
		return anim;
	},

	// reposiciona todos os sprites em uma lateral aleatoria
	respawn: function(anim, includeCoin){
		var goRight = Math.random() < 0.5;
		var baseY = 100 + Math.random() * 100;

		if(includeCoin && anim.coin){
			if(goRight){
				anim.coin.x = -30;
				anim.coin.speedX = 120 + Math.random() * 60;
				anim.player.x = -80;
				anim.enemy.x = -160;
			} else {
				anim.coin.x = game.width + 30;
				anim.coin.speedX = -(120 + Math.random() * 60);
				anim.player.x = game.width + 80;
				anim.enemy.x = game.width + 160;
			}
			anim.coin.y = baseY;
			anim.coin.speedY = (Math.random() - 0.5) * 30;
		} else {
			if(goRight){
				anim.player.x = -30;
				anim.player.speedX = 120 + Math.random() * 40;
				anim.enemy.x = -90;
				anim.player.animations.play('runRight');
				anim.enemy.animations.play('runRight');
			} else {
				anim.player.x = game.width + 30;
				anim.player.speedX = -(120 + Math.random() * 40);
				anim.enemy.x = game.width + 90;
				anim.player.animations.play('runLeft');
				anim.enemy.animations.play('runLeft');
			}
		}

		anim.player.y = baseY;
		anim.enemy.y = baseY;
	},

	// atualiza movimentacao e animacoes a cada frame
	update: function(anim, includeCoin){
		var dt = game.time.physicsElapsed;

		// moeda lidera - movimento livre
		if(includeCoin && anim.coin){
			anim.coin.x += anim.coin.speedX * dt;
			anim.coin.y += anim.coin.speedY * dt;
		}

		// player persegue - desacelera ao chegar perto para nunca alcancar
		if(includeCoin && anim.coin){
			var dxCoin = anim.coin.x - anim.player.x;
			var dyCoin = anim.coin.y - anim.player.y;
			var distCoin = Math.sqrt(dxCoin * dxCoin + dyCoin * dyCoin);
			if(distCoin > 3){
				var mul = Phaser.Math.clamp(distCoin / 150, 0.15, 1.0);
				anim.player.x += (dxCoin / distCoin) * anim.player.chaseSpeed * dt * mul;
				anim.player.y += (dyCoin / distCoin) * anim.player.chaseSpeed * dt * 0.3 * mul;
			}
		} else {
			// no credits, player corre livremente
			anim.player.x += anim.player.speedX * dt;
		}

		// goblin persegue o player - desacelera ao chegar perto
		var dxPlayer = anim.player.x - anim.enemy.x;
		var dyPlayer = anim.player.y - anim.enemy.y;
		var distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
		if(distPlayer > 3){
			var mul2 = Phaser.Math.clamp(distPlayer / 150, 0.15, 1.0);
			anim.enemy.x += (dxPlayer / distPlayer) * anim.enemy.chaseSpeed * dt * mul2;
			anim.enemy.y += (dyPlayer / distPlayer) * anim.enemy.chaseSpeed * dt * 0.3 * mul2;
		}

		// animacao baseada na direcao horizontal
		if(includeCoin && anim.coin){
			var dxCoin2 = anim.coin.x - anim.player.x;
			if(dxCoin2 > 8){
				anim.player.animations.play('runRight');
			} else if(dxCoin2 < -8){
				anim.player.animations.play('runLeft');
			}
		} else {
			if(anim.player.speedX > 0){
				anim.player.animations.play('runRight');
			} else {
				anim.player.animations.play('runLeft');
			}
		}

		if(dxPlayer > 8){
			anim.enemy.animations.play('runRight');
		} else if(dxPlayer < -8){
			anim.enemy.animations.play('runLeft');
		}

		// manter dentro da faixa vertical visivel
		for(var i = 0; i < anim.sprites.length; i++){
			anim.sprites[i].y = Phaser.Math.clamp(anim.sprites[i].y, 80, game.height - 30);
		}

		// todos sairam da tela -> respawn em grupo
		var allOffRight = true;
		var allOffLeft = true;
		for(var i = 0; i < anim.sprites.length; i++){
			if(anim.sprites[i].x <= game.width + 50) allOffRight = false;
			if(anim.sprites[i].x >= -50) allOffLeft = false;
		}

		if(allOffRight || allOffLeft){
			ChaseAnimation.respawn(anim, includeCoin);
		}
	}

};
