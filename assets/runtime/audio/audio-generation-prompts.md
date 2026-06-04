# Thunderbolt Fighter prototype audio generation prompts

This document is for generating reference and prototype audio under `assets/prototype`. Do not ship these files in the packaged desktop build until each generated asset has an approved source, license, and runtime destination under `assets/runtime/audio`.

## Target sound direction

Thunderbolt Fighter is a vertical arcade flight combat game: fast player movement, automatic player fire, descending enemies, readable pickups, a fixed-time score chase, and a late-run boss warning. The audio should feel bright, punchy, and responsive rather than cinematic or realistic. Think modern arcade synth, clean sci-fi impacts, and short sounds that leave room for repeated firing.

Use these global constraints for every generated asset:

- Format target: 48 kHz WAV for review; later conversion can choose OGG/MP3 if needed.
- Mix target: leave peak headroom around -3 dB; avoid clipping, distortion, and heavy limiting.
- Style: energetic retro-futuristic arcade, clean electronic transients, light metallic texture, no vocals.
- Keep SFX mono or narrow stereo unless the prompt explicitly asks for a wide music bed.
- Avoid copyrighted melody references, recognizable franchise sounds, speech, radio chatter, alarms from real vehicles, or public-domain samples with unclear provenance.
- Generate each prompt as a standalone asset with clean start and end. Do not include countdowns, watermark tones, room noise, reverb tails longer than the requested duration, or multiple alternate takes in one file.
- For very short SFX, AI tools may need to output a 1 second file. In those cases, ask for the usable sound event to happen immediately at the start: the main transient should land in the first 50-300 ms, then decay quickly into silence so the file can be trimmed to the target duration.

## Recommended runtime names

Use these names when exporting generated drafts so later review can map them directly to gameplay needs.

| Draft file name | Duration | Loop | Purpose |
| --- | ---: | --- | --- |
| `music_menu_loop.wav` | 16-24s | yes | Main menu and settings ambience |
| `music_run_loop.wav` | 32-48s | yes | Normal gameplay score-chase loop |
| `music_boss_loop.wav` | 24-40s | yes | Late-run boss pressure loop |
| `ui_select.wav` | 0.08-0.16s | no | Menu cursor/button select |
| `ui_confirm.wav` | 0.12-0.25s | no | Start/confirm action |
| `ui_back.wav` | 0.10-0.22s | no | Back/cancel action |
| `ui_pause_open.wav` | 0.18-0.35s | no | Pause menu opens |
| `player_bolt_fire.wav` | 0.05-0.11s | no | Frequent automatic player shot |
| `player_bolt_hit.wav` | 0.06-0.14s | no | Player shot hits enemy |
| `player_damage.wav` | 0.18-0.35s | no | Player takes damage |
| `player_destroyed.wav` | 0.70-1.20s | no | Player defeat or run-ending destruction |
| `player_boost_loop.wav` | 0.60-1.00s | yes | Optional engine/boost movement bed |
| `enemy_orb_fire.wav` | 0.10-0.20s | no | Basic enemy shot |
| `enemy_destroyed_basic.wav` | 0.35-0.65s | no | Basic enemy explosion |
| `enemy_destroyed_elite.wav` | 0.55-0.90s | no | Elite enemy explosion |
| `boss_warning.wav` | 1.00-1.80s | no | Warning cue before boss spawn |
| `boss_spawn.wav` | 1.00-1.80s | no | Boss arrival sting |
| `boss_orb_fire.wav` | 0.18-0.32s | no | Boss projectile or heavy weapon fire |
| `boss_hit.wav` | 0.12-0.25s | no | Boss takes damage |
| `boss_destroyed.wav` | 1.50-2.50s | no | Boss defeat payoff |
| `pickup_power.wav` | 0.22-0.45s | no | Attack power or attack speed pickup |
| `pickup_shield.wav` | 0.25-0.50s | no | Shield pickup |
| `pickup_heal.wav` | 0.25-0.50s | no | Healing pickup |
| `weapon_shape_change.wav` | 0.25-0.55s | no | Dual/spread/pierce weapon shape swap |
| `timer_warning.wav` | 0.50-0.90s | no | Final seconds urgency cue |
| `run_complete.wav` | 0.90-1.60s | no | Timer expires and results are shown |
| `score_tick.wav` | 0.03-0.08s | no | Optional results score count-up tick |

## Music prompts

### `music_menu_loop.wav`

