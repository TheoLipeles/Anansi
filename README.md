# Spider-Domination

> Teach software engineers the importance of algorithm efficiency in a 1-on-1 strategic game environment setting

#### Technical Requirements
 - Javascript
 - Data Structures / Algorithm
 - Mechanics of webcrawlers
 - Hash / Cryptography

#### Game Environment
- ##### Winning Objective
     First player that captures the opponent's home base wins
- ##### Player Interaction
    Implement a Javascript algorithm strategy that observes the following:
    1. Locates and capture the opponent's base
    2. Protect homebase or acquired nodes
- ##### Game Environment
    - **Resources Generation**
        -   A fixed amount of resources are generated by homebase per game interval
    - **Resource Allocation**
        -   Assign observers movements and direction at each encountered node
        -   Assign miners toward an observed node to **attack** or **defend** (if already acquired)
