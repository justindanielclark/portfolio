import hasPositionUpdate from "./types/hasPositionUpdate";
import hasPosition from "./types/hasPositon";
import Position from "./types/Position";
import Speed from "./types/Speed";

export default class Orb implements hasPosition, hasPositionUpdate {
  static canvasWidth = 0; //Set On Canvas Creation/Resize
  static canvasHeight = 0; //Set On Cavnas Creation/Resize
  static baseVector = 2; // Lowest Possible Vector
  static capVector = 6; // Highest Possible Vector
  static baseVelocity = 0.3; //Lowest Possible Speed in a cardinal direction
  static capVelocity = 5; //Highest Possible Speed in a cardinal direction
  static baseRadius = 1;
  static qualifyingNearDistance = 150;
  static limit = Orb.qualifyingNearDistance * 0.9;
  private x: number;
  private y: number;
  private radius: number;

  private vector: number;
  private xVel: number;
  private yVel: number;
  constructor(radius: number) {
    this.vector = Orb.calculateRandomVector();
    this.radius = radius;
    const { x, y, xVel, yVel } = Orb.generateInitialStartAndVelocity(
      this.vector
    );
    this.x = x;
    this.y = y;
    this.xVel = xVel;
    this.yVel = yVel;
  }
  public update(): void {
    this.x += this.xVel;
    this.y += this.yVel;
    if (this.isOutOfBounds()) {
      this.generateNewStartingPosition();
    }
  }
  public isOutOfBounds(): boolean {
    return (
      this.x < -Orb.limit ||
      this.x > Orb.canvasWidth + Orb.limit ||
      this.y < -Orb.limit ||
      this.y > Orb.canvasHeight + Orb.limit
    );
  }
  public generateNewStartingPosition(): void {
    const { x, y, xVel, yVel } = Orb.generateNewStartAndVelocity(
      Orb.limit,
      this.vector
    );
    this.x = x;
    this.y = y;
    this.xVel = xVel;
    this.yVel = yVel;
  }
  public getSpeed(): Speed {
    return {
      xVel: this.xVel,
      yVel: this.yVel,
    };
  }
  public getPosition(): Position {
    return {
      x: this.x,
      y: this.y,
    };
  }
  public getSpeedAndPosition(): Position & Speed {
    return {
      ...this.getPosition(),
      ...this.getSpeed(),
    };
  }
  public getX(): number {
    return this.x;
  }
  public getY(): number {
    return this.y;
  }
  public getRadius(): number {
    return this.radius;
  }
  public static willOrbsBeNearEachOther(orb1: Orb, orb2: Orb): boolean {
    const [o1, o2] = [orb1.getSpeedAndPosition(), orb2.getSpeedAndPosition()];
    // calculate the distance between the orbs' current positions
    const dx = o2.x - o1.x;
    const dy = o2.y - o1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < Orb.qualifyingNearDistance) {
      // if the orbs are already within Orb.qualifyingNearDistance units of each other, return true
      return true;
    }
    // calculate the relative velocity between the orbs
    const dvx = o2.xVel - o1.xVel;
    const dvy = o2.yVel - o1.yVel;
    if (dvx === 0 && dvy === 0) {
      // if the orbs have the same velocity, they will never collide
      return false;
    }
    // calculate the time it will take for the orbs to collide, if they do
    const a = dvx * dvx + dvy * dvy;
    const b = 2 * (dx * dvx + dy * dvy);
    const c =
      dx * dx +
      dy * dy -
      Orb.qualifyingNearDistance * Orb.qualifyingNearDistance;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
      // if the discriminant is negative, the orbs will never collide
      return false;
    }
    const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
    if (t1 < 0 && t2 < 0) {
      // if both times are negative, the orbs will never collide
      return false;
    }
    return true;
  }
  public static orbsAreNearEachOther(orb1: Orb, orb2: Orb): boolean {
    const dx = orb1.getX() - orb2.getX();
    const dy = orb1.getY() - orb2.getY();
    const distanceBetweenOrbs = Math.sqrt(dx * dx + dy * dy);
    return distanceBetweenOrbs <= Orb.qualifyingNearDistance;
  }
  private static generateXYVelocity(vector: number): {
    xVel: number;
    yVel: number;
  } {
    const xVel = Math.max(Orb.baseVelocity, Math.random() * vector);
    const yVel = vector - xVel;
    return { xVel, yVel };
  }
  private static generateInitialStartAndVelocity(
    vector: number
  ): Position & Speed {
    const { xVel, yVel } = Orb.generateXYVelocity(vector);
    return {
      x: Math.random() * (Orb.canvasWidth + Orb.limit * 2) - Orb.limit,
      y: Math.random() * (Orb.canvasHeight + Orb.limit * 2) - Orb.limit,
      xVel: Math.random() > 0.5 ? xVel : -xVel,
      yVel: Math.random() > 0.5 ? yVel : -yVel,
    };
  }
  private static generateNewStartAndVelocity(
    limit: number,
    vector: number
  ): Position & Speed {
    const totalLength = 8 * limit + 2 * Orb.canvasWidth + 2 * Orb.canvasHeight;
    const startingPoint = Math.random() * totalLength;
    const { xVel, yVel } = Orb.generateXYVelocity(vector);
    if (startingPoint < 2 * limit + Orb.canvasWidth) {
      //Generate starting point at top
      return {
        x: Math.random() * (limit * 2 + Orb.canvasWidth) - limit,
        y: -limit,
        xVel: Math.random() > 0.5 ? xVel : -xVel,
        yVel: yVel,
      };
    } else if (startingPoint < 4 * limit + Orb.canvasWidth + Orb.canvasHeight) {
      //Generate starting point at right
      return {
        x: Orb.canvasWidth + limit,
        y: Math.random() * (limit * 2 + Orb.canvasHeight) - limit,
        xVel: -xVel,
        yVel: Math.random() > 0.5 ? yVel : -yVel,
      };
    } else if (
      startingPoint <
      6 * limit + 2 * Orb.canvasWidth + Orb.canvasHeight
    ) {
      //Generate starting point at bottom
      return {
        x: Math.random() * (limit * 2 + Orb.canvasWidth) - limit,
        y: Orb.canvasHeight + limit,
        xVel: Math.random() > 0.5 ? xVel : -xVel,
        yVel: -yVel,
      };
    }
    //Generate starting point at left
    return {
      x: -limit,
      y: Math.random() * (limit * 2 + Orb.canvasHeight) - limit,
      xVel: xVel,
      yVel: Math.random() > 0.5 ? yVel : -yVel,
    };
  }
  private static calculateRandomVector(): number {
    return Math.max(Math.random() * Orb.capVector, Orb.baseVector);
  }
}
