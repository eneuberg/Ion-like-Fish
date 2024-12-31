const RAD = Math.PI / 180;
const scrn = document.getElementById("canvas");
const sctx = scrn.getContext("2d");
scrn.tabIndex = 1;
const pipeSizes = [52,400];
const birdSizes = [34,26];
const potiSizes = [78, 51];
const turnoffSizes = [82,42];
const getReadySizes = [285, 95];
const goSizes = [290, 88];
let currentSpeed = 0;
let switchActive = true; // false if potentiometer

function showOverlay() {
  document.getElementById("overlay").style.display = "block";
}

// Function to hide the overlay
function hideOverlay() {
  document.getElementById("overlay").style.display = "none";
}

function receiveSerial(serialLine)  {

  function mapValue(value, in_min, in_max, out_min, out_max) {
    return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  if (!(typeof serialLine === "string" && serialLine !== ""))  {
    console.log("non-string or non-number string")
    return false;
  }

  const [poti, left, right] = serialLine.split('-');

  const lowerConstraint = 180;
  const higherConstraint = 880;
  const lowerMap = -4;
  const higherMap = 4;

  currentSpeed = mapValue(parseInt(poti), lowerConstraint, higherConstraint, lowerMap, higherMap);
  document.getElementById('potiValue').innerText = "Poti: " + poti;
  document.getElementById('speedValue').innerText = "Speed: " + currentSpeed;

  console.log(state.curr, currentSpeed, switchActive);
  if (state.curr === state.getReady && currentSpeed > 3.7 && switchActive === true)  {
    state.curr = state.Play;
    SFX.start.play();
  }

  if (left === "0" && switchActive === false) {
    hideOverlay();
    switchActive = true;
  }

  if (right === "0" && switchActive === true) {
    showOverlay();
    switchActive = false;
    if (state.curr === state.gameOver) {
      state.curr = state.getReady;
      bird.speed = 0;
      bird.y = 100;
      pipe.pipes = [];
      UI.score.curr = 0;
      SFX.played = false;
    }
  }
}

/*scrn.addEventListener("click", () => {
  switch (state.curr) {
    case state.getReady:
      state.curr = state.Play;
      SFX.start.play();
      break;
    case state.Play:
      //bird.flap();
      break;
    case state.gameOver:
      state.curr = state.getReady;
      bird.speed = 0;
      bird.y = 100;
      pipe.pipes = [];
      UI.score.curr = 0;
      SFX.played = false;
      break;
  }
});
*/

scrn.onkeydown = function keyDown(e) {
  if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38) {
    // Space Key or W key or arrow up
    switch (state.curr) {
      case state.getReady:
        state.curr = state.Play;
        SFX.start.play();
        break;
      case state.Play:
        bird.flap();
        break;
      case state.gameOver:
        state.curr = state.getReady;
        bird.speed = 0;
        bird.y = 100;
        pipe.pipes = [];
        UI.score.curr = 0;
        SFX.played = false;
        break;
    }
  }
};