Generate a seamless looping menu music bed for a vertical sci-fi arcade shooter called Thunderbolt Fighter. Bright synth arpeggios, soft pulsing bass, airy high pads, optimistic pre-run energy, clean modern retro arcade tone. 92 BPM, 4/4, no lead melody that sounds like an existing song, no vocals, no percussion fills that reveal the loop point. Duration 16 to 24 seconds. The final audio must loop seamlessly with no fade-out, no silence at the start or end, and no long reverb tail crossing the loop boundary.

Negative prompt: orchestral trailer music, dark horror ambience, chiptune-only square waves, distorted dubstep bass, spoken words, countdown voice, copyrighted game references.

### `music_run_loop.wav`

Generate a seamless looping gameplay music bed for a fixed-time vertical arcade flight combat score chase. Energetic sci-fi synthwave rhythm, tight electronic drums, driving bass, sparkling upper synth pulses, forward motion like climbing through a bright storm sky. 138 BPM, 4/4, exciting but not too dense because rapid laser and explosion SFX will play over it. Duration 32 to 48 seconds. Loop must be seamless with a stable groove, no intro-only build, no fade-out, no vocals, no recognizable melody from any existing game or song.

Negative prompt: cinematic orchestra, rock guitars, lo-fi ambience, heavy sidechain pumping, alarm sirens, aircraft radio chatter, realistic gunfire.

### `music_boss_loop.wav`

Generate a seamless looping boss music bed for the late-run high-value boss in a vertical sci-fi arcade shooter. More urgent and heavier than the normal run loop, with tense synth bass, crisp percussion, metallic stabs, and a high-energy arcade feel. 150 BPM, 4/4, intense but still clean and mixable under projectile and explosion sounds. Duration 24 to 40 seconds. The loop must be seamless, with no fade-out, no vocals, no horror drones, and no melody resembling an existing franchise.

Negative prompt: movie trailer brass, choir, realistic air raid siren, speech, jump scare, muddy low end, long cinematic risers that cannot loop.

## UI prompts

### `ui_select.wav`

Generate a single isolated sci-fi arcade UI selection sound. The usable sound must happen immediately at the start: a clean glassy blip with a tiny upward pitch motion in the first 80 ms, followed by a very short decay and then silence. Friendly and lightweight, suitable for moving between menu buttons. Total output may be up to 1 second for AI generation, but the trim target is 0.08 to 0.16 seconds. Dry or very lightly reverbed, no tail longer than 0.05 seconds after the blip, no harsh click, no tonal melody, no repeated notes.

### `ui_confirm.wav`

Generate a single isolated sci-fi arcade confirm sound for pressing Start or accepting a menu action. The main sound must happen at the start: quick low click in the first 40 ms, then an uplifting digital chime that resolves by 200 ms, followed by silence. Confident and satisfying. Total output may be up to 1 second for AI generation, but the trim target is 0.12 to 0.25 seconds. No vocals, no fanfare melody, no long reverb tail, no repeated alternate takes.

### `ui_back.wav`

Generate a single isolated sci-fi arcade back or cancel sound. The usable sound must be front-loaded: a soft plastic click in the first 40 ms, then a subtle downward digital chirp ending by 180 ms, followed by silence. Neutral rather than negative. Total output may be up to 1 second for AI generation, but the trim target is 0.10 to 0.22 seconds. Keep it clean, quiet, non-musical, and free of repeated notes.

### `ui_pause_open.wav`

Generate a single isolated pause-menu open sound for an arcade shooter. The useful sound must start immediately: compact electronic whoosh begins in the first 30 ms, lands into a soft lock-in click by 250 ms, then decays quickly into silence. It should suggest gameplay is suspended. Total output may be up to 1 second for AI generation, but the trim target is 0.18 to 0.35 seconds. No speech, no alarm, no long riser, no second whoosh.

## Player prompts

### `player_bolt_fire.wav`

Generate a single isolated automatic player laser bolt firing sound for a vertical arcade shooter. The main transient must happen immediately in the first 50 ms: bright blue-white energy tick, crisp and lightweight, with a very short clean tail that is silent by 120 ms. It should be satisfying but quiet enough to repeat many times per second without fatigue. Total output may be up to 1 second for AI generation, but the trim target is 0.05 to 0.11 seconds. Mono or narrow stereo. Avoid realistic guns, harsh clipping, bass-heavy impact, long pew-pew pitch sweeps, rhythm, music, or multiple shots.

### `player_bolt_hit.wav`

