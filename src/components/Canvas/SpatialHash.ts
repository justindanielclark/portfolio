import hasPositionUpdate from "./types/hasPositionUpdate";
import hasPosition from "./types/hasPositon";
import Position from "./types/Position";

export default class SpatialHashMap<T extends hasPosition & hasPositionUpdate> {
  private cellWidth: number;
  private cellHeight: number;
  private cells: Array<
    Array<{ items: Set<T>; x1: number; x2: number; y1: number; y2: number }>
  >;
  constructor(width: number, height: number, divisional: number) {
    this.cells = [];
    const x = Math.max(Math.floor(width / divisional), 1) + 2;
    const y = Math.max(Math.floor(height / divisional), 1) + 2;
    this.cellWidth = width / (x - 2);
    this.cellHeight = height / (y - 2);
    for (let i = 0; i < x; i++) {
      this.cells.push([]);
      for (let j = 0; j < y; j++) {
        this.cells[i].push({
          items: new Set(),
          x1: this.cellWidth * i,
          x2: this.cellWidth * i + 1,
          y1: this.cellHeight * j,
          y2: this.cellHeight * j + 1,
        });
      }
    }
  }
  private locateCell(obj: T): { x: number; y: number } {
    return {
      x: Math.floor(obj.getX() / this.cellWidth) + 1,
      y: Math.floor(obj.getY() / this.cellHeight) + 1,
    };
  }
  public add(obj: T): void {
    const { x, y } = this.locateCell(obj);
    this.cells[x][y].items.add(obj);
  }
  public updateAll(): void {
    const toRelocate: Array<{ oldL: Position; newL: Position; obj: T }> = [];

    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j].items.forEach((obj) => {
          const oldL = this.locateCell(obj);
          obj.update();
          const newL = this.locateCell(obj);
          if (oldL.x !== newL.x || oldL.y !== newL.y) {
            toRelocate.push({ oldL, newL, obj });
          }
        });
      }
    }
    toRelocate.forEach((relocation) => {
      const { oldL, newL, obj } = relocation;
      this.cells[oldL.x][oldL.y].items.delete(obj);
      this.cells[newL.x][newL.y].items.add(obj);
    });
  }
  public applyAll(func: (obj: T) => void): void {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j].items.forEach((obj) => {
          func(obj);
        });
      }
    }
  }
  public reduce<K>(
    callback: (accumulator: K, currentValue: T) => K,
    returnObj: K
  ): K {
    let accumulator = returnObj;
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        this.cells[i][j].items.forEach((obj) => {
          accumulator = callback(accumulator, obj);
        });
      }
    }
    return returnObj;
  }
  public getPossibleNeighbors(obj: T, distance: number): Array<T> {
    //TODO
    return [];
  }
  public areNearby(obj1: T, obj2: T, distance: number): boolean {
    //TODO
    return false;
  }
}