let frames = 0;
let dx = 2;
const state = {
  curr: 0,
  getReady: 0,
  Play: 1,
  gameOver: 2,
};
const SFX = {
  start: new Audio(),
  flap: new Audio(),
  score: new Audio(),
  hit: new Audio(),
  die: new Audio(),
  played: false,
};
const gnd = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    this.y = parseFloat(scrn.height - this.sprite.height);
    sctx.drawImage(this.sprite, this.x, this.y);
  },
  update: function () {
    if (state.curr != state.Play) return;
    this.x -= dx;
    this.x = this.x % (this.sprite.width / 2);
  },
};
const bg = {
  sprite: new Image(),
  x: 0,
  y: 0,
  draw: function () {
    y = parseFloat(scrn.height - this.sprite.height);
    sctx.drawImage(this.sprite, this.x, y);
  },
};
const pipe = {
  top: { sprite: new Image() },
  bot: { sprite: new Image() },
  gap: 85,
  moved: true,
  pipes: [],
  draw: function () {
    for (let i = 0; i < this.pipes.length; i++) {
      let p = this.pipes[i];
      sctx.drawImage(
          this.top.sprite,
          p.x,
          p.y,
          pipeSizes[0],
          pipeSizes[1]
      );

// Draw the bottom sprite with scaling and offset by the gap
      sctx.drawImage(
          this.bot.sprite,
          p.x,
          p.y + pipeSizes[1] + this.gap,
          pipeSizes[0],
          pipeSizes[1]
      );
    }
  },
  update: function () {
    if (state.curr != state.Play) return;
    if (frames % 100 == 0) {
      this.pipes.push({
        x: parseFloat(scrn.width),
        y: -210 * Math.min(Math.random() + 1, 1.8),
      });
    }
    this.pipes.forEach((pipe) => {
      pipe.x -= dx;
    });

    if (this.pipes.length && this.pipes[0].x < -pipeSizes[0]) {
      this.pipes.shift();
      this.moved = true;
    }
  },
};
const bird = {
  animations: [
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
    { sprite: new Image() },
  ],
  rotatation: 0,
  x: 50,
  y: 100,
  speed: 0,
  gravity: 0.125,
  thrust: 3.6,
  frame: 0,
  draw: function () {
    let h = birdSizes[1];//this.animations[this.frame].sprite.height;
    let w = birdSizes[0];//this.animations[this.frame].sprite.width;
    sctx.save();
    sctx.translate(this.x, this.y);
    sctx.rotate(this.rotatation * RAD);
    sctx.drawImage(
        this.animations[this.frame].sprite,
        -w / 2,    // x position (centered horizontally)
        -h / 2,    // y position (centered vertically)
        birdSizes[0],         // target width
        birdSizes[1]          // target height
    );
    sctx.restore();
  },
  update: function () {
    let r = birdSizes[0] / 2;//this.animations[0].sprite.width) / 2;
    switch (state.curr) {
      case state.getReady:
        this.rotatation = 0;
        this.y += frames % 10 == 0 ? Math.sin(frames * RAD) : 0;
        this.frame += frames % 10 == 0 ? 1 : 0;
        break;
      case state.Play:
        this.frame += frames % 5 == 0 ? 1 : 0;
        this.y += this.speed;
        this.setRotation();
        this.speed = currentSpeed;
        if (this.y + r >= gnd.y || this.collisioned()) {
          state.curr = state.gameOver;
        }

        break;
      case state.gameOver:
        this.frame = 1;
        if (this.y + r < gnd.y) {
          this.y += this.speed;
          this.setRotation();
          this.speed += this.gravity * 2;
        } else {
          this.speed = 0;
          this.y = gnd.y - r;
          this.rotatation = 90;
          if (!SFX.played) {
            SFX.die.play();
            SFX.played = true;
          }
        }

        break;
    }
    this.frame = this.frame % this.animations.length;
  },
  flap: function () {
    if (this.y > 0) {
      SFX.flap.play();
      this.speed = -this.thrust;
    }
  },
  setRotation: function () {
    if (this.speed <= 0) {
      this.rotatation = Math.max(-25, (-25 * this.speed) / (-1 * this.thrust));
    } else if (this.speed > 0) {
      this.rotatation = Math.min(90, (90 * this.speed) / (this.thrust * 2));
    }
  },
  collisioned: function () {
    if (!pipe.pipes.length) return;
    let x = pipe.pipes[0].x;
    let y = pipe.pipes[0].y;
    let r = birdSizes[1] / 4 + birdSizes[0] / 4;
    let roof = y + parseFloat(pipeSizes[1]);
    let floor = roof + pipe.gap;
    let w = parseFloat(pipeSizes[0]);
    if (this.x + r >= x) {
      if (this.x + r < x + w) {
        if (this.y - r <= roof || this.y + r >= floor) {
          SFX.hit.play();
          return true;
        }
      } else if (pipe.moved) {
        UI.score.curr++;
        SFX.score.play();
        pipe.moved = false;
      }
    }
  },
};
const UI = {
  getReady: { sprite: new Image() },
  gameOver: { sprite: new Image() },
  poti: [{ sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }],
  turnoff: [{ sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }],
  score: {
    curr: 0,
    best: 0,
  },
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  frame: 0,
  draw: function () {
    switch (state.curr) {
      case state.getReady:
        this.y = parseFloat(scrn.height - getReadySizes[1]) / 3;
        this.x = parseFloat(scrn.width - getReadySizes[0]) / 2;
        this.tx = parseFloat(scrn.width - potiSizes[0]) / 2;
        this.ty =
          this.y + ((getReadySizes[1] - potiSizes[1]) * 2.5);
        sctx.drawImage(this.getReady.sprite, this.x, this.y, getReadySizes[0], getReadySizes[1]);
        sctx.drawImage(this.poti[this.frame].sprite, this.tx, this.ty, potiSizes[0], potiSizes[1]);
        break;
      case state.gameOver:
        this.y = parseFloat(scrn.height - goSizes[1]) / 3;
        this.x = parseFloat(scrn.width - goSizes[0]) / 2;
        this.tx = parseFloat(scrn.width - turnoffSizes[0]) / 2;
        this.ty =
          this.y + ((goSizes[1] - turnoffSizes[1]) * 2.5);
        sctx.drawImage(this.gameOver.sprite, this.x, this.y, goSizes[0], goSizes[1]);
        sctx.drawImage(this.turnoff[this.frame].sprite, this.tx, this.ty, turnoffSizes[0], turnoffSizes[1]);
        break;
    }
    //this.drawScore();
  },
  drawScore: function () {
    sctx.fillStyle = "#FFFFFF";
    sctx.strokeStyle = "#000000";
    switch (state.curr) {
      case state.Play:
        sctx.lineWidth = "2";
        sctx.font = "35px Squada One";
        sctx.fillText(this.score.curr, scrn.width / 2 - 5, 50);
        sctx.strokeText(this.score.curr, scrn.width / 2 - 5, 50);
        break;
      case state.gameOver:
        sctx.lineWidth = "2";
        sctx.font = "40px Squada One";
        let sc = `SCORE :     ${this.score.curr}`;
        try {
          this.score.best = Math.max(
            this.score.curr,
            localStorage.getItem("best")
          );
          localStorage.setItem("best", this.score.best);
          let bs = `BEST  :     ${this.score.best}`;
          sctx.fillText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
          sctx.strokeText(sc, scrn.width / 2 - 80, scrn.height / 2 + 0);
          sctx.fillText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30);
          sctx.strokeText(bs, scrn.width / 2 - 80, scrn.height / 2 + 30);
        } catch (e) {
          sctx.fillText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
          sctx.strokeText(sc, scrn.width / 2 - 85, scrn.height / 2 + 15);
        }

        break;
    }
  },
  update: function () {
    if (state.curr == state.Play) return;
    if (frames % 15 === 0) {
      this.frame = (this.frame + 1) % this.poti.length;
    }
  },
};

