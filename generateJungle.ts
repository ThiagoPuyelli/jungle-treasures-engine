import { PLAYER, TRAPS, TREASURES } from "./Types"
// TODO generateLines with no more than 2 traps per row or column.
export class GenerateJungle {
  private static index: number[] = [0, 0, 0, 0, 0, 0, 0];
  public static generateDefault () {
    const table: number[][] = []
    for (let i = 0;i < 7;i++) {
      table.push(this.generateLine(i !== 0))
    }
    return table
  }

  private static generateLine (trap: boolean) {
    let indexTrap = -1
    if (trap) {
      indexTrap = Math.floor(Math.random() * 5) + 1
    }
    const line: number[] = []
    for (let i = 0;i < 7;i++) {
      if (trap && i > 0 && i < 6 && this.index[i] < 2) {
        line.push(TRAPS[0])
        this.index[i]++
      } else if (!trap && i === 3) {
        line.push(PLAYER)        
      } else {
        line.push(TREASURES[Math.floor(Math.random() * 3)]) // selecting a treasure to push.
      }
    }
    return line
  }
}