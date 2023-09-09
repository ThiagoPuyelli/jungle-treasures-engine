import readline from 'readline'
import { GenerateJungle } from './generateJungle';
import { showTable } from './utils';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string) => {
  rl.on("close", function() {
      console.log("\nBYE BYE !!!");
      process.exit(0);
  });
  return new Promise(resolve => rl.question(query, answer => resolve(answer)))
}

const play = async () => {
  let inputValue: any = []
  const table = GenerateJungle.generateDefault()
  showTable(table)
  inputValue = await question("Me llamo tato: ")
  while (inputValue!='end') {
    const inputs = inputValue.toString().split(' ')
    const positions = inputs[0].split('-')
    if (inputs.length === 2 /*&& parseInt(inputs[1]) <= pieces.length - 1 && parseInt(inputs[1]) >= 0 && positions.length === 2*/) {
      let x: any = positions[0]
      let y: any = positions[1]
      let piece = parseInt(inputs[1])
      /*const body = action(table, pieces, parseInt(x), parseInt(y), piece)
      if (body) {
        table = body.table
        pieces = body.pieces
        showTable(table)
        showPieces(pieces)
      }*/
    } else {
      console.log('wrong input!\n')
    }
    inputValue = await question("Introducir Coordenadas (x-y) y luego un espacio y la pieza o end: ")
  }
  rl.close();
}
console.log("test");

play()