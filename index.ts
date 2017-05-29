/**
 * Miner By LancerComet at 17:39, 2017.05.27.
 * # Carry Your World #
 */

/** Define Cube Size in Visual. In pixel */
const CUBE_SIZE = 60

/**
 * Cube Class.
 * Define a cube object in game.
 * 
 * @class Cube
 */
class Cube {
  private game: Game = null
  private cubeElement: Element = null

  x: number = 0
  y: number = 0

  private leftMouseDown: boolean = false
  private rightMouseDown: boolean = false
  private stopAction: boolean = false

  private mouseDownEvent = null
  private mouseUpEvent = null
  private contextEvent = null

  private _isOpen = false
  get isOpen () {
    return this._isOpen
  }
  set isOpen (newVal) {
    const className = this.cubeElement.className

    // Normal case.
    if (!this.flagMark && !this.unknownMark) {
      // Set open class name.
      this.cubeElement.className = newVal
        ? className + (className.indexOf('open') < 0 ? ' open' : '')
        : className.replace(' open', '')

      // Set mine class name.
      if (this.isMine) {
        this.cubeElement.className = newVal
          ? className + ' mine'
          : className.replace(' mine', '')
      }

    // Mark setting case.
    } else {
      this.cubeElement.className = this.cubeElement.className.replace(/ (mine|mark)/g, '')
      this.cubeElement.className = newVal
        ? this.cubeElement.className + ' mark'
        : this.cubeElement.className.replace(' mark', '')
    }

    this._isOpen = newVal
    this.setCubeElementLabel()
  }

  private _flagMark = false
  get flagMark () {
    return this._flagMark
  }
  set flagMark (newVal) {
    this._flagMark = newVal
    if (newVal && this.unknownMark) {
      this.unknownMark = false
    }
  }

  private _unknownMark = false
  get unknownMark () {
    return this._unknownMark
  }
  set unknownMark (newVal) {
    this._unknownMark = newVal
    if (newVal && this.flagMark) {
      this.flagMark = false
    }
  }

  /**
   * Whether is a mine cube.
   * 
   * @type {boolean}
   * @memberof Cube
   */
  private _isMine = false
  get isMine () {
    return this._isMine
  }
  set isMine (newVal) {
    this._isMine = newVal
    this.setCubeElementLabel()
  }

  /**
   * Label of this cube.
   * 
   * @readonly
   * @type {string}
   * @memberof Cube
   */
  get label () : string {
    if (!this.isOpen) { return '' }
    if (this.flagMark) { return '❗' }
    if (this.unknownMark) { return '🐸' }
    if (this.isMine) { return '💣' }
    return (this.nearbyMines.length || '').toString()
  }

  /**
   * Get nearby mines cubes.
   * 
   * @readonly
   * @memberof Cube
   */
  get nearbyMines () {
    return this.findNearbyCubes()
      .filter(item => item && item.isMine)
  }

  /**
   * Set cube on-select status.
   * 
   * @param { boolean } newVal
   * @memberof Cube
   */
  set onSelect (newVal) {
    const className = this.cubeElement.className

    this.cubeElement.className = newVal
      ? className + (className.indexOf('on-select') > -1 ? '' : ' on-select')
      : className.replace(' on-select', '')
  }

  /**
   * Find all cubes nearby.
   * 
   * @returns {Cube[]} 
   * @memberof Cube
   */
  findNearbyCubes (): Cube[] {
    const nearByPosition = [
      [this.x - 1, this.y - 1], [this.x, this.y - 1], [this.x + 1, this.y - 1],
      [this.x - 1, this.y], [false, false], [this.x + 1, this.y],
      [this.x - 1, this.y + 1], [this.x, this.y + 1], [this.x + 1, this.y + 1]
    ]

    const nearByCubes = nearByPosition.map(position => this.game.findCube(position[0], position[1]))
    return nearByCubes
  }

  /**
   * Create HTML Element for this cube.
   * 
   * @private
   * @memberof Cube
   */
  private createCubeElement () {
    const element = document.createElement('div')
    element.className = 'mine-cube'
    element.style.width = CUBE_SIZE + 'px'
    element.style.height = CUBE_SIZE + 'px'
    element.style.lineHeight = CUBE_SIZE + 'px'

    this.mouseDownEvent = this.onMouseDown.bind(this)
    this.mouseUpEvent = this.onMouseUp.bind(this)
    this.contextEvent = this.onContextMenu.bind(this)
    element.addEventListener('mousedown', this.mouseDownEvent)
    element.addEventListener('mouseup', this.mouseUpEvent)
    element.addEventListener('contextmenu', this.contextEvent)

    this.cubeElement = element
  }

  /**
   * Set label for element of this cube.
   * 
   * @private
   * @memberof Cube
   */
  private setCubeElementLabel () {
    this.cubeElement.textContent = this.label
  }

