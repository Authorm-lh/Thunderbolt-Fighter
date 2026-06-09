"""
Tests for boss fight timer extension feature.
Verifies that boss fights continue after timer expires.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.game_state import GameState
from src.enemy_manager import EnemyManager

class MockBossEnemy:
    """Mock boss enemy for testing."""
    def __init__(self, alive=True):
        self.is_boss = True
        self.is_alive = alive
    
    def update(self, delta_time):
        pass

class MockNormalEnemy:
    """Mock normal enemy for testing."""
    def __init__(self, alive=True):
        self.is_boss = False
        self.is_alive = alive
    
    def update(self, delta_time):
        pass

def test_timer_expires_without_boss():
    """Run should end when timer expires and no boss is active."""
    state = GameState()
    state.start_run()
    
    # Simulate timer running past max
    state.run_timer = 119.0  # Just before expiry
    assert state.update_timer(2.0) == False  # Timer expires
    assert state.game_over == True

def test_timer_expires_with_boss():
    """Run should continue when timer expires but boss is active."""
    state = GameState()
    state.start_run()
    state.set_boss_active(True)
    
    # Simulate timer running past max
    state.run_timer = 119.0
    assert state.update_timer(2.0) == True  # Continue despite timer expiry
    assert state.game_over == False

def test_boss_defeated_ends_run():
    """Run should end when boss is defeated."""
    state = GameState()
    state.start_run()
    state.set_boss_active(True)
    
    # Timer expires but boss is active
    state.run_timer = 119.0
    assert state.update_timer(2.0) == True
    
    # Boss is destroyed
    state.destroy_boss()
    assert state.update_timer(0.0) == False
    assert state.game_over == True
    assert state.boss_destroyed == True

def test_player_destroyed_during_boss_fight():
    """Run should end if player is destroyed during boss fight."""
    state = GameState()
    state.start_run()
    state.set_boss_active(True)
    
    # Timer expires but boss is active
    state.run_timer = 119.0
    assert state.update_timer(2.0) == True
    
    # Player is destroyed
    state.destroy_player()
    assert state.update_timer(0.0) == False
    assert state.game_over == True
    assert state.player_destroyed == True

def test_enemy_manager_boss_tracking():
    """EnemyManager should correctly track boss activity."""
    state = GameState()
    manager = EnemyManager(state)
    
    # No boss initially
    assert manager.has_active_boss() == False
    assert state.boss_active == False
    
    # Spawn boss
    boss = MockBossEnemy(alive=True)
    manager.spawn_boss(boss)
    assert manager.has_active_boss() == True
    assert state.boss_active == True
    
    # Update and destroy boss
    boss.is_alive = False
    manager.update(0.0)
    assert manager.has_active_boss() == False
    assert state.boss_active == False
    assert state.boss_destroyed == True

def test_normal_enemies_dont_affect_boss_state():
    """Normal enemies should not trigger boss state changes."""
    state = GameState()
    manager = EnemyManager(state)
    
    enemy = MockNormalEnemy(alive=True)
    manager.enemies.append(enemy)
    
    assert manager.has_active_boss() == False
    assert state.boss_active == False
    
    # Destroy normal enemy
    enemy.is_alive = False
    manager.update(0.0)
    assert state.boss_destroyed == False  # Should not trigger boss victory

if __name__ == "__main__":
    test_timer_expires_without_boss()
    test_timer_expires_with_boss()
    test_boss_defeated_ends_run()
    test_player_destroyed_during_boss_fight()
    test_enemy_manager_boss_tracking()
    test_normal_enemies_dont_affect_boss_state()
    print("All tests passed!")