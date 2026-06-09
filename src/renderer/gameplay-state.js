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
  },
  'boss-class': {
    type: 'boss-class',
    spawnIntervalMs: 0,
    speed: 24,
    radius: 64,
    maxHealth: 240,
    fireIntervalMs: 700,
    projectileSpeed: 390,
    projectileRadius: 10,
    projectileDamage: 24,
    contactDamage: 45,
    escapedDamage: 0,
    scoreValue: 1200,
    movementPattern: 'command-hover',
    maxHorizontalOffset: 120,
    holdY: 96,
    lanes: [GAMEPLAY_PLAYFIELD.width / 2]
  }
};

export const BASIC_ENEMY = ENEMY_CLASSES.basic;

export const BOSS_EVENT = {
  warningBeforeEndMs: 12_000,
  spawnBeforeEndMs: 8_000,
  warningText: '⚠ BOSS INBOUND ⚠',
  detailText: 'High-value target entering combat zone'
};

export const getEnemyClass = (enemyType = 'basic') => ENEMY_CLASSES[enemyType] ?? ENEMY_CLASSES.basic;

export const getEnemyTestNameMarkerText = (enemyType = 'basic') => {
  if (enemyType === 'elite') {
    return 'Elite Enemy';
  }

  if (enemyType === 'boss-class') {
    return 'Boss Enemy';
  }

  return 'Basic Enemy';
};

export const createSpawnRandomizationState = ({ seed, seedSource = Date.now } = {}) => ({
  seed: seed ?? seedSource()
});

export const createSpawnStreamHash = (stream) => {
  let hash = 0x811c9dc5;

  [...stream].forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  });

  return hash;
};

const createSeededRandomValue = ({ seed, stream, spawnIndex }) => {
  let value = (seed + createSpawnStreamHash(stream) + Math.imul(spawnIndex + 1, 0x9e3779b1)) >>> 0;

  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35) >>> 0;

  return ((value ^ (value >>> 16)) >>> 0) / 0x100000000;
};

const selectSpawnValue = ({ values, spawnIndex, spawnRandomization, stream }) => {
  if (!spawnRandomization) {
    return values[spawnIndex % values.length];
  }

  const randomIndex = Math.floor(createSeededRandomValue({
    seed: spawnRandomization.seed,
    stream,
    spawnIndex
  }) * values.length);

  return values[randomIndex];
};

export const getPickupTestNameMarkerText = (pickupType) => {
  const label = PICKUP_BUFFS[pickupType]?.label ?? pickupType;

  if (pickupType === 'healing') {
    return 'Healing Pickup';
  }

  if (pickupType === 'attack-power') {
    return 'Attack Power Pickup';
  }

  if (pickupType === 'attack-speed') {
    return 'Attack Speed Pickup';
  }

  return `${label} Pickup`;
};

export const resolveEnemyTypeForSpawn = ({ spawnIndex, spawnRandomization }) => {
  if (!spawnRandomization) {
    return spawnIndex > 0 && spawnIndex % 4 === 3 ? 'elite' : 'basic';
  }

  return selectSpawnValue({
    values: ['basic', 'basic', 'basic', 'elite'],
    spawnIndex,
    spawnRandomization,
    stream: 'enemy-type'
  });
};

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

export const TEST_NAME_MARKERS = {
  enabled: true,
  labelOffset: 18
};

export const HUD_LAYOUT = {
  runSummary: {
    x: 24,
    y: 24,
    top: 24,
    bottom: 52
  },
  regularHud: {
    x: 24,
    y: 58,
    top: 58,
    right: 384,
    values: ['score', 'timer', 'health', 'weapon', 'buff', 'pickups', 'bestScore']
  },
  bossHp: {
    x: GAMEPLAY_PLAYFIELD.width / 2,
    y: 28,
    left: 460,
    right: 820
  }
};

export const createHudLayoutState = () => HUD_LAYOUT;

export const createTestNameMarker = ({ text, target, enabled = TEST_NAME_MARKERS.enabled }) => {
  if (!enabled) {
    return null;
  }

  return {
    text,
    x: target.x,
    y: target.y - target.radius - TEST_NAME_MARKERS.labelOffset,
    targetRadius: target.radius
  };
};

