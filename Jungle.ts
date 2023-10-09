import { Coordinate } from "./Coordinate"
import { ISnapshot, SCORPION, SPIKE } from "./Types"
import { GenerateJungle } from "./generateJungle"
import { showTable } from "./utils"

export class Jungle {
  private score = 0
  private table: number[][]
  private currentPos: Coordinate
  private turns: number
  private columns: number = 7 
  private rows: number = 7 
  private snapshots: ISnapshot[] = []
  private gemsPool: number[]  // In engine, implementation with stage
  private lives: number
  public static goal: number[]

  constructor (table: number[][], currentPos: Coordinate, turns: number, lives: number) {
    this.table = table
    this.currentPos = currentPos
    this.turns = turns
    this.gemsPool = GenerateJungle.generateGemsPool()
    this.lives = lives
    Jungle.goal = this.generateTreasuresGoal()
  }

  getScore () { return this.score }
  getTable () { return this.table }
  getCurrentPos () { return this.currentPos }
  getSnapshots () { return this.snapshots }

  setScore (score: number) {this.score = score }
  setTable (table: number[][]) {this.table = table }
  setCurrentPos (currentPos: Coordinate) {this.currentPos = currentPos }
  setSnapshots (snapshots: ISnapshot[]) { this.snapshots = snapshots }
  getTableSerialized () {
      return JSON.parse(JSON.stringify(this.table))
  }
  
  public getCell (coordinate: Coordinate) {
    return this.table[coordinate.getY()][coordinate.getX()]
  }

  public putInCell (coordinate: Coordinate, cell: number) {
    this.table[coordinate.getY()][coordinate.getX()] = cell
  }

  public static displayTreasuresGoal(): void {
    console.log("GOALS")
    for (let i = 0; i < this.goal.length; i++) {
      if (i === 0) {
        console.log(`${this.goal[i]} rubies`)
      } else if (i === 1) {
        console.log(`${this.goal[i]} diamonds`)
      } else {
        console.log(`${this.goal[i]} emeralds`)
      }
      
    }
  }
  
  public generateMove(coordinates: Coordinate[]) {
    let chainLength = 0
    const obstacleQueue: Coordinate[] = []
    const obstacleValues: number[] = []
    this.table[this.currentPos.getY()][this.currentPos.getX()] = 6
    let length = coordinates.length
    const chainValues: number[] = []
    // making a move.
    for (let i = 0; i < length; i++) {
      console.log(`Lives in: ${this.lives}`)
      chainLength = this.calculateChainLength(coordinates[i], chainLength, chainValues)
      console.log(`chain length bef: ${chainLength}`)
      this.isObstacle(obstacleValues, obstacleQueue, coordinates, i)
      if (i > 0 && i <= length - 1) {
        this.playerOnCellsInteraction(coordinates, obstacleQueue, chainValues, obstacleValues, i)
      } 
      this.snapshots.push({
        table: this.getTableSerialized(),
        match: false,
        prize: undefined
      })
    }

    this.playerOnCellsInteraction(coordinates, obstacleQueue, chainValues, obstacleValues, length)
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
    console.log(`Lives out: ${this.lives}`)
    this.turns--
    this.generateScorpionAttack()
    this.reallocateGems() 
    this.restoreEmptySlots()
  }

  private generateTreasuresGoal(): number[] {
    const op1 = [30, 30, 10] // Ruby, Diamond, Emerald
    const op2 = [10, 30, 30]
    const op3 = [30, 10, 30]
    const index = Math.floor(Math.random() * 2)
    if (index === 0) {
      return op1
    } else if (index === 1) {
      return op2
    } else {
      return op3
    }
  }
  
  private collectTreasure(treasure: number): void {
    const RUBY = 1
    const DIAMOND = 2
    if (treasure === RUBY) {
      if (Jungle.goal[0] > 0) {
        Jungle.goal[0] -= 1
      }
    } else if (treasure === DIAMOND) {
      if (Jungle.goal[1] > 0) {
        Jungle.goal[1] -= 1
      }
    } else {
      if (Jungle.goal[2] > 0) {
        Jungle.goal[2] -= 1
      }
    }
  }

