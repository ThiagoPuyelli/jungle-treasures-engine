import { PLAYER, TRAPS, TREASURES } from "./Types"

export class GenerateJungle {
  public static generateDefault () {
    const table: number[][] = []
    for (let i = 0;i < 7;i++) {
      table.push(this.generateLine(i !== 0))
    }
    return table
  }

  private static generateLine (trap: boolean) {
    let indexTrap
    if (trap) {
      indexTrap = Math.floor(Math.random() * 5) + 1
    }
    const line: number[] = []
    for (let i = 0;i < 7;i++) {
      if (trap && indexTrap === i) {
        line.push(TRAPS[0])
      } else if (!trap && i === 3) {
        line.push(PLAYER)        
      } else {
        line.push(TREASURES[Math.floor(Math.random() * 3)])
      }
    }
    return line
  }
}