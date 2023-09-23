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
    this.table[this.currentPos.getY()][this.currentPos.getX()] = 6
    let length = coordinates.length
    let trapCoord: Coordinate = new Coordinate(-1, -1)
    // making a move.
    for (let i = 0; i < length; i++) {
      chainLength = this.calculateChainLength(coordinates[i], chainLength)
      let current = this.table[coordinates[i].getY()][coordinates[i].getX()]
      if (SPIKE.includes(current)) {
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 50 // to add up 90. 
        trapCoord = new Coordinate(coordinates[i].getX(), coordinates[i].getY())
      } else {
        this.table[coordinates[i].getY()][coordinates[i].getX()] += 90
      }
      if (i > 0 && i <= length - 1) {
        this.table[coordinates[i - 1].getY()][coordinates[i - 1].getX()] = 6
        console.log(`trapCoord ${trapCoord.getXY()} and currePos ${this.currentPos.getXY()}`);
        
        if (trapCoord.getX() === this.currentPos.getX() && trapCoord.getY() === this.currentPos.getY()) {
          console.log('pepe trap');
          this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY(), true)
        }
        else {
          console.log('pepe no trap');
          this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY(), false)
        } 
      } 
      this.snapshots.push({
        table: this.getTableSerialized(),
        match: false,
        prize: undefined
      })
      console.log(`Trap coordinates ${trapCoord.getXY()}`);
      
    }
    console.log(`trapCoord ${trapCoord.getXY()} and currePos ${this.currentPos.getXY()}`);
    this.table[coordinates[length - 1].getY()][coordinates[length - 1].getX()] = 6
    if (trapCoord.getX() === this.currentPos.getX() && trapCoord.getY() === this.currentPos.getY()) {
      this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY(), true)
    } else {
      this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY(), false)
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

  private calculateChainLength(coordinates: Coordinate, chain: number) {
    let currentCell: number = this.getCell(coordinates)
    
    if (!SPIKE.includes(currentCell)) {
      chain += 1
      return chain
    }
    if (chain + 40 >= currentCell) {
      chain -= currentCell - 40
      return chain
    }
    this.lives -= 1
    return 0
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
  private updateCurrentPos(x: number, y: number, trap: boolean): void {
    console.log(` bef current pos ${this.currentPos.getXY()}`);
    if (trap)
      this.table[this.currentPos.getY()][this.currentPos.getX()] = 20
    else {
      this.table[this.currentPos.getY()][this.currentPos.getX()] = 0
      this.currentPos.setX(x)
      this.currentPos.setY(y)
    }
    console.log(` aft current pos ${this.currentPos.getXY()}`);
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