var PlayerData = {

	STORAGE_KEY: 'mazeDashData',

	defaults: {
		bestScore: 0,
		bestTime: null,
		levelsCompleted: 0
	},

	stats: {},

	load: function(){
		try {
			var saved = localStorage.getItem(this.STORAGE_KEY);
			if(saved){
				this.stats = JSON.parse(saved);
				for(var key in this.defaults){
					if(this.stats[key] === undefined){
						this.stats[key] = this.defaults[key];
					}
				}
			} else {
				this.stats = JSON.parse(JSON.stringify(this.defaults));
			}
		} catch(e){
			this.stats = JSON.parse(JSON.stringify(this.defaults));
		}
	},

	save: function(){
		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
		} catch(e){}
	},

	recordGame: function(score, time){
		if(score > this.stats.bestScore){
			this.stats.bestScore = score;
		}
		if(time !== null && time !== undefined){
			if(this.stats.bestTime === null || time < this.stats.bestTime){
				this.stats.bestTime = time;
			}
		}
		this.save();
	},

	recordLevelComplete: function(){
		this.stats.levelsCompleted++;
		this.save();
	}

};
