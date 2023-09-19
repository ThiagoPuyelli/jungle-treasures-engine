import { Coordinate } from "./Coordinate"
import { ISnapshot, SPIKE } from "./Types"
import { GenerateJungle } from "./generateJungle"
import { showTable } from "./utils"

export class Jungle {
  private score = 0
  private table: number[][]
  private currentPos: Coordinate
  private turns: number
  private snapshots: ISnapshot[] = []
  private gemsPool: number[]  // In engine, implementation with stage

  constructor (table: number[][], currentPos: Coordinate, turns: number) {
    this.table = table
    this.currentPos = currentPos
    this.turns = turns
    this.gemsPool = GenerateJungle.generateGemsPool()
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
    return this.table[coordinate.getX()][coordinate.getY()]
  }
  
  public generateMove(coordinates: Coordinate[]) {
    this.table[this.currentPos.getX()][this.currentPos.getY()] = 6
    let length = coordinates.length
    // making a move.
    for (let i = 0; i < length; i++) {
        this.table[coordinates[i].getX()][coordinates[i].getY()] += 90
      
      if (i > 0 && i <= length - 1) {
        this.table[coordinates[i - 1].getX()][coordinates[i - 1].getY()] = 6
        this.updateCurrentPos(coordinates[i - 1].getX(), coordinates[i - 1].getY())
      } 
      this.snapshots.push({
        table: this.getTableSerialized(),
        match: false,
        prize: undefined
      })
    }
    this.table[coordinates[length - 1].getX()][coordinates[length - 1].getY()] = 6
    this.updateCurrentPos(coordinates[length - 1].getX(), coordinates[length - 1].getY())
    this.snapshots.push({
      table: this.getTableSerialized(),
      match: false,
      prize: undefined
    })
    this.turns--
    this.reallocateGems() 
    this.restoreEmptySlots()
  }

  public validateInput (move: string) {
    const inputs = move.split(":")
    const coordinates: Coordinate[] = []
    let actualCoord = this.currentPos
    let typeCell

    for (let i = 0;i < inputs.length;i++) {
      const inputSplit = inputs[i].split("-")
      const coordinate = new Coordinate(parseInt(inputSplit[0]), parseInt(inputSplit[1]))
      const diferenceX = coordinate.getX() - actualCoord.getX()
      const diferenceY = coordinate.getY() - actualCoord.getY()
      if (
        i === 0 
        && 
        (coordinate.getX() >= 0 && coordinate.getX() <= 6)
        &&
        (coordinate.getY() >= 0 && coordinate.getY() <= 6)
      ) {
        typeCell = this.getCell(coordinate)
        if (typeCell === 4) {
          return undefined
        }
      }

      if (
        (coordinate.getX() >= 0 && coordinate.getX() <= 6)
        &&
        (coordinate.getY() >= 0 && coordinate.getY() <= 6)
        && 
        (diferenceX <= 1 && diferenceX >= -1)
        &&
        (diferenceY <= 1 && diferenceY >= -1)
        &&
        !(diferenceX === 0 && diferenceY === 0)
        &&
        typeCell === this.getCell(coordinate)
      ) {
        coordinates.push(coordinate)
        actualCoord = coordinate
      } else {
        return undefined
      }
    }
    return coordinates
  }
  private updateCurrentPos(x: number, y: number): void {
    this.table[this.currentPos.getX()][this.currentPos.getY()] = 0
    this.currentPos.setX(x)
    this.currentPos.setY(y)
  }
  
  // It takes a player's move and it reallocates the gems on their new place.
  private reallocateGems(): void {
    let needToMove = false
    const row = 7
    const column = 7
    const gemMoved = 80
    let amountOfZeros = 0
    let temp: Coordinate = new Coordinate(0, 0)
    for (let c = 0; c < column; c++) {
      for (let r = 1; r < row; r++) {
        let current = this.table[r][c]
        if (!SPIKE.includes(current) && current !== 0 && current !== 6) {
          if (this.table[r - 1][c] === 0) {
            this.table[r - 1][c] = current + gemMoved
            this.table[r][c] = 0

          } else if (SPIKE.includes(this.table[r - 1][c]) && needToMove) {
            this.table[temp.getX()][temp.getY()] = current + gemMoved
            this.table[r][c] = 0
            needToMove = false
          }
        
        } else if (SPIKE.includes(current) && this.table[r - 1][c] === 0) {
          needToMove = true
          temp.setX(r - 1)
          temp.setY(c)
        }
      }
      needToMove = false // reset when changing columns
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