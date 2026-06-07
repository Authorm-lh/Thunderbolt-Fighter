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

export const PICKUP_BUFFS = {
  healing: {
    type: 'healing',
    label: 'Repair',
    healAmount: 25
  }
};

export const ENEMY_CLASSES = {
  basic: {
    type: 'basic',
    spawnIntervalMs: 1200,
    speed: 48,
    radius: 24,
    maxHealth: 30,
    fireIntervalMs: 1500,
    projectileSpeed: 360,
    projectileRadius: 6,
    projectileDamage: 12,
    contactDamage: 20,
    escapedDamage: 5,
    scoreValue: 100,
    movementPattern: 'straight',
    maxHorizontalOffset: 0,
    lanes: [220, 420, 640, 860, 1060]
  },
  elite: {
    type: 'elite',
    spawnIntervalMs: 2400,
    speed: 66,
    radius: 28,
    maxHealth: 60,
    fireIntervalMs: 950,
    projectileSpeed: 420,
    projectileRadius: 7,
    projectileDamage: 18,
    contactDamage: 30,
    escapedDamage: 10,
    scoreValue: 260,
    movementPattern: 'sway',
    maxHorizontalOffset: 42,
    lanes: [300, 540, 780, 1020]
  }
};

export const BASIC_ENEMY = ENEMY_CLASSES.basic;

export const getEnemyClass = (enemyType = 'basic') => ENEMY_CLASSES[enemyType] ?? ENEMY_CLASSES.basic;

export const resolveEnemyTypeForSpawn = ({ spawnIndex }) => (spawnIndex > 0 && spawnIndex % 4 === 3 ? 'elite' : 'basic');