  /**
   * Mouse down event handler.
   * 
   * @private
   * @param {Event} event 
   * 
   * @memberof Cube
   */
  private onMouseDown (event: MouseEvent) {
    event.preventDefault()    
    this.onSelect = true

    const button = event.button
    switch (button) {
      case 0:
        this.leftMouseDown = true
        break

      case 2:
        this.rightMouseDown = true
        break
    }

    if (this.leftMouseDown && this.rightMouseDown) {
      this.bothMousesDown()
    }
  }

  /**
   * Mouse up event handler.
   * 
   * @private
   * @param {any} event 
   * @memberof Cube
   */
  private onMouseUp (event: MouseEvent) {
    this.onSelect = false
    const button = event.button

    // Release preview area.
    this.setPreviewArea(false)

    switch (button) {
      // Left mouse.
      case 0:
        this.leftMouseDown = false
        this.leftMouseUp()
        if (!this.rightMouseDown) {
          this.stopAction = false
        }
        break

      // Right mouse.
      case 2:
        // Use a timer to prevent left mouseup event to be triggered.
        this.rightMouseDown = false
        this.rightMouseUp()        
        if (!this.leftMouseDown) {
          this.stopAction = false
        }
        break
    }
  }

  /**
   * Left mouse up event.
   * 
   * @private
   * @returns 
   * 
   * @memberof Cube
   */
  private leftMouseUp () {
    // Return when game is over or action is stopped.
    if (this.game.gameIsOver || this.stopAction || this.flagMark || this.unknownMark) { return }

    // Open this cube.
    this.isOpen = true

    // Hit this mine cube.
    if (this.isMine) {
      this.cubeElement.className += ' hit'
      this.game.openMineCubes()
      return this.game.setGameOver()
    }

    // Check and open nearby mines when there are no mine cubes surrounding.
    const nearbyMines = this.nearbyMines.length
    if (nearbyMines === 0) {
      this.openSurroundingCubes()
    }

    // Check if game can be over now.
    if (this.game.gameCanBeOver){
      this.game.setGameOver()
      this.game.openAllCubes()
    }
  }

  /**
   * Right mouse up event.
   * 
   * @private
   * 
   * @memberof Cube
   */
  private rightMouseUp () {
    if (this.stopAction || (this.isOpen && !this.flagMark && !this.unknownMark)) { return }
    this.setMark()
  }

  /**
   * Both mouses click.
   * 
   * @private
   * @memberof Cube
   */
  private bothMousesDown () {
    this.stopAction = true
    this.setPreviewArea(true)
  }

  /**
   * Set preview area status.
   * 
   * @private
   * @param {boolean} [status=false] 
   * 
   * @memberof Cube
   */
  private setPreviewArea (status = false) {
    this.findNearbyCubes().forEach(item => {
      if (item) { item.onSelect = status }
    })
  }
 
  /**
   * Context menu event handler.
   * Only for preventing default behaviors.
   * 
   * @private
   * @param {Event} event 
   * 
   * @memberof Cube
   */
  private onContextMenu (event: Event) {
    event.preventDefault()
  }

  /**
   * Set mark.
   * 
   * @private
   * @memberof Cube
   */
  private setMark () {
    if (!this.flagMark && !this.unknownMark) {
      this.flagMark = true
      this.setCubeElementLabel()
      this.isOpen = true
      this.game.refreshUI()
      return 
    }
    
    if (this.flagMark) {
      this.unknownMark = true
      this.setCubeElementLabel()      
      this.isOpen = true    
      this.game.refreshUI()        
      return
    }
    
    if (this.unknownMark) {
      this.unknownMark = false
      this.setCubeElementLabel()
      this.isOpen = false
      this.game.refreshUI()      
    }
  }

  /**
   * Open surrounding cubes.
   * Triggered when this cube is a blank one.
   * 
   * @memberof Cube
   */
  openSurroundingCubes () {
    const nearbyCubes = this.findNearbyCubes()
    nearbyCubes.forEach(cube => {
      // Skip mine cube, none cube, open cube.
      if (!cube || cube.isMine || cube.isOpen) { return }

      // Open it.
      cube.isOpen = true

      // Check nearby mines.
      const nearbyMines = cube.nearbyMines.length
      nearbyMines < 1 && cube.openSurroundingCubes()
    })
  }

  /**
   * Append this cube to game.
   * 
   * @memberof Cube
   */
  appendCubeToGame () {
    const cubeContainer = this.game.gamepad.querySelector('.cubes-ctnr')
    cubeContainer.appendChild(this.cubeElement)
  }

  /**
   * Destroy this cube.
   * 
   * @memberof Cube
   */
  destroy () {
    this.cubeElement.remove()
  }

