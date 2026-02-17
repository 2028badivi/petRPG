# TJHSST FBLA 2026 Intro to Programming

# petRPG

* This is petRPG, a game for TJFBLA Intro to Programming 2026 where users move around a grid and enter stations to make scheduling commands to take care of the pet.

---

## Controls

* Move with WASD or Arrow keys.
* Interact with stations using Space.

---

## Overall Flow of petRPG and Brief Overview

* The goal: Keep your pet healthy by planning a day using block code. The better your schedule, the longer you survive.

* When you start the game, you start off at level 1 with $50.
  * Your pet has 5 variables:
   * health,
   * hygiene,
   * hunger,
   * energy,
   * and happiness.
* Your character has 3 variables:
  * currentFood,
  * lives,
  * and level.
 * Gameplay is infinite. However, as you level up, the game gets harder, as incrementing variables costs more money and variables decrease faster. The game ends when you lose 2 "hearts."
 * You lose a heart when your cash or any pet care variable goes to 0 or below  after executing your schedule/day. However, after you lose your first heart, you gain a "loan" of $50 to recover your care and character variables.
 * This game is all about logical planning and scheduling a day for the future. A running total of all your expenses is in the "status section".

* To increase these variables, a user has to use block logic to plan their day, which teaches the user how to logically think along with planning for the future.

---

## How do you schedule?

* Walk to a station and press Space.
* Use Blockly blocks to create actions (you are “programming” the day).
* Your planned actions are saved and shown in the Scheduled Actions sidebar.
* Press "Execute All" to simulate a day and run everything you scheduled across all stations.

---

## Stations

* Home: this is where you play with pet, Wash pet. Contains logic editor for automation (repeat blocks, if-statement blocks).
* Grocery Store: Buy food ($1/ea), Feed pet. Contains logic editor.
* Vet: Heal pet ($10), Daily check-up ($2). Contains logic editor.
* Work: Work for a set amount of hours (0-24). Every hour you work, care variables decrease by a higher value. Contains logic editor.

---

## Features

* Sidebar: Shows "Scheduled Actions" summarized by Blockly logic.
* Execute All Button (Blue): Runs all logic across all stations at once.
* Stats: Health, Hunger, Happiness, Hygiene, Money, User Level, Current food, Lives.
* Automation: Use the Blockly editor in each station to create "Schedules".
* Analytical Report: After every day simulation, a report shows how all your global variables changed and updated as consequences of your actions.

---

## Credits

* Piskel art used for ALL pixel art [https://www.piskelapp.com/](https://www.piskelapp.com/)
* Blockly.js library for the logic editor
* Source code for all blocks created using Google Blockly Developer Tool
* Groq API for AI Interative Q&A feature
* Visual Studio Code
* Github (this app!)

