# Progress Station

**Enjoy numbers going big in this quirky sci-fi auto-idler!**

---

In **Progress Station** you are the captain of a space station traveling through the vastness of space.

You configure modules, level up operations, grow your crew and explore space in a quirky and light-hearted science fantasy setting.

But be careful: bound to you by a sinister curse, an ultra powerful alien entity, known to some as _The Destroyer_, is ever looking for you.

If you like the world building of Adventure Time or the epic space saga of Gloryhammer you will feel right at home.

## FEATURES
- A total of 83 game elements wait for you to level them to the maximum
  - 6 modules containing 10 components with 34 operations
  - 10 factions allowing for 120 battles
  - 4 sectors with 13 points of interest
- A boss battle leading into unlockable Galactic Secrets and a roguelite gameplay
- Adaptive UI

## HOW TO PLAY
- Click progress bars to activate elements and let them level up
- Manage the gained attributes to improve your progress speed
- Ramp up far enough to be able to defeat the galactic boss
- Or start a new playthrough with increased progress speed based on your previous levels

## WHERE TO PLAY

- [Itch.io](https://kringel-games.itch.io/progress-station)

---

## Development

### As a Non-Coder

#### Starting the game locally

**Simple Version:** Double-click `index.html`

It just works. BUT has limitations:
- No sounds

**Better Version:** Double-click `start.bat`  
--> This will start a local server and opens the game on https://localhost:8000

When you first run this, you will get two prompts by Windows:
1. Accept the addition of a root certificate by the server (Caddy) - please accept, so HTTPs works correctly
2. Allowing the server (Caddy) to communicate through your firewall - please accept, otherwise nothing will work
3. (Firefox only) You will still need to add an exception for the game. Firefox warns "Potential Security Risk ahead", you click "Advanced..." and then "Accept the Risk and Continue".

#### Editing files

**Recommended Tool:** Sublime Text 3



### As a Coder

**Recommended Tool:** JetBrains IntelliJ IDEA Ultimate

Use the [HTML Preview](https://www.jetbrains.com/help/idea/editing-html-files.html#ws_html_preview_output_procedure) feature to display `index.html` with auto-reload in your favorite browser.

### Deployment

1. Remove

```html

<script type="text/javascript" src="js/development/cheats.js"></script>
...
<script type="text/javascript" src="js/development/autoplay2.js"></script>
``` 
from index.html

2. Zip the following
   - audio
   - css
   - fonts
   - img
   - js
   - release
   - vendor
   - index.html
   - LICENSE
   - package.json
3. Upload the Zip to itch.io
