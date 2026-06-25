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

This module has been created to streamline and automate the grenade throwing in the FVTT Cyberpunk RED system.

## Features

* A **throw button** appears directly on each grenade in the Gear tab, where how Split and Delete Buttons are. Clicking it automatically decrements quantity and optionally removes the item when the last one is used.
* Throwing a grenade posts a **chat card** with buttons to place the blast template, roll damage, and apply effects.
* A **5x5 blast template** is placed centered on the thrower's token with a single click. Template color is fully configurable per grenade type in the settings.
* **Damage is rolled and applied automatically** to all tokens inside the blast template. Armor SP is soaked and ablation is applied per the rules. The template is deleted after damage is applied.
* All current grenade types are handled with rules-accurate behavior.
* **Resistance check dialogs** prompt the GM per-target for Resist Torture/Drugs and Cybertech checks.
* **Sequencer integration** plays explosion, EMP, and flashbang animations and sounds on detonation. Automatically detects what JB2A version is installed for the animations.
* **Bundled sound effects** for explosion, EMP, and flashbang are included and set as defaults.
* **Custom grenade code editor** allows GMs to write JavaScript for special grenade types, with access to targets, templates, actor, and the full GrenadeSystem API. Includes the Rave Grenade from "The 12 Days of Cutiemas" DLC as a built-in example.

<h1 align="center"> Easy & Automated Grenade Throwing With 5x5 Template Creation  </h1>
<p align="center">
  <img src = "https://i.imgur.com/m3WUKhV.gif" width=700>
</p>

<h1 align="center"> Automated Damage & Effect Application To Tokens In The Template (With Resistance Checks Where Needed) </h1>
<p align="center">
  <img src = "https://i.imgur.com/ngGlbl6.gif" width=700>
</p>

<h1 align="center"> Extensive Settings & Customization </h1>
<p align="center">
  <img src="https://i.imgur.com/SWP9HFU.gif" width=700>
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