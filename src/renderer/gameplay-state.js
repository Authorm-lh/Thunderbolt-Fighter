export const GAMEPLAY_PLAYFIELD = {
  width: 1280,
  height: 720
};

export const PLAYER_FLIGHT = {
  speed: 460,
  startX: GAMEPLAY_PLAYFIELD.width / 2,
  startY: GAMEPLAY_PLAYFIELD.height - 180,
  radius: 28
};

export const PLAYER_WEAPON = {
  name: 'Blaster',
  fireIntervalMs: 260,
  projectileSpeed: 880,
  projectileRadius: 5
};

export const PLAYER_SURVIVAL = {
  maxHealth: 100
};

export const BACKGROUND_SCROLL = {
  speed: 36,
  tileHeight: 240
};

const isPressed = (inputState, codes) => codes.some((code) => Boolean(inputState[code]));

export const resolvePlayerVelocity = (inputState) => {
  const xAxis = Number(isPressed(inputState, ['ArrowRight', 'KeyD'])) - Number(isPressed(inputState, ['ArrowLeft', 'KeyA']));
  const yAxis = Number(isPressed(inputState, ['ArrowDown', 'KeyS'])) - Number(isPressed(inputState, ['ArrowUp', 'KeyW']));

  if (xAxis === 0 && yAxis === 0) {
    return { x: 0, y: 0 };
  }

  const magnitude = Math.hypot(xAxis, yAxis);

  return {
    x: (xAxis / magnitude) * PLAYER_FLIGHT.speed,
    y: (yAxis / magnitude) * PLAYER_FLIGHT.speed
  };
};

export const shouldAutoFire = ({ elapsedMs, lastFiredMs }) => elapsedMs - lastFiredMs >= PLAYER_WEAPON.fireIntervalMs;

export const createRunClock = ({ runLengthMinutes }) => ({
  durationMs: runLengthMinutes * 60_000,
  remainingMs: runLengthMinutes * 60_000
});

export const advanceRunClock = ({ clock, deltaMs }) => ({
  ...clock,
  remainingMs: Math.max(0, clock.remainingMs - deltaMs)
});

export const formatRunTimer = (remainingMs) => {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
};

export const createRunStats = () => ({
  score: 0,
  health: PLAYER_SURVIVAL.maxHealth,
  maxHealth: PLAYER_SURVIVAL.maxHealth,
  weaponName: PLAYER_WEAPON.name,
  activeBuffName: 'None',
  bestScore: null,
  kills: 0,
  pickups: 0,
  shotsFired: 0,
  damageDealt: 0
});

export const createHudValues = ({ clock, stats }) => ({
  score: `Score ${stats.score}`,
  timer: `Timer ${formatRunTimer(clock.remainingMs)}`,
  health: `Health ${stats.health}/${stats.maxHealth}`,
  weapon: `Weapon ${stats.weaponName}`,
  buff: `Buff ${stats.activeBuffName}`,
  bestScore: stats.bestScore === null ? 'Best —' : `Best ${stats.bestScore}`
});

export const createResultsValues = ({ clock, stats }) => ({
  score: `Score ${stats.score}`,
  kills: `Kills ${stats.kills}`,
  timeSurvived: `Time Survived ${formatRunTimer(clock.durationMs - clock.remainingMs)}`,
  pickups: `Pickups ${stats.pickups}`,
  shotsFired: `Shots Fired ${stats.shotsFired}`,
  damageDealt: `Damage Dealt ${stats.damageDealt}`
});

export const applyPlayerDamage = ({ stats, damage }) => ({
  ...stats,
  health: Math.max(0, stats.health - damage)
});

export const getRunEndReason = ({ clock, stats }) => {
  if (stats.health <= 0) {
    return 'health-depleted';
  }

  if (clock.remainingMs <= 0) {
    return 'timer-expired';
  }

  return null;
};

export const advanceBackgroundOffset = ({ currentOffset, deltaSeconds, tileHeight }) => (
  currentOffset + BACKGROUND_SCROLL.speed * deltaSeconds
) % tileHeight;

export const createRunBaseline = () => ({
  player: { ...PLAYER_FLIGHT },
  weapon: { ...PLAYER_WEAPON },
  background: { ...BACKGROUND_SCROLL }
});