export const DIFFICULTY_TUNING = {
  simple: {
    enemySpawnIntervalMs: 2200,
    maxActiveEnemies: 4,
    enemyFireIntervalMultiplier: 3.2,
    enemyProjectileDamageMultiplier: 0.5,
    enemyContactDamageMultiplier: 0.75,
    scoreMultiplier: 0.8
  },
  normal: {
    enemySpawnIntervalMs: BASIC_ENEMY.spawnIntervalMs,
    maxActiveEnemies: 7,
    enemyFireIntervalMultiplier: 2,
    enemyProjectileDamageMultiplier: 1,
    enemyContactDamageMultiplier: 1,
    scoreMultiplier: 1
  },
  hard: {
    enemySpawnIntervalMs: 800,
    maxActiveEnemies: 10,
    enemyFireIntervalMultiplier: 1.5,
    enemyProjectileDamageMultiplier: 1.25,
    enemyContactDamageMultiplier: 1.25,
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

export const shouldSpawnBasicEnemy = ({ elapsedMs, lastSpawnedMs, activeEnemyCount = 0, difficulty = 'normal' }) => {
  const tuning = getDifficultyTuning(difficulty);

  return activeEnemyCount < tuning.maxActiveEnemies && elapsedMs - lastSpawnedMs >= tuning.enemySpawnIntervalMs;
};

export const shouldBasicEnemyFire = ({ elapsedMs, lastFiredMs, enemyType = 'basic', difficulty = 'normal' }) => {
  const enemyClass = getEnemyClass(enemyType);
  const fireIntervalMs = enemyClass.fireIntervalMs * getDifficultyTuning(difficulty).enemyFireIntervalMultiplier;

  return elapsedMs - lastFiredMs >= fireIntervalMs;
};

export const createEnemySpawn = ({ spawnIndex, enemyType = 'basic' }) => {
  const enemyClass = getEnemyClass(enemyType);

  return {
    id: `${enemyClass.type}-${spawnIndex}`,
    type: enemyClass.type,
    x: enemyClass.lanes[spawnIndex % enemyClass.lanes.length],
    y: -enemyClass.radius,
    health: enemyClass.maxHealth,
    lastFiredMs: -enemyClass.fireIntervalMs,
    movementOriginX: enemyClass.lanes[spawnIndex % enemyClass.lanes.length]
  };
};

export const createBasicEnemySpawn = ({ spawnIndex }) => createEnemySpawn({ spawnIndex, enemyType: 'basic' });

export const advanceBasicEnemies = ({ enemies, deltaSeconds }) => enemies.map((enemy) => {
  const enemyClass = getEnemyClass(enemy.type);
  const y = enemy.y + enemyClass.speed * deltaSeconds;
  const x = enemyClass.movementPattern === 'sway'
    ? enemy.movementOriginX + Math.sin((y + enemyClass.radius) / 80) * enemyClass.maxHorizontalOffset
    : enemy.x;

  return {
    ...enemy,
    x,
    y
  };
});

export const createBasicEnemyProjectile = ({ enemyId, x, y, enemyType = 'basic', difficulty = 'normal' }) => {
  const enemyClass = getEnemyClass(enemyType);

  return {
    sourceEnemyId: enemyId,
    x,
    y: y + enemyClass.radius,
    radius: enemyClass.projectileRadius,
    damage: Math.round(enemyClass.projectileDamage * getDifficultyTuning(difficulty).enemyProjectileDamageMultiplier),
    speed: enemyClass.projectileSpeed
  };
};

export const advanceEnemyProjectiles = ({ projectiles, deltaSeconds }) => projectiles.map((projectile) => ({
  ...projectile,
  y: projectile.y + (projectile.speed ?? BASIC_ENEMY.projectileSpeed) * deltaSeconds
}));

export const resolvePlayerProjectileEnemyHits = ({ enemies, projectiles }) => {
  const remainingEnemies = enemies.map((enemy) => ({ ...enemy }));
  const destroyedEnemies = [];
  const remainingProjectiles = [];
  let damageDealt = 0;

  projectiles.forEach((projectile) => {
    const hitEnemy = remainingEnemies.find((enemy) => doCirclesOverlap(
      { x: projectile.x, y: projectile.y, radius: projectile.radius },
      { x: enemy.x, y: enemy.y, radius: getEnemyClass(enemy.type).radius }
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
  score: stats.score + destroyedEnemies.reduce(
    (score, enemy) => score + Math.round(getEnemyClass(enemy.type).scoreValue * getDifficultyTuning(difficulty).scoreMultiplier),
    0
  ),
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

export const applyPickupBuff = ({ stats, pickupType }) => {
  const pickup = PICKUP_BUFFS[pickupType];

  if (pickupType === 'healing') {
    return {
      ...stats,
      health: Math.min(stats.maxHealth, stats.health + pickup.healAmount),
      pickups: stats.pickups + 1
    };
  }

  return stats;
};

export const resolveEscapedEnemyHits = ({ stats, enemies, difficulty = 'normal' }) => {
  let damage = 0;
  const escapedEnemies = [];
  const remainingEnemies = [];

  enemies.forEach((enemy) => {
    const enemyClass = getEnemyClass(enemy.type);

    if (enemy.y > GAMEPLAY_PLAYFIELD.height + enemyClass.radius) {
      damage += enemyClass.escapedDamage;
      escapedEnemies.push(enemy);
      return;
    }

    remainingEnemies.push(enemy);
  });

  return {
    stats: damage === 0 ? stats : applyPlayerDamage({ stats, damage }),
    enemies: remainingEnemies,
    escapedEnemies
  };
};

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
    const enemyClass = getEnemyClass(enemy.type);

    if (doCirclesOverlap({ x: enemy.x, y: enemy.y, radius: enemyClass.radius }, player)) {
      damage += Math.round(enemyClass.contactDamage * getDifficultyTuning(difficulty).enemyContactDamageMultiplier);
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

export const createRunBaseline = ({ difficulty = 'normal' } = {}) => ({
  player: { ...PLAYER_FLIGHT },
  weapon: { ...PLAYER_WEAPON },
  background: { ...BACKGROUND_SCROLL },
  difficulty,
  difficultyTuning: { ...getDifficultyTuning(difficulty) }
});