  // Check if the current cell is an obstacle, if so it adds a certain number to add up 90, otherwise 90 will be added.
  private isObstacle(obstacleValues: number[], obstacleQueue: Coordinate[], coordinates: Coordinate[], i: number) {
    let current = this.table[coordinates[i].getY()][coordinates[i].getX()]
      if (SPIKE.includes(current)) {
        obstacleValues.push(this.table[coordinates[i].getY()][coordinates[i].getX()])        
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 50 // to add up 90. 
        obstacleQueue.push(new Coordinate(coordinates[i].getX(), coordinates[i].getY()))
      
      } else if (SCORPION.includes(current)) {
        obstacleValues.push(this.table[coordinates[i].getY()][coordinates[i].getX()])        
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 40 // to add up 90. 
        obstacleQueue.push(new Coordinate(coordinates[i].getX(), coordinates[i].getY()))
      
      } else {
        this.collectTreasure(current)
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 90
      }
  }

  // it checks if the player is adjacent to a scorpion.
  private generateScorpionAttack() {
    let backCell: number, leftCell: number, rightCell: number, frontCell: number
    backCell = leftCell = rightCell = frontCell = 0
    console.log(`current pos${this.currentPos.getXY()}`);
    if (this.currentPos.getY() - 1 >= 0) {
      backCell = this.table[this.currentPos.getY() - 1][(this.currentPos.getX())]
    }
    if (this.currentPos.getX() - 1 >= 0) {
      leftCell = this.table[(this.currentPos.getY())][this.currentPos.getX() - 1]
    }
    if (this.currentPos.getX() + 1 < this.columns) {
      rightCell = this.table[(this.currentPos.getY())][this.currentPos.getX()  + 1]
    }
    if (this.currentPos.getY() + 1 < this.rows) {
      frontCell = this.table[this.currentPos.getY() + 1][(this.currentPos.getX())]
    }
    this.attackPlayer(backCell, leftCell, rightCell, frontCell)
    console.log(`Lives out: ${this.lives}`)
  }

  private attackPlayer(backCell: number, leftCell: number, rightCell: number, frontCell: number) {
    if (SCORPION.includes(backCell)) {
      this.lives -= 1
    }
    if (SCORPION.includes(leftCell)) {
      this.lives -= 1
    }
    if (SCORPION.includes(rightCell)) {
      this.lives -= 1
    }
    if (SCORPION.includes(frontCell)) {
      this.lives -= 1
    }
  }
  // It generates all the functionality related to the player stepping on traps, normal cells etc.
  private playerOnCellsInteraction(
    coordinates: Coordinate[],
    obstacleQueue: Coordinate[],
    chainValues: number[],
    obstacleValues: number[],
    index: number,
  ) {
    let greater = false
    let obstacleValue: number | undefined
    let chainValue: number | undefined
    let currentTreasure: number
    if (obstacleQueue.length !== 0 && chainValues.length !== 0) {
      if (obstacleQueue[0].getX() === this.currentPos.getX() && obstacleQueue[0].getY() === this.currentPos.getY()) {
        obstacleValue = obstacleValues.shift()
        chainValue = chainValues.shift()
        greater = this.chainWasGreater(chainValue, obstacleValue)
        if (obstacleValue !== undefined) {
          this.updateCurrentPos(coordinates[index - 1].getX(), coordinates[index - 1].getY(), true, greater, obstacleValue) // subtract 50 to get the actual value.
        }
        greater = false
        obstacleQueue.shift()
      } else {
        this.table[coordinates[index - 1].getY()][coordinates[index - 1].getX()] = 6  
        this.updateCurrentPos(coordinates[index - 1].getX(), coordinates[index - 1].getY(), false, false, 1) // the last parameter in this case does not matter.
      }
    } else {
      this.table[coordinates[index - 1].getY()][coordinates[index - 1].getX()] = 6
      this.updateCurrentPos(coordinates[index - 1].getX(), coordinates[index - 1].getY(), false, false, 1)  // the last parameter in this case does not matter.
    } 
  }

  // checks whether the player could break the obstacle or not.
  private chainWasGreater(chainValue: number | undefined, obstacle: number | undefined) {
    if (chainValue === undefined || obstacle === undefined) {
      return false
    }
    if (chainValue >= obstacle) {
      return true
    }
    return false
  }


  private calculateChainLength(coordinates: Coordinate, chain: number, chainValues: number[]) {
    let currentCell: number = this.getCell(coordinates)
    if (SPIKE.includes(currentCell)) {
      if (chain >= currentCell % 10) {
        chainValues.push(chain + 40)
      } else {
        chainValues.push(-1) // it was not greater.
        this.lives -= 1
      }
    } else if (SCORPION.includes(currentCell)) {
        if (chain >= currentCell % 10) {
          chainValues.push(chain + 50)
        } else {
          chainValues.push(-1) // it was not greater.
          this.lives -= 1
        }
    }
    chain += 1
    return chain
  }

