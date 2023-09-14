import readline from 'readline'
import { GenerateJungle } from './generateJungle';
import { showSnapshots, showTable } from './utils';
import { Coordinate } from './Coordinate';
import { Jungle } from './Jungle';
import { INITIAL_TURNS } from './Types';

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
  const jungle = new Jungle(table, new Coordinate(0, 3), INITIAL_TURNS)
  showTable(jungle.getTable())
  inputValue = await question("Introducir coordenadas: ")
  while (inputValue!='end') {
    const inputs = inputValue.toString().split(' ')
    const positions = jungle.validateInput(inputs[0])
    if (positions) {
      jungle.generateMove(positions)
    } else {
      console.log('wrong input!\n')
    }
    await showSnapshots(jungle.getSnapshots())
    inputValue = await question("Introducir Coordenadas: \n")
    jungle.setSnapshots([])
  }
  rl.close();
}
console.log("test");

play()