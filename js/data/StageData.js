// StageData - registro central de dados de fases.
// Nao contem logica — apenas armazena e entrega dados puros.
// Cada fase registra seus dados via StageData.register().
// O Director consome esses dados e os enriquece com logica em tempo real.
var StageData = {

	_registry: {},

	// registra uma fase no catalogo.
	// data deve conter: stage, id, name, map, enemySpawns.
	register: function(data){
		var stage = data.stage;
		if(!this._registry[stage]){
			this._registry[stage] = [];
		}
		this._registry[stage].push(data);
	},

	// retorna todas as variacoes de um stage.
	// retorna array vazio se nao existir.
	getVariations: function(stageNumber){
		return this._registry[stageNumber] || [];
	}

};
