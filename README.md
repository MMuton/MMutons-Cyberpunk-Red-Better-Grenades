<p align="center">
  <img src = "https://i.imgur.com/5MolcAq.png" width=700>
</p>
<h1 align="center"> Cyberpunk RED: Better Grenades </h1> <br>
<p align="center">
  An improved grenade system module for Cyberpunk RED, made by MMuton.
</p>
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Known Issues](#known-issues)
- [Credits](#credits)
- [Disclaimer](#disclaimer)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

This module has been created to streamline and automate grenade throwing in the FVTT Cyberpunk RED system.

## Features

* A **throw button** appears on each grenade in the Gear tab (next to Split and Delete) and in a Mook's Special Gear. Equipped **grenade and rocket launchers** get a fire button in the Fight tab. Throwing uses one grenade (and can remove the item when the last one is gone); firing a launcher uses one round from the magazine.
* Throwing posts a **chat card** with buttons to place the blast template and roll damage or detonate.
* **Place the 5x5 blast template with your cursor.** It shows the distance and DV as you move it; left-click to place, right-click or Esc to cancel. Template color is configurable per grenade type.
* **Throw check:** after placing, the thrower's Athletics (or the launcher's skill) is rolled with the system's roll dialog against the range DV, and a HIT/MISS card is posted.
* **Damage is applied with the system's own damage routine** to every token in the template: armor SP (minus ablation), ablation, critical damage, shields, damage reduction and non-lethal rubber all follow the system, and each target gets the system's damage card with undo.
* **One resistance dialog per grenade** for Resist Torture/Drugs and Cybertech checks: click a name to open that token's sheet, PCs and NPCs are colored differently, tick Pass/Fail or roll for one target or everyone. Results are posted as one summary card.
* All current grenade types are handled with rules-accurate behavior.
* **Sequencer integration** plays explosion, EMP, flashbang and smoke animations and sounds. Automatically detects which JB2A version is installed.
* **Bundled sound effects** for explosion, EMP, and flashbang are included and set as defaults.
* **Custom grenade code editor** lets GMs write JavaScript for special grenade types, with access to targets, templates, actor, and the `GrenadeSystem` API. Custom code always runs on the GM's client. Includes the Rave Grenade from "The 12 Days of Cutiemas" DLC as a built-in example.

<h1 align="center"> Easy & Automated Grenade Throwing With 5x5 Template Creation  </h1>
<p align="center">
  <img src = "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExenIwbzVvN2p6MXk0Ym8zM20zeGxpbXFxbThydjcwamhodGMybm12MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Php8prfD0vvtrPJLBP/giphy.gif" width=700>
</p>

<h1 align="center"> Automated Damage & Effect Application To Tokens In The Template (With Resistance Checks Where Needed) </h1>
<p align="center">
  <img src = "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTRjdzRobGZzc3BkMXo0YjV6ZzZhZ3JmaTJodWhrcW5pODk5ejd1ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/udwlYVnMdpR8OBnucf/giphy.gif" width=700>
</p>

<h1 align="center"> Extensive Settings & Customization </h1>
<p align="center">
  <img src="https://i.imgur.com/hC0X7oH.png" width=700>
</p>

## Known Issues

No Known Issues at this time.

## Credits

* SOUND_GARAGE on pixabay.com for the EMP sound effect.https://pixabay.com/sound-effects/film-special-effects-glitch-fx-transitions-1-311805/
* MadPanCake, LeMudCrab and fastson on freesound.org for the Flashbang sound effect https://freesound.org/people/MadPanCake/sounds/660767/
* misosound on freesound.org for the Explosion sound effect https://freesound.org/people/misosound/sounds/251759/
* Militech font by Adam Rucki
* ArtsyBee and Clker-Free-Vector-Images from Pixabay for the Arm and Grenade vector, respectively.

## Disclaimer

As someone who is still new to programming, I have enlisted the help of AI during this project when I have struggled with the code.
