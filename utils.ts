export const showTable = (table: number[][]) => {
  let line = "   "
  for (let i = table.length - 1;i >= 0;i--) {
    for (const x in table[i]) {
      line += table[i][x] + '   '
    }
    line += "\n   "
  }
  console.log(line)
}
