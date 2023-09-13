
export const TREASURES = [1, 2, 3] // Ruby, Diamond, Emerald

export const TRAPS = [4, 5] // Spike, Scorpion

export const PLAYER = 6

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
