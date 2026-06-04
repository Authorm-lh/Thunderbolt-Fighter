# Thunderbolt Fighter Visual Asset Prompts

These prompts are for generating prototype/reference visual assets for Thunderbolt Fighter.

Important: assets generated from these prompts belong under `assets/prototype/` until a specific exported file is reviewed, approved, and documented for runtime shipping. Approved runtime files should later be copied or exported into `assets/runtime/` and listed in `assets/runtime/ASSET_MANIFEST.md`.

## Overall Art Direction

Use this direction for every generated visual asset so the set feels coherent:

```text
Compact arcade vertical shooter visual style, sleek near-future aircraft, high readability during fast movement, crisp game asset rendering, polished 2D digital art, slightly stylized but not cartoonish, clean silhouettes, strong contrast, sharp mechanical details, cool steel and electric cyan accents with small amber warning lights, no text, no logos, no watermark, no background unless explicitly requested.
```

Recommended visual language:

- Player: heroic, agile, readable, bright cyan/white accents.
- Basic enemies: darker, smaller, angular, red/orange hostile accents.
- Elite enemies: more armored, distinctive silhouette, violet/red accents.
- Boss: large command aircraft, imposing but readable, multiple weapon hardpoints.
- Projectiles: simple, bright, readable shapes.
- Pickups: iconic, high contrast, obvious at small size.
- Background: atmospheric but not noisy; gameplay objects must remain readable.
- UI: compact arcade HUD, clean sci-fi panels, not decorative-heavy.

Preferred output:

- Transparent PNG for ships, enemies, projectiles, pickups, UI, and effects.
- 1280x720 PNG or JPG for full-screen backgrounds.
- Transparent PNG spritesheet or frame sequence for animated effects.
- Keep objects centered with a little padding.
- Avoid shadows that extend too far outside the object bounds.

General negative prompt:

```text
text, letters, numbers, logo, watermark, signature, blurry, low resolution, photorealistic, 3D render, clay render, pixel art, anime character, human pilot portrait, cluttered background, cropped object, cut off wings, asymmetrical damage unless requested, excessive glow, noisy particles, unreadable silhouette, multiple unrelated objects, UI mockup text
```

## Player Ship

Target file after approval: `assets/runtime/art/player/player_ship.png`

Recommended format: transparent PNG.

Recommended size: generate large, then export around 128x128 or 160x160.

Prompt:

```text
Create a single top-down player spacecraft sprite for a compact arcade vertical shooter called Thunderbolt Fighter. The ship should look fast, heroic, and high-tech, with a clean triangular silhouette, swept wings, compact cockpit canopy, twin engine housings, sleek armor panels, bright electric cyan and white accents, subtle amber warning lights, and strong readability at small size. Centered object, top-down view, transparent background, polished 2D game asset, crisp edges, no text, no logo, no watermark.
```

Negative prompt:

```text
side view, perspective view, landing gear, realistic photograph, human pilot, cockpit interior, text, logo, watermark, background, cropped wings, excessive glow, muddy silhouette, too many tiny details
```

Optional variation prompt:

```text
Generate 4 design variations of the same top-down player spacecraft sprite, all sharing the same Thunderbolt Fighter arcade shooter style, transparent background, centered, no text. Keep each variation clearly readable as the player ship and distinct from enemy aircraft.
```

## Player Engine / Boost Frames

Target file after approval: `assets/runtime/art/player/player_ship_boost_spritesheet.png`

Recommended format: transparent PNG spritesheet or 4 separate transparent PNG frames.

Prompt:

```text
Create 4 animation frames for the engine boost flame of a top-down arcade shooter player spacecraft. Electric cyan plasma exhaust, short readable flame shape, designed to attach to the rear of a sleek player ship, transparent background, each frame centered, consistent size, crisp 2D game VFX, no text, no logo, no watermark.
```

Negative prompt:

```text
large explosion, smoke cloud, full ship, background, text, logo, watermark, excessive particles, blurry edges
```

## Basic Enemy

Target file after approval: `assets/runtime/art/enemies/enemy_basic.png`

