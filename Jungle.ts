import { Coordinate } from "./Coordinate"
import { ISnapshot, SPIKE } from "./Types"
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

  constructor (table: number[][], currentPos: Coordinate, turns: number, lives: number) {
    this.table = table
    this.currentPos = currentPos
    this.turns = turns
    this.gemsPool = GenerateJungle.generateGemsPool()
    this.lives = lives
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
  
  public generateMove(coordinates: Coordinate[]) {
    let chainLength = 0
    let result = 0
    let chainWasGreater: boolean | undefined = false
    const trapQueue: Coordinate[] = []
    const trapValues: number[] = []
    this.table[this.currentPos.getY()][this.currentPos.getX()] = 6
    let length = coordinates.length
    let trapCoord: Coordinate = new Coordinate(-1, -1)
    let trapValue: number | undefined
    let trapResults: boolean[] = []
    
    // making a move.
    for (let i = 0; i < length; i++) {
      let result = this.calculateChainLength(coordinates[i], chainLength)
      chainLength = result.newChain
      trapResults.push(result.chainWasGreater) // push result.
      console.log('Trap results: ', trapResults)
      console.log(`Chain length: ${chainLength}`);
      let current = this.table[coordinates[i].getY()][coordinates[i].getX()]
      if (SPIKE.includes(current)) {
        trapValues.push(this.table[coordinates[i].getY()][coordinates[i].getX()])
        console.log('Trap Values: ', trapValues);
        
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 50 // to add up 90. 
        trapQueue.push(new Coordinate(coordinates[i].getX(), coordinates[i].getY()))
      } else {
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 90
      }
      if (i > 0 && i <= length - 1) {
        if (trapQueue.length !== 0 && trapResults.length !== 0) {
          if (trapQueue[0].getX() === this.currentPos.getX() && trapQueue[0].getY() === this.currentPos.getY()) {
            trapValue = trapValues.shift()
            console.log('Trap values after shifting', trapValues);
            if (trapResults.includes(true)) {
              chainWasGreater = true
              trapResults = trapResults.filter((value) => value === true)
              console.log('Trap results after cleaning it: ', trapResults);
            }
            console.log(`Trap value: ${trapValue} Trap result: ${chainWasGreater}`)
            if (trapValue !== undefined && chainWasGreater !== undefined) {
              console.log('pepe in')
              this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY(), true, chainWasGreater, trapValue) // subtract 50 to get the actual value.
            }
            chainWasGreater = false
            trapQueue.shift()
            trapResults.shift()
          } else {
            this.table[coordinates[i - 1].getY()][coordinates[i - 1].getX()] = 6  
            this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY(), false, false, 1) // the last parameter in this case does not matter.
          }
        } else {
          this.table[coordinates[i - 1].getY()][coordinates[i - 1].getX()] = 6
          this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY(), false, false, 1)  // the last parameter in this case does not matter.
        } 
      } 
      this.snapshots.push({
        table: this.getTableSerialized(),
        match: false,
        prize: undefined
      })
    }
    console.log(`Chain length: ${chainWasGreater}`);
    if (trapQueue.length !== 0) {
      if (trapQueue[0].getX() === this.currentPos.getX() && trapQueue[0].getY() === this.currentPos.getY()) {
        console.log('Trap results: ', trapResults)
        trapValue = trapValues.shift()
        console.log('Trap values after shifting', trapValues);
        if (trapResults.includes(true)) {
          chainWasGreater = true
          trapResults = trapResults.filter((value) => value === true)
          console.log('Trap results after cleaning it: ', trapResults);
        }
        console.log(`Trap value: ${trapValue} Trap result: ${chainWasGreater}`)
        if (trapValue !== undefined && chainWasGreater !== undefined) {
          this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY(), true, chainWasGreater, trapValue)
        }
        chainWasGreater = false
        trapQueue.shift()
        trapResults.shift()
      } else {
        this.table[coordinates[length - 1].getY()][coordinates[length - 1].getX()] = 6
        this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY(), false, false, 1)  // the last parameter in this case does not matter.
      }
    } else {
      this.table[coordinates[length - 1].getY()][coordinates[length - 1].getX()] = 6
      this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY(), false, false, 1)  // the last parameter in this case does not matter.
    } 
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
    this.turns--
    this.reallocateGems() 
    this.restoreEmptySlots()
  }

  private resizingArray(traps: boolean[]): boolean[] {
    let length = 0
    let found = false
    while (!found) {
      if (traps.at(length) === true) {
        found = true
      } else {
        length++
      }
    }
    const resizedArray = traps.slice(length + 1)
    return resizedArray
  }

  private calculateChainLength(coordinates: Coordinate, chain: number) {
    let currentCell: number = this.getCell(coordinates)
    let chainWasGreater: boolean = false;
    
    if (!SPIKE.includes(currentCell)) {
      chain += 1
    } else if (chain + 40 >= currentCell) { // check if the player's chain is greater than the trap's value.
      chain -= currentCell - 40
      chainWasGreater = true
    } else {
      this.lives -= 1
      chain = 0
    }
    return {newChain: chain, chainWasGreater}
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
  private updateCurrentPos(x: number, y: number, trap: boolean, chainWasGreater: boolean, trapValue: number): void {
    console.log('is trap?', trap);
    console.log('chain value:', chainWasGreater);
    
    
    if (trap) {
      // check if the player can break the trap.
      if (chainWasGreater) {
        console.log('Trap value to be replaced by -1');
        this.table[this.currentPos.getY()][this.currentPos.getX()] = -1
      }
      else {
        console.log('Trap value to replaced by the trap value is: ', trapValue);
        this.table[this.currentPos.getY()][this.currentPos.getX()] = trapValue
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
