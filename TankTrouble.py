import pygame
import sys

import random


# Initialize Pygame
pygame.init()

# Set up the display
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pygame Starter")

# Define colors
WHITE = (255, 255, 255)
GREY = (100,100,100)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

# Define map data (a simple grid for demonstration)
MAP_WIDTH = 10
MAP_HEIGHT = 10
TILE_SIZE = 50
WALL_THICKNESS=8


class Map:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.walls = []

def DrawMap(map):

    walls = map.walls
    width = map.width
    height = map.height



    for (x, y, direction) in walls:
            start = (x*TILE_SIZE, y*TILE_SIZE)
            if(direction):#horizontal
                end = ((x+1)*TILE_SIZE, (y)*TILE_SIZE)
                pygame.draw.line(screen, BLACK, start, end, WALL_THICKNESS)
            else:#vertical
                end = ((x)*TILE_SIZE, (y+1)*TILE_SIZE)
                pygame.draw.line(screen, BLACK, start, end, WALL_THICKNESS)


def GenerateMap(width, height):
    map = Map(width,height)
    walls = []     
    #first make a square around the  whole map
    for x in range(width):
        walls += [(x, 0, True)]
        walls += [(x, height, True)]
    for y in range(height):
        walls += [(0, y, False)]
        walls += [(width, y, False)]
        
    map.walls = walls

    return map


# Main game loop
running = True
map = GenerateMap(10,10)
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    
    # Clear the screen
    screen.fill(WHITE)
    
    # Draw the map
    DrawMap(map)

    # Update the display
    pygame.display.flip()

    # Cap the frame rate
    pygame.time.Clock().tick(60)

# Quit Pygame
pygame.quit()
sys.exit()