Recommended format: transparent PNG.

Recommended size: generate large, then export around 96x96 or 128x128.

Prompt:

```text
Create a single top-down basic enemy aircraft sprite for a compact arcade vertical shooter. The enemy should be smaller and more aggressive-looking than the player ship, with a dark gunmetal body, angular wings, sharp nose, simple hostile silhouette, red-orange accent lights, and clear readability at small size. Centered object, transparent background, polished 2D game asset, crisp edges, no text, no logo, no watermark.
```

Negative prompt:

```text
friendly heroic design, same colors as player ship, side view, perspective view, background, text, logo, watermark, cropped object, too much detail, unreadable silhouette
```

Optional variation prompt:

```text
Generate 6 small top-down basic enemy aircraft variations for an arcade vertical shooter. Keep them in the same dark gunmetal and red-orange hostile faction style, each centered on a transparent background, readable at small size, no text, no logo.
```

## Elite Enemy

Target file after approval: `assets/runtime/art/enemies/enemy_elite.png`

Recommended format: transparent PNG.

Recommended size: generate large, then export around 128x128 or 160x160.

Prompt:

```text
Create a single top-down elite enemy aircraft sprite for a compact arcade vertical shooter. The elite enemy should look tougher and more advanced than the basic enemy, with heavier armor, wider wings, visible weapon pods, dark graphite plating, violet and red hostile energy accents, and a distinctive silhouette that players can recognize quickly. Centered object, transparent background, polished 2D game asset, crisp edges, no text, no logo, no watermark.
```

Negative prompt:

```text
player-colored cyan hero ship, friendly design, side view, perspective view, background, text, logo, watermark, cropped wings, noisy detail, unreadable silhouette
```

## Boss-Class Enemy

Target file after approval: `assets/runtime/art/enemies/enemy_boss.png`

Recommended format: transparent PNG.

Recommended size: generate large, then export around 384x256 or 512x320 depending on gameplay needs.

Prompt:

```text
Create a large top-down boss-class enemy aircraft sprite for a compact arcade vertical shooter. The boss should feel like an armored command gunship, much larger than normal enemies, with a broad intimidating silhouette, layered dark metal armor, central cockpit or command core, multiple visible weapon hardpoints, missile bays, turret mounts, red and violet hostile energy accents, and strong readability against a dark blue background. Centered object, transparent background, polished 2D game asset, crisp edges, no text, no logo, no watermark.
```

Negative prompt:

```text
tiny ship, friendly player colors, side view, perspective view, background, text, logo, watermark, cropped object, excessive smoke, excessive glow, unreadable mechanical clutter
```

Optional phase variation prompt:

```text
Create 3 visual phase variations of the same top-down boss-class enemy aircraft: intact, damaged armor with exposed glowing core, final enraged state with stronger red-violet energy. Keep the same silhouette and transparent background, no text, no logo.
```

## Player Projectile

Target file after approval: `assets/runtime/art/projectiles/projectile_player_bolt.png`

Recommended format: transparent PNG.

Recommended size: 16x32, 24x48, or similar after export.

Prompt:

```text
Create a single player projectile sprite for a compact arcade vertical shooter. The projectile should be a bright electric cyan energy bolt, narrow vertical shape, sharp readable silhouette, subtle glow, designed to travel upward from the player ship, centered on transparent background, crisp 2D game VFX, no text, no logo, no watermark.
```

Negative prompt:

```text
huge laser beam, explosion, background, text, logo, watermark, horizontal projectile, blurry glow, complex object, low contrast
```

## Enemy Projectile

Target file after approval: `assets/runtime/art/projectiles/projectile_enemy_orb.png`

Recommended format: transparent PNG.

Recommended size: 16x16, 24x24, or 32x32 after export.

Prompt:

```text
Create a single enemy projectile sprite for a compact arcade vertical shooter. The projectile should be a hostile red-orange plasma orb or small bolt, bright center, clean outline, readable against dark blue backgrounds, designed to travel downward, centered on transparent background, crisp 2D game VFX, no text, no logo, no watermark.
```

Negative prompt:

