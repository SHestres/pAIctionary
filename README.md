# pAIctionary

The classic game of pictionary, reimagined with AI image generation. For those who love to guess but just can't draw, you can prompt an ai instead!

Taking inspiration from jackbox games, pAIctionary is played around a large display and players connect using a web browser.

- [Installation](#installation)
    - [Web Server](#web-server)
    - [Image Generator](#image-generator)
- [Starting and Stopping the Game](#starting-and-stopping-the-game)
- [How to Play](#how-to-play)
- [Additional Rules](#rules)

## Installation

pAIctionary uses two components to work. A web server and an image generator.

### Web Server

The web server can be run on the same machine as the image generator, but doesn't need to be. It only needs to be accessible by all players and the image generator.
If you're hosting behind a reverse proxy, make sure you pass websocket connections.

If you're installing on windows, you can use the same commands just remove "sudo"

#### With Docker Compose

1. Make sure you have docker compose installed
    - If you don't already have docker compose, follow the instructions on [their website](https://docs.docker.com/compose/install/)
2. Clone this repo into any folder you'd like
    ```
    git clone https://github.com/SHestres/pAIctionary.git
    ```
3. Run docker-compose
    ```
    sudo docker-compose up -d
    ```
4. That's it!
    - By default, pAIctionary runs on port 7242. If you'd like to change this, you can edit docker-compose.yml.

#### Without docker (required node and npm)

1. Make sure you have node and npm installed
    - If you don't already have node and npm installed, follow the instructions on [their website](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Clone this repo into any folder you'd like
    ```
    git clone https://github.com/SHestres/pAIctionary.git
    ```
3. Go into the 'client' folder (pardon the bad naming)
    ```
    cd ./client
    ```
4. Install all necessary node packages
    ```
    sudo npm -i
    ```
5. Run the program
    ```
    sudo npm run start
    ```
6. That's it!
    - You're now ready to connect to the web-server. It runs on port 7242.
  
#### Nginx

Here's the nginx config I use.
It doesn't require many headers, but you do need to upgrade websocket connections.

```
server {
    server_name play.example.com;

    listen [::]:80
    listen 80;

    location / {
        proxy_pass http://10.0.0.10:7242;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
```

### Image generator

A couple points that may be helpful in setting up the image generator
- The image generator does not need to be on a public facing ip, it functions as another client connecting to the web server.
- The image generator does not need to be run on the same system as the web server
- The image generator needs to be run with a CUDA capable GPU

Here are the steps to install and run

1. Make sure you have python and pip installed
    - If you don't, follow [these instructions](https://realpython.com/installing-python/)
2. Download the generator files
    - You can either clone this repository using ```git clone https://github.com/SHestres/pAIctionary.git``` or you can directly download "generator.py" and "requirements.txt" from the 'generator' folder.
3. Install the necessary python packages
    ```
    pip install -r /path/to/requirements.txt
    ```
4. Run the program
   ```
    python /path/to/generator.py
    ```
6. That's it!

## Starting and Stopping the game

Running the game is fairly simple, just start both programs. The webserver must be started first, so the generator can connect to it.

To stop the game, you can stop the generator by killing it's process (close the terminal/powershell window) and you can stop the webserver by running the command ```sudo docker-compose down```

## How to Play

The most fun part!

pAIctionary is played around a central large display. Realistically this can be anything, but I recommend a laptop connected to a tv. Players then connect to the game through a web browser (typically their phone) where they take turns inputting prompts and guessing for their team.

#### Connecting
To connect the display, navigate to the endpoint /display. If you have a domain that would mean ```play.example.com/display``` or whatever the local ip of the device your hosting on, eg. ```192.168.0.100:7242/display```.
    If you're unsure what this means, google "how to find my local ip address"

Players can connect to the same ip or domain, just without the endpoint (play.example.com or 192.168.0.100:7242)

#### Playing the game
Before players can join a team, you need to create the teams on the display. You can select team colors, and choose how many teams you want.
This screen also allows you to set the length of turns. If it's your first time playing, I recommend leaving the default of 200 seconds.

Once you've created teams, all players should refresh the page. They can then enter a username and choose a team to join! Once all players have joined, you can start the game on the display.

After the game is started, each player will be given a prompt as to whether they are "drawing", guessing, or doing nothing that round. The drawer is also given a ready button to start the round.

When the round has started, the drawer will be given 3 words to get their team to guess. They do so by writing a prompt for AI to generate. The image gets shown on the display as the drawer types. If their team correctly guesses a word, the drawer hits the "Guessed!" button, submitting the word and giving them a new one. If they are unable to get any of the three words, they can press the "Skip" button to get three new words.

When the round is over, the display will show all correctly guessed words with their prompts, as well as any skipped words. The player that just finished drawing is shown another ready button which is used to move on to the next turn.

The game will continue like this, with no limit on rounds. If you want to start a new game, there is a button for it on the display. This will take you back to the team creation screen.

### Rules

While the flow of the game is described above, here are some clarifying points.

- Keeping score
    - Score is kept on paper. Suggested points values are plus 1 point per correctly guessed word, and minus 1 point for skipping 3 words (pressing skip once)
- The drawer may not speak while they are drawing, except to give specific phrases as described below.
- The drawer cannot prompt with a part or form of any of the words they are currently trying to draw.
    - For the word "Drink" you cannot type "Drinking"
    - For the word "Butterfly" you cannot type "Butter" or "Fly"
- How close guesses must be should be decided on beforehand
    - Examples to consider:
    - Does puzzle count for jigsaw puzzle? How about the other way around? (Suggested: yes, yes)
    - Does alarm clock count for alarm? How about the other way around? (Suggested: no, yes)
    - Does teacup count for cup of tea? How about the other way around (Suggested: no, no. But you may need to be this loose until you get used to prompting)
    - How do startship, spaceship, and spaceshuttle interact? (Suggested: same as above)
- The drawer can use special phrases, as agreed upon by the group. Here are some suggestions  
    - "Keep this image in mind"
    - "First word is this image" (Can be followed by acknowledging correct guesses "Yes, first word is space")
    - "Sounds like" (Correct guesses here cannot be acknowledged)
- You can choose to play with a stealing rule
    - Any words that don't get guessed but aren't skipped (the last 3 words of the turn) can be guessed by an opposing team. That team gets one guess, and get one point if it is correct.