gnd.sprite.src = "img/ground.png";
bg.sprite.src = "img/BG.png";
pipe.top.sprite.src = "img/toppipe.png";
pipe.bot.sprite.src = "img/botpipe.png";
UI.gameOver.sprite.src = "img/go.png";
UI.getReady.sprite.src = "img/getready.png";
UI.poti[0].sprite.src = "img/poti/t0.png";
UI.poti[1].sprite.src = "img/poti/t1.png";
UI.poti[2].sprite.src = "img/poti/t2.png";
UI.turnoff[0].sprite.src = "img/turnoff/turnoff1.png"
UI.turnoff[1].sprite.src = "img/turnoff/turnoff2.png"
UI.turnoff[2].sprite.src = "img/turnoff/turnoff3.png"
bird.animations[0].sprite.src = "img/bird/b0.png";
bird.animations[1].sprite.src = "img/bird/b1.png";
bird.animations[2].sprite.src = "img/bird/b2.png";
bird.animations[3].sprite.src = "img/bird/b0.png";
SFX.start.src = "sfx/start.wav";
SFX.flap.src = "sfx/flap.wav";
SFX.score.src = "sfx/score.wav";
SFX.hit.src = "sfx/hit.wav";
SFX.die.src = "sfx/die.wav";

function gameLoop() {
  update();
  draw();
  frames = frames + 1;
}

function update() {
  bird.update();
  gnd.update();
  pipe.update();
  UI.update();
}

function draw() {
  sctx.fillStyle = "#30c0df";
  sctx.fillRect(0, 0, scrn.width, scrn.height);
  bg.draw();
  pipe.draw();

  bird.draw();
  gnd.draw();
  UI.draw();
}

setInterval(gameLoop, 20);