Generate a single isolated player projectile hit sound for striking an enemy. The impact must happen at the start in the first 60 ms: clean electric spark impact with a tiny metallic crackle that ends quickly, silent by 160 ms. It should provide readable hit confirmation without sounding like an explosion. Total output may be up to 1 second for AI generation, but the trim target is 0.06 to 0.14 seconds. Keep it punchy, dry, and mixable during rapid hits. No multiple impacts, no rhythm, no long crackle tail.

### `player_damage.wav`

Generate a single isolated player damage sound for a sci-fi arcade fighter ship. The damage cue must be front-loaded: short shield crack in the first 80 ms, low electronic thud by 160 ms, and a quick decay into silence by 350 ms. Urgent but not game-over sized. Total output may be up to 1 second for AI generation, but the trim target is 0.18 to 0.35 seconds. It should cut through music and projectiles while staying clean. No human pain sound, no speech, no realistic metal crash, no second impact.

### `player_destroyed.wav`

Generate a single isolated player ship destroyed sound for an arcade sci-fi shooter. The sound should begin immediately with shield shatter and energy collapse in the first 200 ms, hit a compact explosion by 400 ms, then finish with a brief falling digital tone and clean tail. Strong run-ending feedback but not as huge as the boss defeat. Total output may be 1 to 1.5 seconds for AI generation, but the trim target is 0.70 to 1.20 seconds. No long cinematic boom, no vocals, no debris ambience after the tail, no second explosion.

### `player_boost_loop.wav`

Generate a seamless looping player ship boost or engine bed for a vertical sci-fi arcade shooter. Smooth electric turbine hum with a light high-frequency shimmer, energetic but low in volume so it can sit under music. Duration 0.60 to 1.00 seconds. Loop must be seamless with no pulsing click, no fade-in, no fade-out, no large bass rumble.

## Enemy and boss prompts

### `enemy_orb_fire.wav`

Generate a single isolated enemy orb projectile firing sound. The useful sound must start immediately: rounded red-orange plasma pop in the first 80 ms with a small descending pitch bend ending by 200 ms, then silence. It should be distinct from the player's bright bolt. Total output may be up to 1 second for AI generation, but the trim target is 0.10 to 0.20 seconds. Keep it readable, moderate volume, and repeatable. Avoid realistic gunshots, harsh alarms, huge bass, rhythm, or multiple shots.

### `enemy_destroyed_basic.wav`

Generate a single isolated basic enemy destruction sound for a vertical arcade shooter. The explosion should happen at the start: small sci-fi pop impact in the first 120 ms, electric sparks and quick debris fizz ending by 600 ms, then silence. Rewarding but compact. Total output may be up to 1 second for AI generation, but the trim target is 0.35 to 0.65 seconds. No cinematic boom, no long smoke ambience, no low-frequency overload, no second explosion.

### `enemy_destroyed_elite.wav`

Generate a single isolated elite enemy destruction sound for a vertical arcade shooter. The explosion must be front-loaded: medium sci-fi impact and bright energy burst in the first 180 ms, metallic fragments through 700 ms, then a clean quick tail into silence. It should sound more valuable than a basic enemy but clearly smaller than the boss defeat. Total output may be 1 to 1.2 seconds for AI generation, but the trim target is 0.55 to 0.90 seconds. No second explosion, no long ambience, no excessive sub-bass.

### `boss_warning.wav`

Generate a strong but non-realistic boss warning cue for an arcade sci-fi shooter. Urgent synthetic alert pulse, rising tension, two or three clean warning hits, no spoken words. Duration 1.00 to 1.80 seconds. It should signal danger before a boss appears without using real emergency sirens or aircraft alarms.

### `boss_spawn.wav`

Generate a boss spawn sting for a vertical arcade shooter. Heavy synthetic arrival impact, deep but controlled bass hit, metallic energy swell, brief high sparkle as the boss enters. Duration 1.00 to 1.80 seconds. Dramatic and clean, no vocals, no orchestral brass, no long trailer riser.

### `boss_orb_fire.wav`

Generate a single isolated boss heavy projectile firing sound. The usable sound must start immediately: short charging snap in the first 80 ms into a forceful thick plasma launch by 220 ms, then quick decay into silence. Darker and wider than normal enemy fire. Total output may be up to 1 second for AI generation, but the trim target is 0.18 to 0.32 seconds. Repeatable during combat, not a full explosion, no realistic cannon or firearm sound, no multiple launches.

### `boss_hit.wav`

