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
  },
  shield: {
    type: 'shield',
    label: 'Shield',
    shieldAmount: 35
  },
  'attack-power': {
    type: 'attack-power',
    label: 'Power',
    damage: 25,
    durationMs: 8_000
  },
  'attack-speed': {
    type: 'attack-speed',
    label: 'Rapid',
    fireIntervalMs: 130,
    durationMs: 8_000
  },
  'dual-shot': {
    type: 'dual-shot',
    label: 'Dual Shot'
  },
  'spread-shot': {
    type: 'spread-shot',
    label: 'Spread Shot'
  },
  'piercing-shot': {
    type: 'piercing-shot',
    label: 'Piercing Shot'
  }
};

export const PICKUP_SPAWNING = {
  spawnIntervalMs: 5_000,
  maxActivePickups: 3,
  radius: 18,
  speed: 72,
  lanes: [180, 360, 540, 720, 900, 1080]
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

export const getPlayerFireIntervalMs = (stats = createRunStats()) => (
  stats.activeBuffs.attackSpeed.remainingMs > 0 ? PICKUP_BUFFS['attack-speed'].fireIntervalMs : PLAYER_WEAPON.fireIntervalMs
);

export const shouldAutoFire = ({ elapsedMs, lastFiredMs, stats }) => elapsedMs - lastFiredMs >= getPlayerFireIntervalMs(stats);

export const createPlayerProjectiles = ({ player, stats = createRunStats() }) => {
  const y = player.y - player.radius;
  const baseProjectile = {
    y,
    radius: PLAYER_WEAPON.projectileRadius,
    speed: PLAYER_WEAPON.projectileSpeed,
    velocityX: 0,
    piercing: false
  };

  if (stats.weaponShape === 'dual-shot') {
    return [-12, 12].map((offsetX) => ({ ...baseProjectile, x: player.x + offsetX }));
  }

  if (stats.weaponShape === 'spread-shot') {
    return [-140, 0, 140].map((velocityX) => ({ ...baseProjectile, x: player.x, velocityX }));
  }

  if (stats.weaponShape === 'piercing-shot') {
    return [{ ...baseProjectile, x: player.x, piercing: true }];
  }

  return [{ ...baseProjectile, x: player.x }];
};

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

export const shouldSpawnPickup = ({ elapsedMs, lastSpawnedMs, activePickupCount = 0 }) => (
  activePickupCount < PICKUP_SPAWNING.maxActivePickups && elapsedMs - lastSpawnedMs >= PICKUP_SPAWNING.spawnIntervalMs
);

export const createPickupSpawn = ({ spawnIndex }) => {
  const pickupTypes = Object.keys(PICKUP_BUFFS);
  const type = pickupTypes[spawnIndex % pickupTypes.length];
  const x = PICKUP_SPAWNING.lanes[spawnIndex % PICKUP_SPAWNING.lanes.length];

  return {
    id: `pickup-${spawnIndex}-${type}`,
    type,
    label: PICKUP_BUFFS[type].label,
    x,
    y: -PICKUP_SPAWNING.radius,
    radius: PICKUP_SPAWNING.radius,
    speed: PICKUP_SPAWNING.speed
  };
};

export const advancePickups = ({ pickups, deltaSeconds }) => pickups.map((pickup) => ({
  ...pickup,
  y: pickup.y + pickup.speed * deltaSeconds
}));

export const resolvePlayerPickupHits = ({ stats, player, pickups }) => {
  let nextStats = stats;
  const collectedPickups = [];
  const remainingPickups = [];

  pickups.forEach((pickup) => {
    if (!doCirclesOverlap(pickup, player)) {
      remainingPickups.push(pickup);
      return;
    }

    collectedPickups.push(pickup);
    nextStats = applyPickupBuff({ stats: nextStats, pickupType: pickup.type });
  });

  return {
    stats: nextStats,
    pickups: remainingPickups,
    collectedPickups
  };
};

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

export const getPlayerDamage = (stats = createRunStats()) => (
  stats.activeBuffs.attackPower.remainingMs > 0 ? PICKUP_BUFFS['attack-power'].damage : PLAYER_WEAPON.damage
);

export const resolvePlayerProjectileEnemyHits = ({ enemies, projectiles, stats }) => {
  const remainingEnemies = enemies.map((enemy) => ({ ...enemy }));
  const destroyedEnemies = [];
  const remainingProjectiles = [];
  const playerDamage = getPlayerDamage(stats);
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

    damageDealt += Math.min(hitEnemy.health, playerDamage);
    hitEnemy.health = Math.max(0, hitEnemy.health - playerDamage);

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
  shield: 0,
  activeBuffs: {
    attackPower: { remainingMs: 0 },
    attackSpeed: { remainingMs: 0 }
  },
  weaponShape: 'single-shot',
  weaponName: PLAYER_WEAPON.name,
  activeBuffName: 'None',
  bestScore: null,
  kills: 0,
  pickups: 0,
  shotsFired: 0,
  damageDealt: 0,
  damageBoosted: 0,
  shieldBlocked: 0
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

export const formatActiveBuffs = (stats) => {
  const activeBuffs = [
    stats.activeBuffs.attackPower.remainingMs > 0
      ? `${PICKUP_BUFFS['attack-power'].label} ${Math.ceil(stats.activeBuffs.attackPower.remainingMs / 1000)}s`
      : null,
    stats.activeBuffs.attackSpeed.remainingMs > 0
      ? `${PICKUP_BUFFS['attack-speed'].label} ${Math.ceil(stats.activeBuffs.attackSpeed.remainingMs / 1000)}s`
      : null
  ].filter(Boolean);

  return activeBuffs.length > 0 ? activeBuffs.join(' + ') : 'None';
};

export const createHudValues = ({ clock, stats }) => ({
  score: `Score ${stats.score}`,
  timer: `Timer ${formatRunTimer(clock.remainingMs)}`,
  health: `Health ${stats.health}/${stats.maxHealth}`,
  weapon: `Weapon ${stats.weaponName}`,
  buff: `Buff ${formatActiveBuffs(stats)}`,
  bestScore: stats.bestScore === null ? 'Best —' : `Best ${stats.bestScore}`
});

export const createResultsValues = ({ clock, stats }) => ({
  score: `Score ${stats.score}`,
  kills: `Kills ${stats.kills}`,
  timeSurvived: `Time Survived ${formatRunTimer(clock.durationMs - clock.remainingMs)}`,
  pickups: `Pickups ${stats.pickups}`,
  shotsFired: `Shots Fired ${stats.shotsFired}`,
  damageDealt: `Damage Dealt ${stats.damageDealt}`,
  damageBoosted: `Damage Boosted ${stats.damageBoosted}`,
  shieldBlocked: `Shield Blocked ${stats.shieldBlocked}`,
  weaponShape: `Weapon Shape ${stats.weaponName}`
});

export const applyPlayerDamage = ({ stats, damage }) => {
  const blockedDamage = Math.min(stats.shield, damage);
  const remainingDamage = damage - blockedDamage;

  return {
    ...stats,
    shield: stats.shield - blockedDamage,
    shieldBlocked: stats.shieldBlocked + blockedDamage,
    health: Math.max(0, stats.health - remainingDamage)
  };
};

export const applyPickupBuff = ({ stats, pickupType }) => {
  const pickup = PICKUP_BUFFS[pickupType];

  if (pickupType === 'healing') {
    return {
      ...stats,
      health: Math.min(stats.maxHealth, stats.health + pickup.healAmount),
      pickups: stats.pickups + 1
    };
  }

  if (pickupType === 'shield') {
    return {
      ...stats,
      shield: stats.shield + pickup.shieldAmount,
      pickups: stats.pickups + 1
    };
  }

  if (pickupType === 'attack-power') {
    return {
      ...stats,
      activeBuffs: {
        ...stats.activeBuffs,
        attackPower: { remainingMs: pickup.durationMs }
      },
      activeBuffName: pickup.label,
      damageBoosted: stats.damageBoosted + (pickup.damage - PLAYER_WEAPON.damage),
      pickups: stats.pickups + 1
    };
  }

  if (pickupType === 'attack-speed') {
    return {
      ...stats,
      activeBuffs: {
        ...stats.activeBuffs,
        attackSpeed: { remainingMs: pickup.durationMs }
      },
      activeBuffName: pickup.label,
      pickups: stats.pickups + 1
    };
  }

  if (['dual-shot', 'spread-shot', 'piercing-shot'].includes(pickupType)) {
    return {
      ...stats,
      weaponShape: pickupType,
      weaponName: pickup.label,
      pickups: stats.pickups + 1
    };
  }

  return stats;
};

export const advanceTimedBuffs = ({ stats, deltaMs }) => {
  const attackPowerRemainingMs = Math.max(0, stats.activeBuffs.attackPower.remainingMs - deltaMs);
  const attackSpeedRemainingMs = Math.max(0, stats.activeBuffs.attackSpeed.remainingMs - deltaMs);
  const activeBuffName = [
    attackPowerRemainingMs > 0 ? PICKUP_BUFFS['attack-power'].label : null,
    attackSpeedRemainingMs > 0 ? PICKUP_BUFFS['attack-speed'].label : null
  ].filter(Boolean).join(' + ');

  return {
    ...stats,
    activeBuffs: {
      ...stats.activeBuffs,
      attackPower: { remainingMs: attackPowerRemainingMs },
      attackSpeed: { remainingMs: attackSpeedRemainingMs }
    },
    activeBuffName: activeBuffName || 'None'
  };
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