export const followTestNameMarkerTarget = ({ marker, target }) => ({
  ...marker,
  x: target.x,
  y: target.y - target.radius - TEST_NAME_MARKERS.labelOffset,
  targetRadius: target.radius
});

export const withTestNameMarker = (target, nameMarker) => ({
  ...target,
  nameMarker
});

export const destroyTestNameMarker = (target) => {
  if (typeof target.nameMarker?.destroy === 'function') {
    target.nameMarker.destroy();
  }
  target.nameMarker = null;

  return {
    ...target,
    nameMarker: null
  };
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

export const shouldShowBossWarning = ({ remainingMs, bossWarningShown }) => (
  !bossWarningShown && remainingMs <= BOSS_EVENT.warningBeforeEndMs
);

export const shouldSpawnBoss = ({ remainingMs, bossSpawned }) => (
  !bossSpawned && remainingMs <= BOSS_EVENT.spawnBeforeEndMs
);

export const createBossWarningState = () => ({
  text: BOSS_EVENT.warningText,
  detailText: BOSS_EVENT.detailText
});

export const createBossHpHudState = ({ enemies }) => {
  const activeBoss = enemies.find((enemy) => enemy.type === 'boss-class' && enemy.health > 0);
  const bossClass = ENEMY_CLASSES['boss-class'];

  return {
    visible: Boolean(activeBoss),
    currentHealth: activeBoss?.health ?? 0,
    maxHealth: bossClass.maxHealth,
    text: activeBoss ? `Boss HP ${activeBoss.health}/${bossClass.maxHealth}` : ''
  };
};

export const shouldBasicEnemyFire = ({ elapsedMs, lastFiredMs, enemyType = 'basic', difficulty = 'normal' }) => {
  const enemyClass = getEnemyClass(enemyType);
  const fireIntervalMs = enemyClass.fireIntervalMs * getDifficultyTuning(difficulty).enemyFireIntervalMultiplier;

  return elapsedMs - lastFiredMs >= fireIntervalMs;
};

export const createEnemySpawn = ({ spawnIndex, enemyType = 'basic', spawnRandomization }) => {
  const enemyClass = getEnemyClass(enemyType);
  const x = selectSpawnValue({
    values: enemyClass.lanes,
    spawnIndex,
    spawnRandomization,
    stream: `${enemyClass.type}-lane`
  });

  return {
    id: `${enemyClass.type}-${spawnIndex}`,
    type: enemyClass.type,
    x,
    y: -enemyClass.radius,
    health: enemyClass.maxHealth,
    lastFiredMs: -enemyClass.fireIntervalMs,
    movementOriginX: x
  };
};

export const createBasicEnemySpawn = ({ spawnIndex }) => createEnemySpawn({ spawnIndex, enemyType: 'basic' });

export const createBossEnemySpawn = ({ spawnIndex = 0 }) => createEnemySpawn({ spawnIndex, enemyType: 'boss-class' });

export const shouldSpawnPickup = ({ elapsedMs, lastSpawnedMs, activePickupCount = 0 }) => (
  activePickupCount < PICKUP_SPAWNING.maxActivePickups && elapsedMs - lastSpawnedMs >= PICKUP_SPAWNING.spawnIntervalMs
);

export const createPickupSpawn = ({ spawnIndex, spawnRandomization }) => {
  const pickupTypes = Object.keys(PICKUP_BUFFS);
  const type = selectSpawnValue({
    values: pickupTypes,
    spawnIndex,
    spawnRandomization,
    stream: 'pickup-type'
  });
  const x = selectSpawnValue({
    values: PICKUP_SPAWNING.lanes,
    spawnIndex,
    spawnRandomization,
    stream: 'pickup-lane'
  });

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
  const nextY = enemy.y + enemyClass.speed * deltaSeconds;
  const y = enemyClass.movementPattern === 'command-hover' ? Math.min(nextY, enemyClass.holdY) : nextY;
  const x = ['sway', 'command-hover'].includes(enemyClass.movementPattern)
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

export const LOCAL_RECORDS_STORAGE_KEY = 'thunderbolt-fighter:local-records';
export const RECENT_RUN_LIMIT = 10;

export const createDefaultLocalRecords = () => ({
  bestScores: {},
  recentRuns: []
});

export const createRunRecordKey = ({ runLengthMinutes, difficulty }) => `${runLengthMinutes}m:${difficulty}`;

export const loadLocalRecords = ({ storage = globalThis.localStorage } = {}) => {
  if (!storage) {
    return createDefaultLocalRecords();
  }

  try {
    return {
      ...createDefaultLocalRecords(),
      ...JSON.parse(storage.getItem(LOCAL_RECORDS_STORAGE_KEY) ?? '{}')
    };
  } catch {
    return createDefaultLocalRecords();
  }
};

export const saveLocalRecords = ({ storage = globalThis.localStorage, records }) => {
  if (!storage) {
    return records;
  }

  storage.setItem(LOCAL_RECORDS_STORAGE_KEY, JSON.stringify(records));

  return records;
};

export const getBestScoreForRun = ({ records, runLengthMinutes, difficulty }) => (
  records.bestScores[createRunRecordKey({ runLengthMinutes, difficulty })] ?? null
);

export const saveBestScoreForRun = ({ storage = globalThis.localStorage, runLengthMinutes, difficulty, score }) => {
  const records = loadLocalRecords({ storage });
  const recordKey = createRunRecordKey({ runLengthMinutes, difficulty });
  const currentBestScore = records.bestScores[recordKey] ?? null;
  const bestScore = currentBestScore === null ? score : Math.max(currentBestScore, score);

  return saveLocalRecords({
    storage,
    records: {
      ...records,
      bestScores: {
        ...records.bestScores,
        [recordKey]: bestScore
      }
    }
  });
};

export const saveRecentRun = ({ storage = globalThis.localStorage, run }) => {
  const records = loadLocalRecords({ storage });

  return saveLocalRecords({
    storage,
    records: {
      ...records,
      recentRuns: [run, ...records.recentRuns].slice(0, RECENT_RUN_LIMIT)
    }
  });
};

export const applyLocalRecordContext = ({ storage = globalThis.localStorage, stats, runLengthMinutes, difficulty }) => ({
  ...stats,
  bestScore: getBestScoreForRun({
    records: loadLocalRecords({ storage }),
    runLengthMinutes,
    difficulty
  })
});

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
  bossesDefeated: 0,
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
  bossesDefeated: stats.bossesDefeated + destroyedEnemies.filter((enemy) => enemy.type === 'boss-class').length,
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
  health: stats.shield > 0
    ? `Health ${stats.health}/${stats.maxHealth} + Shield ${stats.shield}`
    : `Health ${stats.health}/${stats.maxHealth}`,
  weapon: `Weapon ${stats.weaponName}`,
  buff: `Buff ${formatActiveBuffs(stats)}`,
  pickups: `Pickups ${stats.pickups}`,
  bestScore: stats.bestScore === null ? 'Best —' : `Best ${stats.bestScore}`
});

