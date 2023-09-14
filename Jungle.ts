import { Coordinate } from "./Coordinate"
import { ISnapshot } from "./Types"
import { showTable } from "./utils"

export class Jungle {
  private score = 0
  private table: number[][]
  private currentPos: Coordinate
  private turns: number
  private snapshots: ISnapshot[] = []

  constructor (table: number[][], currentPos: Coordinate, turns: number) {
    this.table = table
    this.currentPos = currentPos
    this.turns = turns
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
    console.log('current position', this.currentPos);
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

}