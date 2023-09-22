import { Coordinate } from "./Coordinate";
import { PLAYER, SCORPION, SPIKE, TREASURES } from "./Types"
// TODO generateLines with no more than 2 traps per row or column.
export class GenerateJungle {
  public static generateDefault () {
    const table: number[][] = [
      [1,   1,   3,   3,   3,   44,  1,],   
      [2,   1,   1,   3,   3,   1,   2],   
      [2,   3,   3,   1,   47,  1,   3],   
      [2,   1,   44,  3,   2,   45,  1],   
      [1,   2,   1,   3,   2,   2,   2],   
      [1,   45,  1,   3,   44,  2,   1],   
      [2,   2,   3,   6,   2,   2,   2]  //1-3:2-3:3-3:4-2:5-3:5-4:6-4:6-3:6-2
    ]
    table.reverse()
    /*for (let i = 0;i < 7;i++) {
      table.push(this.generateLine(i !== 0))
    }
    const spikes = this.generateSpikesCoordinates()
    for (let spike of spikes) {
      const randomIndex = Math.floor(Math.random() * SPIKE.length)
      table[spike.getY()][spike.getX()] = SPIKE[randomIndex]
    }*/
    return table
  }

  public static generateGemsPool () {
    const gemsPool: number[] = []
    for (let i = 0;i < 500;i++) {
      if (i < 50) {
        gemsPool.push(TREASURES[Math.floor(Math.random() * TREASURES.length)])
      } else {
        const indexRandom = TREASURES[Math.floor(Math.random() * (TREASURES.length + 1))]
        if (indexRandom > TREASURES.length) {
          gemsPool.push(SCORPION[Math.floor(Math.random() * SCORPION.length)])
        } else {
          gemsPool.push(TREASURES[indexRandom])
        }
      }
    }
    return gemsPool
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