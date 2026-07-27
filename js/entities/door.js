// Door - representa a porta de saída do labirinto.
// É um elemento de cenário, não um item coletável.
// Conhece apenas posição, sprite, animação e estado.
// Não reproduz áudio, não para música, não inicia transição.
// Toda orquestração de fluxo é feita exclusivamente pelo GameStage.
var Door = function() {
	this.sprite = null;
	this.position = null;
	this.tileSize = 50;
	this.currentState = Door.State.HIDDEN;
};

// Estados explícitos da porta.
// HIDDEN = completamente invisível, não existe para o jogador.
// CLOSED = visível, porta fechada, sprite no frame 0.
// OPENING = em animação de abertura, sprite transicionando.
// OPENED = porta totalmente aberta, sprite no frame 1.
Door.State = {
	HIDDEN: 0,
	CLOSED: 1,
	OPENING: 2,
	OPENED: 3
};

Door.prototype = {

	// coloca a porta uma unica vez na posicao indicada.
	// Comeca HIDDEN (invisivel). E um elemento de cenário —
	// nao um item reutilizavel. Apos colocada, permanece ate o fim da fase.
	place: function(doorPosition, tileSize){
		this.tileSize = tileSize;
		this.position = doorPosition;
		this.currentState = Door.State.HIDDEN;

		// destroi sprite anterior (do estado anterior) se ainda existir
		if(this.sprite){
			this.sprite.destroy();
			this.sprite = null;
		}

		var x = doorPosition.col * tileSize + tileSize / 2;
		var y = doorPosition.row * tileSize + tileSize / 2;

		// spritesheet: frame 0 = fechada (primeira metade), frame 1 = aberta (segunda metade)
		this.sprite = game.add.sprite(x, y, 'door');
		this.sprite.anchor.set(.5);
		this.sprite.frame = 0;
		this.sprite.alpha = 0;
		this.sprite.visible = false;
	},

	// transicao HIDDEN → CLOSED: a porta aparece com animacao
	// chamada pelo GameStage quando o jogador coleta a chave
	appear: function(){
		if(this.currentState !== Door.State.HIDDEN) return;

		this.currentState = Door.State.CLOSED;

		this.sprite.visible = true;
		this.sprite.alpha = 1;
		this.sprite.scale.set(1);

		ParticleEffects.burstAt(this.sprite.x, this.sprite.y);
	},

	// transicao CLOSED → OPENING: chamado exclusivamente pelo GameStage
	// quando o jogador esta perto da porta e possui a chave
	startOpening: function(){
		if(this.currentState !== Door.State.CLOSED) return;

		this.currentState = Door.State.OPENING;

		// troca frame imediatamente para porta aberta
		// o timer de 3s no KeyDoorManager cuida do delay da transicao
		this.sprite.frame = 1;

		var self = this;
		game.time.events.add(Phaser.Timer.SECOND * 0.5, function(){
			self.currentState = Door.State.OPENED;
		});
	},

// retorna true se o jogador esta perto o suficiente para interagir
isNearPlayer: function(player, proximity){
	if(!this.sprite || !this.sprite.visible) return false;
	if(this.currentState !== Door.State.CLOSED) return false;
	if(!player) return false;

		var dx = player.x - this.sprite.x;
		var dy = player.y - this.sprite.y;
		return (dx * dx + dy * dy) < (proximity * proximity);
	},

	// destroi a porta e remove seu sprite.
	// Chamada pelo GameStage ao encerrar a fase.
	// A porta nao reaparece apos destruida —
	// uma nova instancia de Door e criada para a proxima fase.
	destroy: function(){
		if(this.sprite){
			this.sprite.destroy();
			this.sprite = null;
		}
		this.position = null;
		this.currentState = Door.State.HIDDEN;
	}

};