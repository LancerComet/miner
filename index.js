/**
 * Miner By LancerComet at 17:39, 2017.05.27.
 * # Carry Your World #
 */
/** Define Cube Size in Visual. In pixel */
var CUBE_SIZE = 60;
/**
 * Cube Class.
 * Define a cube object in game.
 *
 * @class Cube
 */
var Cube = (function () {
    function Cube(_a) {
        var x = _a.x, y = _a.y, isMine = _a.isMine, game = _a.game;
        this.game = null;
        this.cubeElement = null;
        this.x = 0;
        this.y = 0;
        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.stopAction = false;
        this.bothMousesTriggered = false;
        this.mouseDownEvent = null;
        this.mouseUpEvent = null;
        this.contextEvent = null;
        this._isOpen = false;
        /**
         * Flag mark.
         *
         * @private
         * @memberof Cube
         */
        this._flagMark = false;
        /**
         * Unknown mark.
         *
         * @private
         * @memberof Cube
         */
        this._unknownMark = false;
        /**
         * Whether is a mine cube.
         *
         * @type {boolean}
         * @memberof Cube
         */
        this._isMine = false;
        // Setup basic data.
        this.game = game;
        this.x = x;
        this.y = y;
        // Create cube element.
        this.createCubeElement();
        // Mark whether it is a mine cube.
        this.isMine = Boolean(isMine);
    }
    Object.defineProperty(Cube.prototype, "isOpen", {
        get: function () {
            return this._isOpen;
        },
        set: function (newVal) {
            var className = this.cubeElement.className;
            // Normal case.
            if (!this.flagMark && !this.unknownMark) {
                // Set open class name.
                this.cubeElement.className = newVal
                    ? className + (className.indexOf('open') < 0 ? ' open' : '')
                    : className.replace(' open', '');
            }
            this._isOpen = newVal;
            this.setCubeElementLabel();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "flagMark", {
        get: function () {
            return this._flagMark;
        },
        set: function (newVal) {
            this._flagMark = newVal;
            if (newVal && this.unknownMark) {
                this.unknownMark = false;
            }
            var className = this.cubeElement.className;
            this.cubeElement.className = newVal
                ? className + (className.indexOf(' mark') < 0 ? ' mark' : '')
                : className.replace(' mark', '');
            this.setCubeElementLabel();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "unknownMark", {
        get: function () {
            return this._unknownMark;
        },
        set: function (newVal) {
            this._unknownMark = newVal;
            if (newVal && this.flagMark) {
                this.flagMark = false;
            }
            var className = this.cubeElement.className;
            this.cubeElement.className = newVal
                ? className + (className.indexOf(' mark') < 0 ? ' mark' : '')
                : className.replace(' mark', '');
            this.setCubeElementLabel();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "isMine", {
        get: function () {
            return this._isMine;
        },
        set: function (newVal) {
            this._isMine = newVal;
            this.setCubeElementLabel();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "label", {
        /**
         * Label of this cube.
         *
         * @readonly
         * @type {string}
         * @memberof Cube
         */
        get: function () {
            if (!this.isOpen) {
                return '';
            }
            if (this.flagMark) {
                return '❗';
            }
            if (this.unknownMark) {
                return '🐸';
            }
            if (this.isMine) {
                return '💣';
            }
            return (this.nearbyMines.length || '').toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "nearbyMines", {
        /**
         * Get nearby mines cubes.
         *
         * @readonly
         * @memberof Cube
         */
        get: function () {
            return this.findNearbyCubes()
                .filter(function (item) { return item && item.isMine; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "onSelect", {
        /**
         * Set cube on-select status.
         *
         * @param { boolean } newVal
         * @memberof Cube
         */
        set: function (newVal) {
            var className = this.cubeElement.className;
            this.cubeElement.className = newVal
                ? className + (className.indexOf('on-select') > -1 ? '' : ' on-select')
                : className.replace(' on-select', '');
        },
        enumerable: true,
        configurable: true
    });
    Cube.prototype.setMineClassName = function () {
        this.cubeElement.className += this.cubeElement.className.indexOf(' mine') < 0 ? ' mine' : '';
    };
    Cube.prototype.removeMineClassName = function () {
        this.cubeElement.className = this.cubeElement.className.replace(' mine', '');
    };
    /**
     * Find all cubes nearby.
     *
     * @returns {Cube[]}
     * @memberof Cube
     */
    Cube.prototype.findNearbyCubes = function () {
        var _this = this;
        var nearByPosition = [
            [this.x - 1, this.y - 1], [this.x, this.y - 1], [this.x + 1, this.y - 1],
            [this.x - 1, this.y], [false, false], [this.x + 1, this.y],
            [this.x - 1, this.y + 1], [this.x, this.y + 1], [this.x + 1, this.y + 1]
        ];
        var nearByCubes = nearByPosition.map(function (position) { return _this.game.findCube(position[0], position[1]); });
        return nearByCubes;
    };
    /**
     * Create HTML Element for this cube.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.createCubeElement = function () {
        var element = document.createElement('div');
        element.className = 'mine-cube';
        element.style.width = CUBE_SIZE + 'px';
        element.style.height = CUBE_SIZE + 'px';
        element.style.lineHeight = CUBE_SIZE + 'px';
        this.mouseDownEvent = this.onMouseDown.bind(this);
        this.mouseUpEvent = this.onMouseUp.bind(this);
        this.contextEvent = this.onContextMenu.bind(this);
        element.addEventListener('mousedown', this.mouseDownEvent);
        element.addEventListener('mouseup', this.mouseUpEvent);
        element.addEventListener('contextmenu', this.contextEvent);
        this.cubeElement = element;
    };
    /**
     * Set label for element of this cube.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.setCubeElementLabel = function () {
        this.cubeElement.textContent = this.label;
    };
    /**
     * Mouse down event handler.
     *
     * @private
     * @param {Event} event
     *
     * @memberof Cube
     */
    Cube.prototype.onMouseDown = function (event) {
        event.preventDefault();
        if (this.game.gameIsOver) {
            return;
        }
        this.onSelect = true;
        var button = event.button;
        switch (button) {
            case 0:
                this.leftMouseDown = true;
                break;
            case 2:
                this.rightMouseDown = true;
                break;
        }
        if (this.leftMouseDown && this.rightMouseDown) {
            this.bothMousesDown();
        }
    };
    /**
     * Mouse up event handler.
     *
     * @private
     * @param {any} event
     * @memberof Cube
     */
    Cube.prototype.onMouseUp = function (event) {
        this.onSelect = false;
        var button = event.button;
        // Release preview area.
        this.setPreviewArea(false);
        switch (button) {
            // Left mouse.
            case 0:
                this.leftMouseDown = false;
                this.leftMouseUp();
                if (!this.rightMouseDown) {
                    this.stopAction = false;
                }
                break;
            // Right mouse.
            case 2:
                // Use a timer to prevent left mouseup event to be triggered.
                this.rightMouseDown = false;
                this.rightMouseUp();
                if (!this.leftMouseDown) {
                    this.stopAction = false;
                }
                break;
        }
        if (this.bothMousesTriggered) {
            // If marked cube count is equal to nearby mine count, open all surrounding cubes.
            var flagMarkedCubesInPreviewArea = this.findNearbyCubes()
                .filter(function (item) { return item && item.flagMark; })
                .length;
            if (flagMarkedCubesInPreviewArea === this.nearbyMines.length) {
                this.openSurroundingCubes();
                this.game.gameCanBeOver && this.game.setGameWin();
            }
            this.bothMousesTriggered = false;
        }
    };
    /**
     * Left mouse up event.
     *
     * @private
     * @returns
     *
     * @memberof Cube
     */
    Cube.prototype.leftMouseUp = function () {
        // Return when game is over or action is stopped.
        if (this.game.gameIsOver || this.stopAction || this.flagMark || this.unknownMark) {
            return;
        }
        // Open this cube.
        this.isOpen = true;
        // Hit this mine cube.
        if (this.isMine) {
            this.setHitted();
            return this.game.setGameLose();
        }
        // Check and open nearby mines when there are no mine cubes surrounding.
        var nearbyMines = this.nearbyMines.length;
        if (nearbyMines === 0) {
            this.openSafeCubes();
        }
        // Check if game can be over now.
        this.game.gameCanBeOver && this.game.setGameWin();
    };
    /**
     * Right mouse up event.
     *
     * @private
     *
     * @memberof Cube
     */
    Cube.prototype.rightMouseUp = function () {
        if (this.stopAction || (this.isOpen && !this.flagMark && !this.unknownMark)) {
            return;
        }
        this.setMark();
    };
    /**
     * Both mouses click.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.bothMousesDown = function () {
        this.bothMousesTriggered = true;
        this.stopAction = true;
        this.setPreviewArea(true);
    };
    /**
     * Set this mine cube to hitted status.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.setHitted = function () {
        this.cubeElement.className += ' hit';
    };
    /**
     * Set preview area status.
     *
     * @private
     * @param {boolean} [status=false]
     *
     * @memberof Cube
     */
    Cube.prototype.setPreviewArea = function (status) {
        if (status === void 0) { status = false; }
        this.findNearbyCubes().forEach(function (item) {
            if (item && !item.flagMark && !item.unknownMark) {
                item.onSelect = status;
            }
        });
    };
    /**
     * Context menu event handler.
     * Only for preventing default behaviors.
     *
     * @private
     * @param {Event} event
     *
     * @memberof Cube
     */
    Cube.prototype.onContextMenu = function (event) {
        event.preventDefault();
    };
    /**
     * Set mark.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.setMark = function () {
        if (!this.flagMark && !this.unknownMark) {
            this.flagMark = true;
            this.setCubeElementLabel();
            this.isOpen = true;
            this.game.refreshUI();
            return;
        }
        if (this.flagMark) {
            this.unknownMark = true;
            this.setCubeElementLabel();
            this.isOpen = true;
            this.game.refreshUI();
            return;
        }
        if (this.unknownMark) {
            this.unknownMark = false;
            this.setCubeElementLabel();
            this.isOpen = false;
            this.game.refreshUI();
        }
    };
    /**
     * Open surrounding safe cubes.
     *
     * @param {boolean} onlySurrounding
     * @memberof Cube
     */
    Cube.prototype.openSafeCubes = function (onlySurrounding) {
        if (onlySurrounding === void 0) { onlySurrounding = false; }
        var nearbyCubes = this.findNearbyCubes();
        nearbyCubes.forEach(function (cube) {
            // Skip mine cube, none cube, open cube.
            if (!cube || cube.isMine || cube.isOpen) {
                return;
            }
            // Open it.
            cube.isOpen = true;
            // Check nearby mines.
            var nearbyMines = cube.nearbyMines.length;
            nearbyMines < 1 && !onlySurrounding && cube.openSafeCubes();
        });
    };
    /**
     * Open all surrounding cubes.
     *
     * @memberof Cube
     */
    Cube.prototype.openSurroundingCubes = function () {
        var _this = this;
        var nearbyCubes = this.findNearbyCubes();
        nearbyCubes.some(function (cube) {
            if (!cube || cube.flagMark || cube.unknownMark) {
                return;
            }
            cube.isOpen = true;
            if (cube.isMine) {
                cube.setHitted();
                _this.game.setGameLose();
                return true;
            }
            if (cube.nearbyMines.length < 1) {
                cube.openSafeCubes();
            }
        });
    };
    /**
     * Append this cube to game.
     *
     * @memberof Cube
     */
    Cube.prototype.appendCubeToGame = function () {
        var cubeContainer = this.game.gamepad.querySelector('.cubes-ctnr');
        cubeContainer.appendChild(this.cubeElement);
    };
    /**
     * Destroy this cube.
     *
     * @memberof Cube
     */
    Cube.prototype.destroy = function () {
        this.cubeElement.remove();
    };
    return Cube;
}());
/**
 * Game class.
 * Define a game.
 *
 * @class Game
 */
var Game = (function () {
    function Game(_a) {
        var width = _a.width, height = _a.height, mines = _a.mines, gamepad = _a.gamepad;
        this.gamepad = null;
        this.gameIsOver = false;
        this.width = 9;
        this.height = 9;
        this.totalMines = 10;
        this._cubes = [];
        if (width * height < mines) {
            throw new Error('There are too many mines, reduce it to a vaild number.');
        }
        // Setup game.
        this.width = width;
        this.height = height;
        this.totalMines = mines;
        this.gamepad = typeof gamepad === 'string'
            ? document.querySelector(gamepad)
            : gamepad;
        // Initialize game.
        this.newGame();
    }
    Object.defineProperty(Game.prototype, "totalCubes", {
        get: function () {
            return this.width * this.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "minesToSolve", {
        /**
         * Mines count that identifies the rest mines to solve.
         * Totalmines - MinesIsFlagMarked
         *
         * @readonly
         * @memberof Game
         */
        get: function () {
            return this.totalMines - this.cubes.filter(function (item) { return item.flagMark; }).length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "unfoundMines", {
        /**
         * Get the count of unfound mines.
         *
         * @readonly
         * @memberof Game
         */
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gameCanBeOver", {
        /**
         * Check whether game can be over rightnow.
         *
         * @readonly
         * @memberof Game
         */
        get: function () {
            var openedCubes = this.cubes.filter(function (item) { return item.isOpen && !item.isMine; }).length;
            return openedCubes + this.totalMines === this.totalCubes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "cubes", {
        /**
         * Get all cubes.
         * This accessor is for external-usage only.
         *
         * @readonly
         *
         * @memberof Game
         */
        get: function () {
            return this._cubes;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Find some cube in this game.
     *
     * @param {any} x
     * @param {any} y
     * @returns {(Cube | null)}
     *
     * @memberof Game
     */
    Game.prototype.findCube = function (x, y) {
        var target = this.cubes.filter(function (item) { return item.x === x && item.y === y; });
        return target[0] || null;
    };
    /**
     * Create cubes for this game.
     *
     * @private
     * @memberof Game
     */
    Game.prototype.createCubes = function () {
        var width = this.width;
        var height = this.height;
        var total = width * height;
        // Create cubes.
        for (var i = 0; i < total; i++) {
            var x = i % width;
            var y = Math.floor(i / width);
            var newCube = new Cube({ x: x, y: y, isMine: false, game: this });
            this._cubes.push(newCube);
            newCube.appendCubeToGame();
        }
    };
    /**
     * Setup mines randomly.
     *
     * @private
     * @memberof Game
     */
    Game.prototype.setRandomMines = function () {
        var totalMines = this.totalMines;
        while (totalMines) {
            var mineIndex = Math.floor(Math.random() * this._cubes.length);
            var targetCube = this._cubes[mineIndex];
            if (!targetCube.isMine) {
                targetCube.isMine = true;
                totalMines--;
            }
        }
    };
    /**
     * Refresh interface.
     *
     * @private
     * @memberof Game
     */
    Game.prototype.refreshUI = function () {
        var gamepad = this.gamepad;
        // Refresh rest mines.
        gamepad.querySelector('.rest-mines').textContent = "Rest mines: " + this.minesToSolve;
    };
    Game.prototype.setGamepadSize = function () {
        var gamepad = this.gamepad;
        gamepad.style.width = CUBE_SIZE * this.width + 'px';
        gamepad.style.height = CUBE_SIZE * this.height + 'px';
    };
    /**
     * Release all cubes in gamepad.
     *
     * @private
     * @memberof Game
     */
    Game.prototype.releaseAllCubes = function () {
        this.cubes.forEach(function (item) { return item.destroy(); });
        this._cubes = [];
    };
    /**
     * Open all mine cubes.
     *
     * @memberof Game
     */
    Game.prototype.openMineCubes = function () {
        this.cubes.forEach(function (cube) {
            if (cube.isMine) {
                cube.isOpen = true;
                cube.setMineClassName();
            }
        });
    };
    /**
     * Open all cubes in this game.
     *
     * @memberof Game
     */
    Game.prototype.openAllCubes = function () {
        this.cubes.forEach(function (cube) {
            cube.isOpen = true;
            cube.flagMark = false;
            cube.unknownMark = false;
            if (cube.isMine) {
                cube.setMineClassName();
            }
        });
    };
    /**
     * Hide all cubes in this game.
     *
     * @memberof Game
     */
    Game.prototype.hideAllCubes = function () {
        this.cubes.forEach(function (item) {
            item.isOpen = false;
        });
    };
    /**
     * Game is over.
     *
     * @memberof Game
     */
    Game.prototype.setGameOver = function () {
        console.info('Game over.');
        this.gameIsOver = true;
    };
    /**
     * You win this game.
     *
     * @memberof Game
     */
    Game.prototype.setGameWin = function () {
        console.log('You win!');
        this.gamepad.querySelector('.rest-mines').textContent = "You win!";
        this.setGameOver();
        this.openAllCubes();
    };
    /**
     * Game over young man!
     *
     * @memberof Game
     */
    Game.prototype.setGameLose = function () {
        console.log('Game over young man!');
        this.gamepad.querySelector('.rest-mines').textContent = "Game over young man!";
        this.setGameOver();
        this.openMineCubes();
    };
    /**
     * Start new game.
     *
     * @memberof Game
     */
    Game.prototype.newGame = function () {
        this.releaseAllCubes();
        this.createCubes();
        this.setRandomMines();
        this.setGamepadSize();
        this.refreshUI();
    };
    return Game;
}());
//# sourceMappingURL=index.js.map