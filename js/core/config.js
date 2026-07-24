var GameConfig = {

	TILE_SIZE: 50,
	PLAYER_SPEED: 100,
	ENEMY_SPEED: 60,
	DEBOUNCE_DELAY: 200,
	TRANSITION_SPEED: 300,

	// sprint
	SPRINT_SPEED: 190,
	STAMINA_MAX: 100,
	STAMINA_DRAIN: 30,
	STAMINA_RECOVERY_DELAY: 3,
	STAMINA_RECOVERY: 8,

	// fullscreen API (detectado no boot)
	isMobile: false,
	fullscreenEnabled: false,
	requestFullscreen: null,
	exitFullscreen: null,
	fullscreenElement: null,
	fullscreenChange: null,

	GOBLIN_CHASE_SPEED: 75,
	GOBLIN_VISION_DISTANCE: 200,
	GOBLIN_FOV: 50,
	GOBLIN_HINT_INTERVAL: 10,
	COIN_COUNT: 6

};
