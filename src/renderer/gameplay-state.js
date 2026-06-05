export const GAMEPLAY_PLAYFIELD = {
  width: 720,
  height: 1280
};

export const PLAYER_FLIGHT = {
  speed: 460,
  startX: GAMEPLAY_PLAYFIELD.width / 2,
  startY: GAMEPLAY_PLAYFIELD.height - 180,
  radius: 28
};

export const PLAYER_WEAPON = {
  fireIntervalMs: 260,
  projectileSpeed: 880,
  projectileRadius: 5
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