```text
player cyan color, huge explosion, background, text, logo, watermark, blurry edges, too many particles, complex object
```

## Pickup: Power Upgrade

Target file after approval: `assets/runtime/art/pickups/pickup_power.png`

Recommended format: transparent PNG.

Recommended size: 48x48 or 64x64 after export.

Prompt:

```text
Create a power upgrade pickup icon for a compact arcade vertical shooter. The pickup should be a floating collectible, bright and readable, with a compact hexagonal capsule shape, electric cyan core, small yellow highlight, subtle glow, clear arcade game icon silhouette, centered on transparent background, polished 2D game asset, no text, no letters, no logo, no watermark.
```

Negative prompt:

```text
text, letter P, number, logo, watermark, background, realistic object, overly complex details, unclear silhouette, huge glow
```

## Pickup: Shield / Health

Target file after approval: `assets/runtime/art/pickups/pickup_shield.png`

Recommended format: transparent PNG.

Recommended size: 48x48 or 64x64 after export.

Prompt:

```text
Create a shield or health pickup icon for a compact arcade vertical shooter. The pickup should be a floating collectible with a clear protective shield shape, blue-green energy rim, small white core, high contrast, readable at small size, centered on transparent background, polished 2D game asset, no text, no letters, no logo, no watermark.
```

Negative prompt:

```text
red cross symbol, text, letters, logo, watermark, background, realistic medical kit, cluttered details, unreadable silhouette
```

## Hit Spark Effect

Target file after approval: `assets/runtime/art/fx/fx_hit_spark.png`

Recommended format: transparent PNG or short spritesheet.

Prompt:

```text
Create a compact hit spark effect for a 2D arcade vertical shooter. Bright yellow-white central spark with small orange fragments, short-lived impact shape, readable at small size, transparent background, crisp 2D game VFX, centered, no text, no logo, no watermark.
```

Negative prompt:

```text
large explosion, smoke cloud, background, text, logo, watermark, blurry, realistic fireball, too many particles
```

## Explosion Effect Spritesheet

Target file after approval: `assets/runtime/art/fx/fx_explosion_spritesheet.png`

Recommended format: transparent PNG spritesheet.

Recommended export note: 8 to 12 frames, each 64x64 or 96x96, laid out in a regular grid.

Prompt:

```text
Create a 12-frame transparent PNG spritesheet of a compact arcade shooter explosion effect. The explosion should begin with a bright yellow-white flash, expand into orange plasma and small dark smoke fragments, then fade cleanly. Each frame should fit in the same square cell, consistent centered position, crisp 2D game VFX, readable at small size, no text, no logo, no watermark, transparent background.
```

Negative prompt:

```text
single still image only, background, text, logo, watermark, photorealistic fire, huge smoke cloud, cropped frames, inconsistent frame size, messy layout
```

## Main Background

Target file after approval: `assets/runtime/art/backgrounds/background_sky_1280x720.png`

Recommended format: PNG, JPG, or WEBP.

Recommended size: 1280x720.

Prompt:

```text
Create a 1280x720 gameplay background for a compact arcade vertical shooter called Thunderbolt Fighter. The scene should show a high-altitude stormy sci-fi sky with distant clouds, subtle city or carrier silhouettes far below, cool dark navy atmosphere, faint cyan lightning energy, and enough open negative space for readable gameplay. It should look polished and cinematic but not too busy. No text, no logo, no watermark, no foreground aircraft, no UI.
```

Negative prompt:

```text
text, logo, watermark, foreground ship, bullets, enemies, UI, overly busy details, high contrast clutter, dark unreadable scene, photorealistic screenshot, people, buildings filling the screen
```

Optional looping/tileable prompt:

```text
Create a vertically scrollable arcade shooter background layer, 1280 pixels wide, dark stormy sci-fi sky, subtle cloud bands and distant lights, designed to tile or scroll vertically with minimal visible seam, no ships, no UI, no text, no logo.
```

## Parallax Cloud Layer

Target file after approval: `assets/runtime/art/backgrounds/background_cloud_layer.png`

Recommended format: transparent PNG.

