// ParticleEffects - responsavel pelo sistema de particulas do jogo.
// Criado separadamente para permitir que futuras fases utilizem
// efeitos diferentes sem alterar a Stage.
var ParticleEffects = {

	emitter: null,

	init: function(){
		this.emitter = game.add.emitter(0, 0, 20);
		this.emitter.makeParticles('part');
		this.emitter.setXSpeed(-20, 20);
		this.emitter.setYSpeed(-20, 20);
		this.emitter.gravity.y = 0;
	},

	// explosao de particulas em uma posicao
	burstAt: function(x, y){
		this.emitter.x = x;
		this.emitter.y = y;
		this.emitter.start(true, 600, null, 12);
	}

};
