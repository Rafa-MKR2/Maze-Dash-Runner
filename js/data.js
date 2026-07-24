var PlayerData = {

	STORAGE_KEY: 'mazeDashData',

	defaults: {
		gamesPlayed: 0,
		deaths: 0,
		totalCoins: 0,
		bestTime: null,
		bestScore: 0
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

	recordGame: function(coins, time){
		this.stats.gamesPlayed++;
		this.stats.totalCoins += coins;
		if(coins > this.stats.bestScore){
			this.stats.bestScore = coins;
		}
		if(time !== null && time !== undefined){
			if(this.stats.bestTime === null || time < this.stats.bestTime){
				this.stats.bestTime = time;
			}
		}
		this.save();
	},

	recordDeath: function(){
		this.stats.deaths++;
		this.save();
	}

};
