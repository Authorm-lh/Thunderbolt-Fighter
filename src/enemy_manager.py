"""
Manages enemy spawning, including boss-class enemies.
Integrates with game state to track boss activity.
"""

from game_state import GameState

class EnemyManager:
    """Handles enemy spawning and lifecycle."""
    
    def __init__(self, game_state: GameState):
        self.game_state = game_state
        self.enemies = []
        self.boss_spawned = False
    
    def spawn_boss(self, boss_enemy):
        """Spawn a boss-class enemy and update game state."""
        self.enemies.append(boss_enemy)
        self.boss_spawned = True
        self.game_state.set_boss_active(True)
    
    def update(self, delta_time: float):
        """Update all enemies and check boss status."""
        for enemy in self.enemies[:]:  # Iterate over a copy
            enemy.update(delta_time)
            
            # Check if this enemy is a boss and has been destroyed
            if enemy.is_boss and not enemy.is_alive:
                self.game_state.destroy_boss()
                self.game_state.set_boss_active(False)
                self.enemies.remove(enemy)
                self.boss_spawned = False
            elif not enemy.is_alive:
                self.enemies.remove(enemy)
    
    def has_active_boss(self) -> bool:
        """Check if a boss enemy is currently active."""
        return any(enemy.is_boss and enemy.is_alive for enemy in self.enemies)