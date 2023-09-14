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
  
  public generateMove(coordinates: Coordinate[]) {
    this.table[this.currentPos.getX()][this.currentPos.getY()] = 0
    // making a move.
    for (let i = 0; i < coordinates.length; i++) {
      if (i === coordinates.length -1) {
        this.table[coordinates[i].getX()][coordinates[i].getY()] = 6
        this.currentPos = coordinates[i]
      } else {
        this.table[coordinates[i].getX()][coordinates[i].getY()] += 90
      }
      if (i > 0) {
        this.table[coordinates[i - 1].getX()][coordinates[i - 1].getY()] = 0
      } 
      
      this.snapshots.push({
        table: this.getTableSerialized(),
        match: false,
        prize: undefined
      })
    }
  }

  public validateInput (move: string) {
    const inputs = move.split(":")
    const coordinates: Coordinate[] = []
    let actualCoord = this.currentPos

    for (let i = 0;i < inputs.length;i++) {
      const inputSplit = inputs[i].split("-")
      const coordinate = new Coordinate(parseInt(inputSplit[0]), parseInt(inputSplit[1]))
      const diferenceX = coordinate.getX() - actualCoord.getX()
      const diferenceY = coordinate.getY() - actualCoord.getY()
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
      ) {
        coordinates.push(coordinate)
        actualCoord = coordinate
      } else {
        return undefined
      }
    }
    return coordinates
  }

  
}