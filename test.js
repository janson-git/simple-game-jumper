var Floor = function() {
    this.o = $("#floor");
    this.y = $(this.o).offset().top;
};
Floor.prototype.offset = function() {
    return this.y;
};


var Player = function () {
    this.o = $("#ball");
    this.x = 1;
    this.y = 1;
    this.height = 10;
    this.width = 10;
    
    this.weight = 16;
    this.energy = 0;
    
    this.lostEnergyCoeff = 0.3;
    this.zeroTrashold = 5;
    this.readyToJump = false;
};

Player.prototype.init = function() {
    $(this.o).css({
        width: this.width, 
        height: this.height,
        borderRadius: this.height/2,
        backgroundColor: "#f69"
    });
};

Player.prototype.draw = function() {
    
    // сначала проверим: если отпустили Key.DOWN, и при этом есть энергия: делаем подскок!
    if (!Key.isDown(Key.DOWN) && this.y <= (Game.floorOffset() - this.height)) {
        // this.energy - начальная скорость на подскок.
        // начальная скорость на следующий кадр:
        this.energy = this.energy - ((1/Game.fps) * Game.g * this.weight);
        this.y = this.y - (this.energy / 10);
        // если начался уход ниже пола - сбрасываем энергию в ноль.
        if (this.y > (Game.floorOffset() - this.height)) {
            this.y = Game.floorOffset() - this.height;
            if (Math.abs(this.energy) < this.zeroTrashold) {
                this.energy = 0;
            } else {
                if (Key.isDown(Key.UP)) {
                    this.energy = Math.abs(this.energy);
                } else {
                    this.energy = Math.abs(this.energy) - Math.abs(this.energy) * this.lostEnergyCoeff;
                }
            }
        }
        
    } else if (!Key.isDown(Key.DOWN)) {
        if (this.y > (Game.floorOffset() - this.height)) {
            this.y = Game.floorOffset() - this.height;
        }
        this.energy = 0;
    }
    
    //console.log(this.y, Game.floorOffset() - this.height, this.energy);
    
    $(this.o).offset({top: this.y, left: this.x});
};
Player.prototype.moveLeft = function() {
    this.x -= 1;
};
Player.prototype.moveRight = function() {
    this.x += 1;
};
Player.prototype.moveUp = function() {
    this.y -= 1;
};
Player.prototype.moveDown = function() {
    if (Game.floorOffset() > (this.y + this.height)) {
        this.y += 1;
    } else {
        this.energy++;
    }
};

Player.prototype.update = function() {
    if (Key.isDown(Key.UP)) this.moveUp();
    if (Key.isDown(Key.LEFT)) this.moveLeft();
    if (Key.isDown(Key.DOWN)) this.moveDown();
    if (Key.isDown(Key.RIGHT)) this.moveRight();
};




var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },
    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    }
};



var Game = {
    fps: 60,
    g: 15
};

Game.start = function() {
    Game.floor = new Floor();
    
    
    Game.player = new Player();
    Game.player.x = 100;
    Game.player.y = 400;
    Game.player.init();
    
    Game.draw();

    Game._onEachFrame(Game.run);
};

Game.draw = function() {
    Game.player.draw();
};

Game.update = function() {
    Game.player.update();
};

Game.floorOffset = function() {
    return Game.floor.offset();
};

Game._onEachFrame = (function() {
        return function(cb) {
            setInterval(cb, 1000 / Game.fps);
        };
})();


Game.run = (function() {
    var loops = 0, skipTicks = 1000 / Game.fps,
        maxFrameSkip = 10,
        nextGameTick = (new Date).getTime(),
        lastGameTick;

    return function() {
        loops = 0;

        while ((new Date).getTime() > nextGameTick) {
            Game.update();
            nextGameTick += skipTicks;
            loops++;
        }

        if (loops) Game.draw();
    }
})();


// добавим обработчики нажатий
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// запускаем игру
Game.start();