  public validateInput (move: string) {
    const inputs = move.split(":")
    const coordinates: Coordinate[] = []
    let actualCoord = this.currentPos
    let typeCell = undefined

    for (let i = 0;i < inputs.length;i++) {
      const inputSplit = inputs[i].split("-")
      const coordinate = new Coordinate(parseInt(inputSplit[0]), parseInt(inputSplit[1]))
      const diferenceX = coordinate.getX() - actualCoord.getX()
      const diferenceY = coordinate.getY() - actualCoord.getY()
      if (
        typeCell === undefined
        && 
        (coordinate.getX() >= 0 && coordinate.getX() < this.rows)
        &&
        (coordinate.getY() >= 0 && coordinate.getY() < this.columns)
      ) {
        typeCell = this.getCell(coordinate)
        actualCoord = coordinate
        coordinates.push(coordinate)
        if (SPIKE.includes(typeCell)) {
          typeCell = undefined
        }
      } else if (
        (coordinate.getX() >= 0 && coordinate.getX() < this.rows)
        &&
        (coordinate.getY() >= 0 && coordinate.getY() < this.columns)
        && 
        (diferenceX <= 1 && diferenceX >= -1)
        &&
        (diferenceY <= 1 && diferenceY >= -1)
        &&
        !(diferenceX === 0 && diferenceY === 0)
        &&
        (typeCell === this.getCell(coordinate) || (this.getCell(coordinate) > 10 && i < inputs.length - 1))
      ) {
        coordinates.push(coordinate)
        actualCoord = coordinate
      } else {
        return undefined
      }
    }
    return coordinates
  }
  private updateCurrentPos(x: number, y: number, trap: boolean, chainWasGreater: boolean, obstacleValue: number): void {
    if (trap) {
      // check if the player can break the trap.
      if (chainWasGreater) {
        this.table[this.currentPos.getY()][this.currentPos.getX()] = 0
      }
      else {
        this.table[this.currentPos.getY()][this.currentPos.getX()] = obstacleValue
      }
      this.table[y][x] = 6 // update current position.
    }
    else {
      this.table[this.currentPos.getY()][this.currentPos.getX()] = 0
    }
    this.currentPos.setX(x)
    this.currentPos.setY(y)
  }
  
  private reallocateGems(): void {
    const gemMoved = 80
    const queue: Coordinate[] = []
    for (let c = 0; c < this.columns; c++) {
      for (let r = 0; r < this.rows; r++) {
        let current = this.table[r][c]
        if (current === 0) {
          queue.push(new Coordinate(r, c))
        } else if (current !== 6 && !SPIKE.includes(current) && !(queue.length === 0) && current !== 0) {
          let coord: Coordinate | undefined = queue.shift()
          if (coord !== undefined) {
            this.table[coord.getX()][coord.getY()] = current + gemMoved
            this.table[r][c] = 0
            queue.push(new Coordinate(r, c))
          }
        }
      }
      queue.length = 0
    }
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
    for (const y in this.table) {
      for (const x in this.table[y]) {
        if (this.table[y][x] > 80) {
          this.table[y][x] %= (this.table[y][x] < 800 ? 80 : 800)
        }
      }
    }
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
  }


  private extractGems (amount: number) {
    const gems = this.gemsPool.splice(0, amount)
    this.gemsPool = this.gemsPool.concat(gems)
    return gems
  }

  private restoreEmptySlots () {
    const coordinates: Coordinate[] = []
    for (const y in this.table) {
      for (const x in this.table[y]) {
        if (this.table[y][x] === 0) {
          coordinates.push(new Coordinate(parseInt(x), parseInt(y)))
        }
      }
    }
    const elements = this.extractGems(coordinates.length)
    for (const i in coordinates) {
      this.table[coordinates[i].getY()][coordinates[i].getX()] = elements[i] < 10 ? elements[i] + 80 : elements[i] + 800
    }
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
    for (const i in coordinates) {
      const currentCell = this.getCell(coordinates[i])
      this.table[coordinates[i].getY()][coordinates[i].getX()] = currentCell > 100 ? currentCell % 800 : currentCell % 80
    }
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
  }

}
