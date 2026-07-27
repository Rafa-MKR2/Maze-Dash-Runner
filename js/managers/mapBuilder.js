var MapBuilder = {

	build: function(map, tileSize){
		var maze = map.maze;

		game.add.sprite(0, 0, 'bg');

		var groundKeys = ['ground_grass00', 'ground_grass01', 'ground_grass02', 'ground_grass03'];

		var blocks = game.add.group();
		blocks.enableBody = true;
		var startPosition = null;
		var walkablePositions = [];

		for(var row = 0; row < maze.length; row++){
			for(var col = 0; col < maze[row].length; col++){
				var tile = maze[row][col];
				var x = col * tileSize;
				var y = row * tileSize;

				if(tile === 1){
					var block = blocks.create(x, y, 'block');
					block.body.immovable = true;
				} else {
					var key = groundKeys[Math.floor(Math.random() * groundKeys.length)];
					var ground = game.add.sprite(x, y, key);
					ground.scale.set(tileSize / ground.width, tileSize / ground.height);

					if(tile === 2){
						startPosition = { x: x + tileSize / 2, y: y + tileSize / 2 };
					} else {
						walkablePositions.push({
							x: x + tileSize / 2,
							y: y + tileSize / 2
						});
					}
				}
			}
		}

		return {
			blocks: blocks,
			startPosition: startPosition,
			walkablePositions: walkablePositions
		};
	}

};
