// KeyDoorManager - gerencia todo o fluxo de chave e porta.
// Responsabilidades: spawn, coleta da chave, aparecimento da porta,
// abertura da porta e transicao de vitoria.
// GameStage apenas registra callbacks para efeitos visuais e audio.
// Nenhum goblin ou outra entidade interage com chave ou porta.
// A porta e um elemento de cenario SEM corpo fisico —
// nao pode ser detectada por physics.arcade.overlap.
var KeyDoorManager = function(config){
	this.hasKey = false;
	this.isFrozen = false;
	this.keyItem = null;
	this.door = null;
	this.tileSize = GameConfig.TILE_SIZE;

	this._doorProcessed = false;

	this.onKeyCollected = config.onKeyCollected || function(){};
	this.onStageComplete = config.onStageComplete || function(){};
};

KeyDoorManager.prototype = {

	spawn: function(keyPosition, doorPosition, tileSize){
		this.tileSize = tileSize;
		this.keyItem = new KeyItem();
		this.door = new Door();
		this.hasKey = false;
		this.isFrozen = false;
		this._doorProcessed = false;

		if(keyPosition){
			this.keyItem.spawn(keyPosition, tileSize);
		}
		if(doorPosition){
			this.door.place(doorPosition, tileSize);
		}
	},

	update: function(player){
		if(this.isFrozen) return;

		if(this.keyItem && this.keyItem.sprite){
			game.physics.arcade.overlap(
				player,
				this.keyItem.sprite,
				this._collectKey,
				null,
				this
			);
		}

		if(this.door && this.hasKey && this.door.isNearPlayer(player, 35)){
			this._touchDoor();
		}

		if(this.keyItem) this.keyItem.update();
	},

	isComplete: function(){
		return this.isFrozen;
	},

	_collectKey: function(player, key){
		var result = this.keyItem.collect();
		if(!result.collected) return;

		this.hasKey = true;
		this.keyItem.attachToPlayer(player, this.tileSize);

		if(this.door){
			this.door.appear();
		}

		this.onKeyCollected(result.x, result.y);
	},

	_touchDoor: function(){
		if(this._doorProcessed) return;
		this._doorProcessed = true;
		this.isFrozen = true;
		this.door.startOpening();

		var self = this;
		game.time.events.add(Phaser.Timer.SECOND * 3, function(){
			self._finishStage();
		});
	},

	_finishStage: function(){
		if(this.keyItem) this.keyItem.reset();
		if(this.door) this.door.destroy();
		this.keyItem = null;
		this.door = null;
		this.hasKey = false;
		this.isFrozen = false;

		this.onStageComplete();
	},

	reset: function(){
		if(this.keyItem) this.keyItem.reset();
		if(this.door) this.door.destroy();
		this.keyItem = null;
		this.door = null;
		this.hasKey = false;
		this.isFrozen = false;
		this._doorProcessed = false;
	}

};
