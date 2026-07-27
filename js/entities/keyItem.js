// KeyItem - representa a chave do labirinto.
// Responsabilidade exclusiva: existir no mapa, ser coletada, e flutuar acima do jogador
// enquanto carregada. Nao gerencia HUD, nao controla inventario, nao decide transicoes.
// Apenas informa: "eu existo", "eu fui coletada", "estou sendo carregada".
var KeyItem = function() {
	this.sprite = null;
	this.position = null;
	this.collected = false;
	this.attachedToPlayer = false;
	this.playerKeySprite = null;
	this.keyTimer = null;
	this._player = null;
};

KeyItem.prototype = {

	// spawn da chave no mapa na posicao indicada
	spawn: function(keyPosition, tileSize){
		this.position = keyPosition;
		this.collected = false;
		this.attachedToPlayer = false;

		var x = keyPosition.col * tileSize + tileSize / 2;
		var y = keyPosition.row * tileSize + tileSize / 2;

		this.sprite = game.add.sprite(x, y, 'key');
		this.sprite.anchor.set(.5);
		this.sprite.frame = 0;
		game.physics.arcade.enable(this.sprite);
		this.sprite.body.setSize(24, 24, 4, 4);
		this.sprite.body.immovable = true;
		this.sprite.animations.add('idle', [0], 6, true);
		this.sprite.animations.play('idle');
	},

	// coleta a chave: remove do mapa, retorna posicao para efeitos
	collect: function(){
		if(this.collected || !this.sprite) return { collected: false };

		this.collected = true;
		var x = this.sprite.x;
		var y = this.sprite.y;

		this.sprite.destroy();
		this.sprite = null;

		return { collected: true, x: x, y: y };
	},

	// atualizacao por frame enquanto a chave esta no mapa
	update: function(){
		if(this.collected || !this.sprite) return;
		if(this.attachedToPlayer && this.playerKeySprite && this._player){
			this.playerKeySprite.x = this._player.x;
		}
	},

	// apos coletar, a chave flutua acima da cabeca do jogador por alguns instantes
	// o GameStage e quem decide quando chamar e por quanto tempo,
	// mas a KeyItem cuida da criacao e destruicao do sprite visual
	attachToPlayer: function(player, tileSize){
		if(this.attachedToPlayer || !player) return;
		this.attachedToPlayer = true;
		this._player = player;

		this.playerKeySprite = game.add.sprite(
			player.x,
			player.y - tileSize * 0.7,
			'key',
			0
		);
		this.playerKeySprite.anchor.set(.5);

		var targetY = player.y - tileSize * 1.0;
		game.add.tween(this.playerKeySprite).to({ y: targetY }, 600, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);

		this.keyTimer = game.time.events.add(GameConfig.KEY_FLOAT_DURATION, function(){
			if(this.playerKeySprite){
				this.playerKeySprite.destroy();
				this.playerKeySprite = null;
			}
			this.attachedToPlayer = false;
			this._player = null;
		}, this);
	},

	// reseta o estado da chave para uma nova fase
	reset: function(){
		this.sprite = null;
		this.position = null;
		this.collected = false;
		this.attachedToPlayer = false;
		this.playerKeySprite = null;
		if(this.keyTimer){
			game.time.events.remove(this.keyTimer);
			this.keyTimer = null;
		}
	}

};