  constructor ({ x, y, isMine, game }) {
    // Setup basic data.
    this.game = game
    this.x = x
    this.y = y

    // Create cube element.
    this.createCubeElement()

    // Mark whether it is a mine cube.
    this.isMine = Boolean(isMine)
  }
}


/**
 * Game class.
 * Define a game.
 * 
 * @class Game
 */
class Game {
  gamepad: HTMLElement = null
  gameIsOver = false  
  
  width: number = 9
  height: number = 9
  totalMines: number = 10

  get totalCubes () {
    return this.width * this.height
  }

  /**
   * Mines count that identifies the rest mines to solve.
   * Totalmines - MinesIsFlagMarked
   * 
   * @readonly
   * @memberof Game
   */
  get minesToSolve () {
    return this.totalMines - this.cubes.filter(item => item.flagMark).length
  }

  /**
   * Get the count of unfound mines.
   * 
   * @readonly
   * @memberof Game
   */
  get unfoundMines () {
    return false
  }

  /**
   * Check whether game can be over rightnow.
   * 
   * @readonly
   * @memberof Game
   */
  get gameCanBeOver () {
    const openedCubes = this.cubes.filter(item => item.isOpen && !item.isMine).length
    return openedCubes + this.totalMines === this.totalCubes
  }

  private _cubes: Cube[] = []

  /**
   * Get all cubes.
   * This accessor is for external-usage only.
   * 
   * @readonly
   * 
   * @memberof Game
   */
  get cubes () {
    return this._cubes
  }

  /**
   * Find some cube in this game.
   * 
   * @param {any} x 
   * @param {any} y 
   * @returns {(Cube | null)} 
   * 
   * @memberof Game
   */
  findCube (x, y): Cube | null {
    const target = this.cubes.filter(item => item.x === x && item.y === y)
    return target[0] || null
  }

  /**
   * Create cubes for this game.
   * 
   * @private
   * @memberof Game
   */
  private createCubes () {
    const width = this.width
    const height = this.height
    const total = width * height

    // Create cubes.
    for (let i = 0; i < total; i++) {
      const x = i % width
      const y = Math.floor(i / width)
      
      const newCube = new Cube({ x, y, isMine: false, game: this })
      this._cubes.push(newCube)
      newCube.appendCubeToGame()
    }
  }

  /**
   * Setup mines randomly.
   * 
   * @private
   * @memberof Game
   */
  private setRandomMines () {
    let totalMines = this.totalMines
    while (totalMines) {
      const mineIndex = Math.floor(Math.random() * this._cubes.length)
      const targetCube = this._cubes[mineIndex]
      if (!targetCube.isMine) {
        targetCube.isMine = true
        totalMines--
      }
    }
  }

  /**
   * Refresh interface.
   * 
   * @private
   * @memberof Game
   */
  refreshUI () {
    const gamepad = this.gamepad
    
    // Refresh rest mines.
    gamepad.querySelector('.rest-mines').textContent = `Rest mine: ${this.minesToSolve}`
  }

  private setGamepadSize () {
    const gamepad = this.gamepad
    gamepad.style.width = CUBE_SIZE * this.width + 'px'
    gamepad.style.height = CUBE_SIZE * this.height + 'px'
  }

  /**
   * Release all cubes in gamepad.
   * 
   * @private
   * @memberof Game
   */
  private releaseAllCubes () {
    this.cubes.forEach(item => item.destroy())
    this._cubes = []
  }  

  /**
   * Open all mine cubes.
   * 
   * @memberof Game
   */
  openMineCubes () {
    this.cubes.forEach(item => {
      if (item.isMine) {
        item.isOpen = true
      }
    })
  }

  /**
   * Open all cubes in this game.
   * 
   * @memberof Game
   */
  openAllCubes () {
    this.cubes.forEach(item => {
      item.isOpen = true
    })
  }

  /**
   * Hide all cubes in this game.
   * 
   * @memberof Game
   */
  hideAllCubes () {
    this.cubes.forEach(item => {
      item.isOpen = false
    })
  }

  /**
   * Game over young man!
   * 
   * @memberof Game
   */
  setGameOver () {
    console.info('Game over.')
    this.gameIsOver = true
  }

  /**
   * Start new game.
   * 
   * @memberof Game
   */
  newGame () {
    this.releaseAllCubes()
    this.createCubes()
    this.setRandomMines()
    this.setGamepadSize()
    this.refreshUI()
  }

  constructor ({ width, height, mines, gamepad }) {
    if (width * height < mines) {
      throw new Error('There are too many mines, reduce it to a vaild number.')
    }

    // Setup game.
    this.width = width
    this.height = height
    this.totalMines = mines
    this.gamepad = typeof gamepad === 'string'
      ? <HTMLElement> document.querySelector(<string> gamepad)
      : <HTMLElement> gamepad

    // Initialize game.
    this.newGame()
  }
}
