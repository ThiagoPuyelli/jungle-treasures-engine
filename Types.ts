
export const TREASURES = [1, 2, 3] // Ruby, Diamond, Emerald

//export const TRAPS = [4, 5] // Spike, Scorpion
export const SPIKE = [43, 44, 45, 46, 47]
export const SCORPION = [55, 56, 57, 58]

export const PLAYER = 6
export const LIVES = 3

export const INITIAL_TURNS = 30
export const DEATHSYMBOL = 20

export type ITable = number[][]

export type IPrize = {
  label: string,
  score: number
}

export type ISnapshot = {
  table: ITable;
  match: boolean;
  prize: IPrize | undefined;
};
