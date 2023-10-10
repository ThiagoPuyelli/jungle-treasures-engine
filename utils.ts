import { ISnapshot } from "./Types"

export const showTable = (table: number[][]) => {
  let line = "   "
  for (let i = table.length - 1;i >= 0;i--) {
    for (const x in table[i]) {
      line += table[i][x] + (table[i][x] > 10 ? '  ' : '   ')
    }
    line += "\n   "
  }
  console.log(line)
}

// export const showSnapshots = (snapshots: ISnapshot[]) => {
//   let i = 0
//   const interval = setInterval(() => {
//     showTable(snapshots[i].table)
//     i++
//   }, 500)

//   setTimeout(() => {
//     clearInterval(interval)
//   }, (snapshots.length * 500) + 50)
// }
export const showSnapshots = async (snapshots: ISnapshot[]) => {
  for (let i = 0; i < snapshots.length; i++) {
    showTable(snapshots[i].table)
    // Use await to pause execution for a set duration (e.g., 500ms)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}
