import { Coordinate } from "./Coordinate";
import { PLAYER, SPIKE, TREASURES } from "./Types"
// TODO generateLines with no more than 2 traps per row or column.
export class GenerateJungle {
  public static generateDefault () {
    const table: number[][] = []
    for (let i = 0;i < 7;i++) {
      table.push(this.generateLine(i !== 0))
    }
    const spikes = this.generateSpikesCoordinates()
    for (let spike of spikes) {
      const randomIndex = Math.floor(Math.random() * SPIKE.length)
      table[spike.getY()][spike.getX()] = SPIKE[randomIndex]
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
}