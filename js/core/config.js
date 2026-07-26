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

	// fatigue penalty when stamina hits zero
	// 3s normal delay + 2s penalty = 5s total
	FATIGUE_PENALTY_DELAY: 2,

	// invulnerability after teleport (seconds)
	INVULNERABILITY_AFTER_TELEPORT: 1,

	// regressive timer (seconds)
	TIME_LIMIT: 240,

	// coins stolen by goblin per hit
	GOBLIN_STEAL_COINS: 3,

	// bonus seconds per coin collected
	TIME_BONUS_PER_COIN: 2,

	// floating text duration (ms)
	FLOAT_TEXT_DURATION: 1000,

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
	COIN_COUNT: 6,

	// chave: duracao da flutuacao acima do jogador apos coleta (ms)
	KEY_FLOAT_DURATION: 3000,

	// animacao de aparencia da porta (ms)
	DOOR_APPEAR_DURATION: 400

};
