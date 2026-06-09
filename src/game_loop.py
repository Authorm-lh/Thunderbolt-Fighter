"""
Main game loop integrating timer, enemies, and game state.
"""

import pygame
from game_state import GameState
from enemy_manager import EnemyManager

class GameLoop:
    """Controls the main game loop and run lifecycle."""
    
    def __init__(self):
        pygame.init()
        self.clock = pygame.time.Clock()
        self.game_state = GameState()
        self.enemy_manager = EnemyManager(self.game_state)
        self.running = False
    
    def start_new_run(self):
        """Begin a new game run."""
        self.game_state.start_run()
        self.running = True
    
    def run(self):
        """Execute the main game loop."""
        self.start_new_run()
        
        while self.running:
            delta_time = self.clock.tick(60) / 1000.0  # Convert to seconds
            
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
            
            # Update game state
            if not self.game_state.update_timer(delta_time):
                # Run has ended - check outcome
                if self.game_state.boss_destroyed:
                    print("Victory! Boss defeated!")
                elif self.game_state.player_destroyed:
                    print("Game Over - Player destroyed")
                else:
                    print("Game Over - Time expired")
                self.running = False
                break
            
            # Update enemies
            self.enemy_manager.update(delta_time)
            
            # Render (placeholder - actual rendering depends on game engine)
            # self.render()
        
        pygame.quit()