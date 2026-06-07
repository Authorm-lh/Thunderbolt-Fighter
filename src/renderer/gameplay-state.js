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
  projectileRadius: 5,
  damage: 15
};

export const PLAYER_SURVIVAL = {
  maxHealth: 100
};

export const BASIC_ENEMY = {
  type: 'basic',
  spawnIntervalMs: 1200,
  speed: 96,
  radius: 24,
  maxHealth: 30,
  fireIntervalMs: 1500,
  projectileSpeed: 360,
  projectileRadius: 6,
  projectileDamage: 12,
  contactDamage: 20,
  scoreValue: 100,
  lanes: [220, 420, 640, 860, 1060]
};

export const DIFFICULTY_TUNING = {
  simple: {
    enemySpawnIntervalMs: 1500,
    enemyDamageMultiplier: 0.8,
    scoreMultiplier: 0.8
  },
  normal: {
    enemySpawnIntervalMs: BASIC_ENEMY.spawnIntervalMs,
    enemyDamageMultiplier: 1,
    scoreMultiplier: 1
  },
  hard: {
    enemySpawnIntervalMs: 850,
    enemyDamageMultiplier: 1.25,
    scoreMultiplier: 1.25
  }
};

export const getDifficultyTuning = (difficulty = 'normal') => DIFFICULTY_TUNING[difficulty] ?? DIFFICULTY_TUNING.normal;

export const BACKGROUND_SCROLL = {
  speed: 36,
  tileHeight: 240
};

const isPressed = (inputState, codes) => codes.some((code) => Boolean(inputState[code]));

export const doCirclesOverlap = (first, second) => Math.hypot(first.x - second.x, first.y - second.y) <= first.radius + second.radius;

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

export const shouldSpawnBasicEnemy = ({ elapsedMs, lastSpawnedMs, difficulty = 'normal' }) => (
  elapsedMs - lastSpawnedMs >= getDifficultyTuning(difficulty).enemySpawnIntervalMs
);

export const shouldBasicEnemyFire = ({ elapsedMs, lastFiredMs }) => elapsedMs - lastFiredMs >= BASIC_ENEMY.fireIntervalMs;

export const createBasicEnemySpawn = ({ spawnIndex }) => ({
  id: `basic-${spawnIndex}`,
  type: BASIC_ENEMY.type,
  x: BASIC_ENEMY.lanes[spawnIndex % BASIC_ENEMY.lanes.length],
  y: -BASIC_ENEMY.radius,
  health: BASIC_ENEMY.maxHealth,
  lastFiredMs: -BASIC_ENEMY.fireIntervalMs
});

export const advanceBasicEnemies = ({ enemies, deltaSeconds }) => enemies.map((enemy) => ({
  ...enemy,
  y: enemy.y + BASIC_ENEMY.speed * deltaSeconds
}));

export const createBasicEnemyProjectile = ({ enemyId, x, y, difficulty = 'normal' }) => ({
  sourceEnemyId: enemyId,
  x,
  y: y + BASIC_ENEMY.radius,
  radius: BASIC_ENEMY.projectileRadius,
  damage: Math.round(BASIC_ENEMY.projectileDamage * getDifficultyTuning(difficulty).enemyDamageMultiplier)
});

export const advanceEnemyProjectiles = ({ projectiles, deltaSeconds }) => projectiles.map((projectile) => ({
  ...projectile,
  y: projectile.y + BASIC_ENEMY.projectileSpeed * deltaSeconds
}));

export const resolvePlayerProjectileEnemyHits = ({ enemies, projectiles }) => {
  const remainingEnemies = enemies.map((enemy) => ({ ...enemy }));
  const destroyedEnemies = [];
  const remainingProjectiles = [];
  let damageDealt = 0;

  projectiles.forEach((projectile) => {
    const hitEnemy = remainingEnemies.find((enemy) => doCirclesOverlap(
      { x: projectile.x, y: projectile.y, radius: projectile.radius },
      { x: enemy.x, y: enemy.y, radius: BASIC_ENEMY.radius }
    ));

    if (!hitEnemy) {
      remainingProjectiles.push(projectile);
      return;
    }

    damageDealt += Math.min(hitEnemy.health, PLAYER_WEAPON.damage);
    hitEnemy.health = Math.max(0, hitEnemy.health - PLAYER_WEAPON.damage);

    if (hitEnemy.health === 0) {
      destroyedEnemies.push({ ...hitEnemy });
      remainingEnemies.splice(remainingEnemies.indexOf(hitEnemy), 1);
    }
  });

  return {
    enemies: remainingEnemies,
    projectiles: remainingProjectiles,
    destroyedEnemies,
    damageDealt
  };
};

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

export const applyDestroyedEnemyRewards = ({ stats, destroyedEnemies, damageDealt, difficulty = 'normal' }) => ({
  ...stats,
  score: stats.score + Math.round(destroyedEnemies.length * BASIC_ENEMY.scoreValue * getDifficultyTuning(difficulty).scoreMultiplier),
  kills: stats.kills + destroyedEnemies.length,
  damageDealt: stats.damageDealt + damageDealt
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

export const resolveEnemyPlayerHits = ({ stats, player, enemyProjectiles, enemies, difficulty = 'normal' }) => {
  let damage = 0;
  const remainingProjectiles = [];
  const contactEnemies = [];

  enemyProjectiles.forEach((projectile) => {
    if (doCirclesOverlap(projectile, player)) {
      damage += projectile.damage;
      return;
    }

    remainingProjectiles.push(projectile);
  });

  enemies.forEach((enemy) => {
    if (doCirclesOverlap({ x: enemy.x, y: enemy.y, radius: BASIC_ENEMY.radius }, player)) {
      damage += Math.round(BASIC_ENEMY.contactDamage * getDifficultyTuning(difficulty).enemyDamageMultiplier);
      contactEnemies.push(enemy);
    }
  });

  return {
    stats: damage === 0 ? stats : applyPlayerDamage({ stats, damage }),
    enemyProjectiles: remainingProjectiles,
    contactEnemies
  };
};

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
