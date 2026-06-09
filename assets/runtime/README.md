# Shipped runtime assets

`assets/runtime` contains approved assets that are intended to ship with the desktop build. Prototype drafts and review-only material should stay under `assets/prototype` until a specific file is approved, moved here, and documented.

## Directory layout

```text
assets/runtime/
  art/      Runtime visual assets used by Phaser scenes and UI.
  audio/    Runtime music loops and sound effects.
```

Keep runtime paths stable once code starts loading them. If a file is renamed or moved, update the loader code and any manifest/test coverage in the same change.

## Visual assets

### Backgrounds

| File | Purpose |
| --- | --- |
| `art/backgrounds/background_sky_1672x941.png` | Main gameplay sky backdrop. Use as the base scrolling or fixed playfield background. |
| `art/backgrounds/background_main_menu_1280x720.png` | Dedicated main menu background. Use behind the title and menu controls before gameplay starts. |
| `art/backgrounds/background_cloud_layer.png` | Transparent parallax cloud layer. Render above the sky background but behind gameplay objects. |

### Player

| File | Purpose |
| --- | --- |
| `art/player/player_ship.png` | Player ship sprite. Primary controllable aircraft. |
| `art/player/player_ship_boost_spritesheet.png` | Player engine/boost animation frames. Attach visually to the rear of the player ship during movement or thrust states. |

### Enemies

| File | Purpose |
| --- | --- |
| `art/enemies/enemy_basic.png` | Basic enemy aircraft. Use for low-health/common enemy waves. |
| `art/enemies/enemy_elite.png` | Elite enemy aircraft. Use for tougher enemies with distinct behavior, score value, or attack pattern. |
| `art/enemies/enemy_boss.png` | Boss-class enemy aircraft. Use for the late-run boss encounter or other large command enemy. |

### Projectiles

| File | Purpose |
| --- | --- |
| `art/projectiles/projectile_player_bolt.png` | Player projectile sprite. Intended for upward automatic fire. |
| `art/projectiles/projectile_enemy_orb.png` | Enemy projectile sprite. Intended for hostile downward fire. |
| `art/projectiles/projectile_enemy_orb_v1.png` | Alternate enemy projectile candidate. Keep only if code or design needs a second projectile variant. |

### Pickups

| File | Purpose |
| --- | --- |
| `art/pickups/pickup_power..png` | Power upgrade pickup. Intended for attack power, fire rate, or weapon strength upgrades. Note the filename currently contains a double dot. Rename carefully if runtime code starts referencing it. |
| `art/pickups/pickup_shield.png` | Shield or health-style defensive pickup. Use when granting player protection or recovery. |

### Effects

| File | Purpose |
| --- | --- |
| `art/fx/fx_hit_spark.png` | Compact hit confirmation effect. Use when a projectile strikes an enemy or shield. |
| `art/fx/fx_explosion_spritesheet.png` | Explosion animation spritesheet. Use for destroyed enemies, player destruction, or other compact arcade explosions. |

### UI

| File | Purpose |
| --- | --- |
| `art/ui/ui_button_primary.png` | Primary menu button plate. Add text in the UI layer; the asset itself intentionally contains no text. |
| `art/ui/ui_life_icon.png` | HUD life icon. Use for lives, health pips, or player stock display. |
| `art/ui/ui_panel_hud.png` | HUD panel frame. Use behind score, timer, wave, or status readouts. |
| `art/ui/ui_title_plate.png` | Title plate background. Use behind the game title text; the asset intentionally contains no title text. |

## Audio assets

### Music loops

| File | Purpose |
| --- | --- |
| `audio/music_menu_loop.wav` | Seamless menu/settings music loop. Use before the run starts. |
| `audio/music_run_loop.wav` | Seamless normal gameplay music loop. Use during standard score-chase play. |
| `audio/music_boss_loop.wav` | Seamless boss music loop. Use during the late-run boss phase. |

### UI sounds

| File | Purpose |
| --- | --- |
| `audio/ui_select.wav` | Lightweight cursor or button-selection tick. |
| `audio/ui_confirm.wav` | Confirm/start/accept action sound. |
| `audio/ui_back.wav` | Back/cancel action sound. |
| `audio/ui_pause_open.wav` | Pause menu open sound. |

### Player sounds

| File | Purpose |
| --- | --- |
| `audio/player_bolt_fire.wav` | Frequent automatic player shot sound. Keep playback low enough to avoid fatigue. |
| `audio/player_bolt_hit.wav` | Player projectile hit confirmation sound. Use for repeated enemy hits. |
| `audio/player_damage.wav` | Player takes damage cue. |
| `audio/player_destroyed.wav` | Player defeat or run-ending destruction cue. |

### Enemy and boss sounds

| File | Purpose |
| --- | --- |
| `audio/enemy_destroyed_basic.wav` | Basic enemy destruction sound. |
| `audio/enemy_destroyed_elite.wav` | Elite enemy destruction sound, larger than the basic enemy cue. |
| `audio/boss_warning.mp3` | Warning cue before boss arrival. |
| `audio/boss_spawn.wav` | Boss arrival sting. |
| `audio/boss_destroyed.wav` | Boss defeat payoff, intended to be larger than normal explosions. |

### Pickup sounds

| File | Purpose |
| --- | --- |
| `audio/pickup_power.wav` | Attack power, attack speed, or weapon-strength pickup cue. |
| `audio/pickup_shield.mp3` | Shield pickup cue. |
| `audio/pickup_heal.mp3` | Healing pickup cue. |

## Maintenance notes

- Runtime assets should be files the game can load directly from `assets/runtime`, not review drafts from `assets/prototype`.
- Do not add text, logos, or watermarks to visual assets; UI text should be rendered by the game.
- Music files are intended to loop. Check loop points before wiring them into gameplay.
- Rapid-repeat SFX such as `player_bolt_fire.wav` and `player_bolt_hit.wav` should be tested at gameplay fire rates.
- Keep generation prompts, exploratory drafts, and reference material under `assets/prototype`; only approved runtime-loadable exports belong here.
- Before shipping, record source, license, approval status, and any generator details in the runtime asset manifest if one is added.