export const createResultsTitle = ({ endReason }) => {
  if (endReason === 'boss-defeated') {
    return 'Boss Defeated';
  }

  if (endReason === 'health-depleted') {
    return 'Player Defeated';
  }

  return 'Run Complete';
};

export const createResultsValues = ({ clock, stats }) => ({
  score: `Score ${stats.score}`,
  kills: `Kills ${stats.kills}`,
  bossesDefeated: `Bosses Defeated ${stats.bossesDefeated}`,
  timeSurvived: `Time Survived ${formatRunTimer(clock.durationMs - clock.remainingMs)}`,
  pickups: `Pickups ${stats.pickups}`,
  shotsFired: `Shots Fired ${stats.shotsFired}`,
  damageDealt: `Damage Dealt ${stats.damageDealt}`,
  damageBoosted: `Damage Boosted ${stats.damageBoosted}`,
  shieldBlocked: `Shield Blocked ${stats.shieldBlocked}`,
  weaponShape: `Weapon Shape ${stats.weaponName}`,
  bestScore: stats.bestScore === null ? 'Previous Best —' : `Previous Best ${stats.bestScore}`,
  localRecord: `Local Record ${Math.max(stats.score, stats.bestScore ?? 0)}`
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

export const getRunEndReason = ({ clock, stats, enemies = [] }) => {
  if (stats.health <= 0) {
    return 'health-depleted';
  }

  if (stats.bossesDefeated > 0) {
    return 'boss-defeated';
  }

  const activeBoss = enemies.some((enemy) => enemy.type === 'boss-class' && enemy.health > 0);

  if (clock.remainingMs <= 0 && !activeBoss) {
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
