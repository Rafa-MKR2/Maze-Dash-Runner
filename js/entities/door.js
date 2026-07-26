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
	this._openingTween = null;
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

		var x = doorPosition.col * tileSize + tileSize;
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
		this.sprite.alpha = 0;
		this.sprite.scale.set(0.3);

		var tween = game.add.tween(this.sprite);
		tween.to({ alpha: 1, scale: 1 }, 400, Phaser.Easing.Elastic.Out, true);

		// partículas de destaque ao aparecer (efeito visual, sem som)
		ParticleEffects.burstAt(this.sprite.x, this.sprite.y);
	},

	// transicao CLOSED → OPENING: chamado exclusivamente pelo GameStage
	// quando o jogador esta perto da porta e possui a chave
	startOpening: function(){
		if(this.currentState !== Door.State.CLOSED) return;

		this.currentState = Door.State.OPENING;

		var self = this;
		this._openingTween = game.add.tween(this.sprite);
		this._openingTween.to({ alpha: 1 }, 200, Phaser.Easing.Linear.None, true);
		this._openingTween.onComplete.add(function(){
			// apos a animacao, vai direto para OPENED
			self.currentState = Door.State.OPENED;
			self.sprite.frame = 1;
		}, this);
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

	// atualizacao por frame (para gerenciar animacoes de estado)
	update: function(){
		// OPENING eh gerido internamente pelo tween onComplete
		// nenhuma logica adicional necessaria aqui
	},

	// destroi a porta e remove seu sprite.
	// Chamada pelo GameStage ao encerrar a fase.
	// A porta nao reaparece apos destruida —
	// uma nova instancia de Door e criada para a proxima fase.
	destroy: function(){
		if(this._openingTween){
			this._openingTween.stop();
			this._openingTween = null;
		}
		if(this.sprite){
			this.sprite.destroy();
			this.sprite = null;
		}
		this.position = null;
		this.currentState = Door.State.HIDDEN;
	}

};