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
        this._isOpen = false;
        this._flagMark = false;
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
            this.cubeElement.className = newVal
                ? className + (className.indexOf('open') < 0 ? ' open' : '')
                : className.replace(' open', '');
            if (this.isMine) {
                this.cubeElement.className = newVal
                    ? className + ' mine'
                    : className.replace(' mine', '');
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
            this.unknownMark = false;
            this._flagMark = newVal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Cube.prototype, "unknownMark", {
        get: function () {
            return this._unknownMark;
        },
        set: function (newVal) {
            this.flagMark = false;
            this._unknownMark = newVal;
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
            return this.isMine
                ? 'Wow'
                : (this.nearbyMines.length || '').toString();
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
        element.addEventListener('mousedown', this.onMouseDown.bind(this));
        element.addEventListener('mouseup', this.onMouseUp.bind(this));
        element.addEventListener('contextmenu', this.onContextMenu.bind(this));
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
            this.bothMouseClick();
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
        if (this.game.gameIsOver || this.stopAction) {
            return;
        }
        // Open this cube.
        this.isOpen = true;
        // Hit this mine cube.
        if (this.isMine) {
            this.cubeElement.className += ' hit';
            this.game.openMineCubes();
            return this.game.setGameOver();
        }
        // Check and open nearby mines when there are no mine cubes surrounding.
        var nearbyMines = this.nearbyMines.length;
        if (nearbyMines === 0) {
            this.openSurroundingCubes();
        }
        // Check if game can be over now.
        if (this.game.gameCanBeOver) {
            this.game.setGameOver();
            this.game.openAllCubes();
        }
    };
    /**
     * Right mouse up event.
     *
     * @private
     *
     * @memberof Cube
     */
    Cube.prototype.rightMouseUp = function () {
        if (this.stopAction) {
            return;
        }
    };
    /**
     * Both mouses click.
     *
     * @private
     * @memberof Cube
     */
    Cube.prototype.bothMouseClick = function () {
        this.stopAction = true;
        this.setPreviewArea(true);
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
            if (item) {
                item.onSelect = status;
            }
        });
    };
    /**
     * Context menu event handler.
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
     * Open surrounding cubes.
     * Triggered when this cube is a blank one.
     *
     * @memberof Cube
     */
    Cube.prototype.openSurroundingCubes = function () {
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
            nearbyMines < 1 && cube.openSurroundingCubes();
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
        this.createCubes();
        this.setRandomMines();
        this.setGamepadSize();
        this.refreshUI();
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
        gamepad.querySelector('.rest-mines').textContent = "Rest mine: " + this.minesToSolve;
    };
    Game.prototype.setGamepadSize = function () {
        var gamepad = this.gamepad;
        gamepad.style.width = CUBE_SIZE * this.width + 'px';
        gamepad.style.height = CUBE_SIZE * this.height + 'px';
    };
    /**
     * Open all mine cubes.
     *
     * @memberof Game
     */
    Game.prototype.openMineCubes = function () {
        this.cubes.forEach(function (item) {
            if (item.isMine) {
                item.isOpen = true;
            }
        });
    };
    /**
     * Open all cubes in this game.
     *
     * @memberof Game
     */
    Game.prototype.openAllCubes = function () {
        this.cubes.forEach(function (item) {
            item.isOpen = true;
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
     * Game over young man!
     *
     * @memberof Game
     */
    Game.prototype.setGameOver = function () {
        console.info('Game over.');
        this.gameIsOver = true;
    };
    return Game;
}());
//# sourceMappingURL=index.js.map