Prompt:

```text
Create a transparent parallax cloud layer for a 2D arcade vertical shooter. Wispy storm clouds, cool blue-gray tones, soft but not blurry, sparse enough to keep gameplay readable, transparent background, 1280 pixels wide, no aircraft, no text, no logo, no watermark.
```

Negative prompt:

```text
solid background, text, logo, watermark, aircraft, bullets, UI, dense fog, black opaque background, unreadable clutter
```

## HUD Life Icon

Target file after approval: `assets/runtime/art/ui/ui_life_icon.png`

Recommended format: transparent PNG.

Recommended size: 32x32 or 48x48 after export.

Prompt:

```text
Create a small HUD life icon for a compact arcade vertical shooter. The icon should be a simplified mini version of the player ship silhouette, bright cyan and white accents, readable at 32x32, centered on transparent background, crisp 2D UI game asset, no text, no number, no logo, no watermark.
```

Negative prompt:

```text
text, number, heart icon, logo, watermark, background, complex details, unreadable at small size
```

## HUD Panel

Target file after approval: `assets/runtime/art/ui/ui_panel_hud.png`

Recommended format: transparent PNG, or nine-slice friendly panel if possible.

Prompt:

```text
Create a compact sci-fi HUD panel frame for a 2D arcade shooter. Dark translucent navy metal panel, thin cyan edge highlights, subtle amber corner accents, clean rectangular shape, suitable for score or status display, transparent background, no text, no numbers, no logo, no watermark, polished 2D UI asset.
```

Negative prompt:

```text
text, numbers, logo, watermark, full screen UI mockup, background scene, overly decorative frame, unreadable tiny details, rounded toy-like style
```

## Start Button / Menu Button

Target file after approval: `assets/runtime/art/ui/ui_button_primary.png`

Recommended format: transparent PNG.

Prompt:

```text
Create a primary menu button background for a compact arcade shooter UI. Clean sci-fi rectangular button plate, dark navy fill, electric cyan outline, small amber corner details, polished 2D UI asset, transparent background, no text, no letters, no logo, no watermark.
```

Negative prompt:

```text
text, letters, logo, watermark, full menu screen, background image, excessive decoration, blurry edges, toy-like rounded button
```

## Title Logo Background Shape

Target file after approval: `assets/runtime/art/ui/ui_title_plate.png`

Recommended format: transparent PNG.

Prompt:

```text
Create a title plate background shape for the game Thunderbolt Fighter, but do not include any text. Futuristic arcade shooter style, sharp angular sci-fi frame, dark metal and electric cyan edge lighting, subtle lightning motif, transparent background, centered, polished 2D UI asset, no words, no letters, no logo, no watermark.
```

Negative prompt:

```text
text, game title, letters, logo, watermark, full poster, background scene, aircraft, characters, excessive glow, blurry edges
```

## Recommended Generation Workflow

1. Generate 4 to 8 variations for each core asset.
2. Pick the clearest silhouette, not the most detailed image.
3. Export transparent PNGs for objects and UI.
4. Put all generated drafts under `assets/prototype/generated/visual/`.
5. Put mood/reference images under `assets/prototype/references/visual/`.
6. After review, copy only approved runtime-ready exports into `assets/runtime/art/...`.
7. Record source, AI tool, prompt, date, and approval status in `assets/runtime/ASSET_MANIFEST.md` before shipping.

## Suggested Prototype Folder Layout

```text
assets/prototype/generated/visual/
  player/
  enemies/
  projectiles/
  pickups/
  backgrounds/
  ui/
  fx/

assets/prototype/references/visual/
```

## Approval Checklist

Before moving any AI-generated visual asset to `assets/runtime/`, confirm:

- The file is visually coherent with the rest of the set.
- It is readable at gameplay size.
- It has no text, watermark, signature, or unintended logo.
- It has the correct background treatment, usually transparent PNG.
- The AI generation service terms allow use in the shipped Windows build.
- The asset is explicitly approved as runtime content, not merely reference art.
- The asset is listed in `assets/runtime/ASSET_MANIFEST.md` with source and approval notes.
