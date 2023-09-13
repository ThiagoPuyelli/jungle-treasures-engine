export class Coordinate {
      private x: number;
      private y: number;
  
      constructor(x: number, y: number) {
          this.x = x
          this.y = y
      }
  
      getX(): number {
          return this.x
      }
  
      setX(x: number) {
          this.x = x
      }
  
      getY(): number {
          return this.y
      }
  
      setY(y: number) {
          this.y = y
      }
  
      getXY(): [number, number] {
          return [this.x, this.y]
      }
  }