"""
Game state management for Thunderbolt Fighter.
Tracks run status, boss activity, and game-over conditions.
"""

class GameState:
    """Manages the overall state of the game run."""
    
    def __init__(self):
        self.run_timer = 0
        self.run_active = False
        self.boss_active = False
        self.game_over = False
        self.player_destroyed = False
        self.boss_destroyed = False
    
    def start_run(self):
        """Initialize a new run."""
        self.run_timer = 0
        self.run_active = True
        self.boss_active = False
        self.game_over = False
        self.player_destroyed = False
        self.boss_destroyed = False
    
    def set_boss_active(self, active: bool):
        """Mark whether a boss enemy is currently on screen."""
        self.boss_active = active
    
    def update_timer(self, delta_time: float):
        """Update the run timer. Returns True if run should continue."""
        if not self.run_active or self.game_over:
            return False
        
        self.run_timer += delta_time
        
        # Check for game-over conditions
        if self.player_destroyed:
            self.game_over = True
            self.run_active = False
            return False
        
        if self.boss_destroyed:
            self.game_over = True
            self.run_active = False
            return False
        
        # Timer expiry only ends run if no boss is active
        if self._is_timer_expired():
            if not self.boss_active:
                self.game_over = True
                self.run_active = False
                return False
            # Boss is active - keep the run going
            return True
        
        return True
    
    def _is_timer_expired(self) -> bool:
        """Check if the run timer has exceeded the maximum duration."""
        # Default max run time: 120 seconds (2 minutes)
        MAX_RUN_TIME = 120.0
        return self.run_timer >= MAX_RUN_TIME
    
    def destroy_player(self):
        """Mark the player as destroyed."""
        self.player_destroyed = True
    
    def destroy_boss(self):
        """Mark the boss as destroyed."""
        self.boss_destroyed = True