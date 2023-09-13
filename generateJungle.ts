import { Coordinate } from "./Coordinate";
import { PLAYER, TRAPS, TREASURES } from "./Types"
// TODO generateLines with no more than 2 traps per row or column.
export class GenerateJungle {
  public static generateDefault () {
    const table: number[][] = []
    for (let i = 0;i < 7;i++) {
      table.push(this.generateLine(i !== 0))
    }
    const spikes = this.generateSpikesCoordinates()
    for (let spike of spikes) {
      table[spike.getY()][spike.getX()] = TRAPS[0]
    }
    return table
  }

  private static generateLine (trap: boolean) {
    const line: number[] = []
    for (let i = 0;i < 7;i++) {
      if (!trap && i === 3) {
        line.push(PLAYER)
      } else {
        line.push(TREASURES[Math.floor(Math.random() * 3)]) // selecting a treasure to push.
      }
    }
    return line
  }

  private static generateSpikesCoordinates () {
    let coordinates: Coordinate[] = []
    while (coordinates.length < 6) {
      const coord = this.generateSpikeCoordinate()
      if (!coordinates.find((c) => (c.getX() === coord.getX()) && (c.getY() === coord.getY()))) {
        if (
          coordinates.filter((c) => c.getX() === coord.getX()).length <= 1 
          && 
          coordinates.filter((c) => c.getY() === coord.getY()).length <= 1
        ) {
          coordinates.push(coord)
        }
      }
    }
    return coordinates
  }

  private static generateSpikeCoordinate () {
    return new Coordinate(Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 6) + 1)
  }

  static generateMove(move: string, table: number[][], currentPos: number[]) {
    const coordinates = move.split(",")
    table[currentPos[0]][currentPos[1]] = 0 
    // making a move.
    for (let i = 0; i < coordinates.length; i++) {
      let xy = coordinates[i].split("-")
      const x = parseInt(xy[0])
      const y = parseInt(xy[1])
      if (i === coordinates.length -1) {
        table[x][y] = 6
      } else {
        table[x][y] = 0
      }
    }
  }
}