Generate a single isolated boss damage hit sound for repeated player shots landing on a large enemy. The hit must happen at the start: dense armored energy tick in the first 70 ms, metallic shield resonance and brief low thump ending by 250 ms, followed by silence. Satisfying but short. Total output may be up to 1 second for AI generation, but the trim target is 0.12 to 0.25 seconds. It must be repeatable many times without masking music. No multiple hits, no long resonance tail.

### `boss_destroyed.wav`

Generate a boss defeated payoff sound for a vertical sci-fi arcade shooter. Large layered energy explosion, shield collapse, sparkling fragments, controlled bass impact, triumphant arcade payoff without melody. Duration 1.50 to 2.50 seconds. Bigger than all other explosions, clean tail, no vocals, no cinematic orchestra, no excessive sub-bass.

## Pickup and weapon prompts

### `pickup_power.wav`

Generate a single isolated attack power or attack speed pickup collection sound. The pickup cue must begin immediately: bright energetic synth chime in the first 120 ms, quick upward sparkle and tiny power surge ending by 450 ms, then silence. Arcade positive feedback. Total output may be up to 1 second for AI generation, but the trim target is 0.22 to 0.45 seconds. No melody longer than three notes, no voice, no coin sound copied from classic games, no repeated pickup sounds.

### `pickup_shield.wav`

Generate a single isolated shield pickup collection sound. The useful sound must start immediately: glassy blue chime in the first 120 ms, smooth protective energy bloom and soft low resonance ending by 500 ms, then silence. It should suggest a shield forming around the player. Total output may be up to 1 second for AI generation, but the trim target is 0.25 to 0.50 seconds. Clean, positive, less aggressive than attack-power pickup, no repeated chimes.

### `pickup_heal.wav`

Generate a single isolated healing pickup collection sound. The healing cue must happen at the start: warm sci-fi restorative chime in the first 120 ms, gentle upward tones and clean sparkle ending by 500 ms, then silence. Comforting but still arcade. Total output may be up to 1 second for AI generation, but the trim target is 0.25 to 0.50 seconds. Distinct from shield by being warmer and softer. No vocals, no medical monitor beep, no repeated chimes.

### `weapon_shape_change.wav`

Generate a single isolated weapon shape change sound for switching to dual-shot, spread-shot, or piercing-shot. The transformation must begin immediately: three quick digital clicks in the first 180 ms, merging into a bright armed chime by 450 ms, then silence. It should say the weapon mode changed, not that a pickup was merely collected. Total output may be up to 1 second for AI generation, but the trim target is 0.25 to 0.55 seconds. No long mechanical loop, no voice, no repeated alternate takes.

## Timer and results prompts

### `timer_warning.wav`

Generate a single isolated final-seconds timer warning cue for a fixed-time arcade score chase. The warning must start immediately: three short synthetic pulses packed into the first 700 ms with rising urgency, then silence. Clean and non-realistic, suitable for warning that the run timer is nearly over. Total output may be up to 1 second for AI generation, but the trim target is 0.50 to 0.90 seconds. No real alarm siren, no speech, no harsh clipping, no extra fourth pulse.

### `run_complete.wav`

Generate a single isolated run complete sound for an arcade shooter when the timer expires and results appear. The resolution should start immediately: bright synth chord or impact in the first 150 ms, short positive sparkle tail resolving by 1.2 seconds. Satisfying without implying victory over every enemy. Total output may be 1 to 1.8 seconds for AI generation, but the trim target is 0.90 to 1.60 seconds. No vocals, no full melody, no orchestral fanfare, no second ending.

### `score_tick.wav`

Generate a single isolated score counting tick for a results screen. The tick must happen immediately in the first 30 ms: very short clean digital tick with a soft bright tone, then silence by 80 ms. Low fatigue over repeated playback. Total output may be up to 1 second for AI generation, but the trim target is 0.03 to 0.08 seconds. No click harshness, no coin-machine imitation, no reverb tail, no repeated ticks.

## Review checklist

Use this checklist before promoting any generated audio from prototype/reference use into runtime assets:

- The generated file matches the requested filename, duration, and loop behavior.
- Looping files have no gap, click, fade-out, or obvious reset at the loop boundary.
- Rapid-repeat SFX stay readable when triggered several times per second.
- Player, enemy, boss, pickup, UI, timer, and result cues are distinguishable by tone and intensity.
- Music leaves room for projectile, hit, explosion, and pickup SFX.
- The audio generation service terms permit the intended runtime/distributable use.
- Source notes are captured with the generator name, prompt, generation date, and license/terms link.
- Approved runtime files are copied into `assets/runtime/audio`, not loaded from `assets/prototype`.
