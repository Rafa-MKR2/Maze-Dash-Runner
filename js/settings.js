var SettingsManager = {

	STORAGE_KEY: 'mazeDashSettings',

	defaults: {
		music: true,
		sfx: true,
		volume: 80,
		fullscreen: false
	},

	data: {},

	load: function(){
		try {
			var saved = localStorage.getItem(this.STORAGE_KEY);
			if(saved){
				this.data = JSON.parse(saved);
				// preencher campos ausentes com defaults
				for(var key in this.defaults){
					if(this.data[key] === undefined){
						this.data[key] = this.defaults[key];
					}
				}
			} else {
				this.data = JSON.parse(JSON.stringify(this.defaults));
			}
		} catch(e){
			this.data = JSON.parse(JSON.stringify(this.defaults));
		}
	},

	save: function(){
		try {
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
		} catch(e){}
	},

	get: function(key){
		return this.data[key];
	},

	set: function(key, value){
		this.data[key] = value;
		this.save();
	}

};
