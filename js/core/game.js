var game = new Phaser.Game(750, 500, Phaser.CANVAS);

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('records', recordsState);
game.state.add('credits', creditsState);
game.state.add('stage1', gameStage);
game.state.add('end', endState);

game.state.start('boot');
