interface Position {
  x: number;
  y: number;
}
interface Speed {
  xVel: number;
  yVel: number;
}
type PositionAndSpeed = Position & Speed;

export default class Orb {
  static canvasWidth = 0; //Set On Canvas Creation/Resize
  static canvasHeight = 0; //Set On Cavnas Creation/Resize
  static baseVelocity = 0.3; //Lowest Possible Speed
  static capVelocity = 5; //Highest Possible Speed
  public xPos: number;
  public yPos: number;
  public radius: number;
  public isWithinRange: boolean;
  private limit: number;
  private vector: number;
  private xVel: number;
  private yVel: number;
  constructor(vector: number, radius: number) {
    this.vector = vector;
    this.radius = radius;
    this.limit = radius * 2;
    const { x, y, xVel, yVel } = Orb.generateInitialStartAndVelocity(
      this.vector
    );
    this.xPos = x;
    this.yPos = y;
    this.xVel = xVel;
    this.yVel = yVel;
    this.isWithinRange = false;
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
  ): PositionAndSpeed {
    const { xVel, yVel } = Orb.generateXYVelocity(vector);
    return {
      x: Math.random() * Orb.canvasWidth,
      y: Math.random() * Orb.canvasHeight,
      xVel: Math.random() > 0.5 ? xVel : -xVel,
      yVel: Math.random() > 0.5 ? yVel : -yVel,
    };
  }
  private static generateNewStartAndVelocity(
    limit: number,
    vector: number
  ): PositionAndSpeed {
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
  private outOfBounds(): boolean {
    return (
      this.xPos < -this.limit ||
      this.xPos > Orb.canvasWidth + this.limit ||
      this.yPos < -this.limit ||
      this.yPos > Orb.canvasHeight + this.limit
    );
  }
  public static willOrbsCollideWithinDistance(
    orb1: Orb,
    orb2: Orb,
    distance: number
  ): boolean {
    const dx = orb1.xPos - orb2.xPos;
    const dy = orb1.yPos - orb2.yPos;
    const distanceBetweenOrbs = Math.sqrt(dx * dx + dy * dy);
    const sumOfRadii = orb1.radius + orb2.radius;
    return distanceBetweenOrbs - sumOfRadii <= distance;
  }
  public update() {
    this.xPos += this.xVel;
    this.yPos += this.yVel;
    if (this.outOfBounds()) {
      const { x, y, xVel, yVel } = Orb.generateNewStartAndVelocity(
        this.limit,
        this.vector
      );
      this.xPos = x;
      this.yPos = y;
      this.xVel = xVel;
      this.yVel = yVel;
    }
  }
}

//TODO:
function willOrbsCollide(orb1: Orb, orb2: Orb): boolean {
  // calculate the distance between the orbs' current positions
  const dx = orb2.xPos - orb1.xPos;
  const dy = orb2.yPos - orb1.yPos;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 50) {
    // if the orbs are already within 50 units of each other, return true
    return true;
  }

  // calculate the relative velocity between the orbs
  const dvx = orb2.xVel - orb1.xVel;
  const dvy = orb2.yVel - orb1.yVel;

  if (dvx === 0 && dvy === 0) {
    // if the orbs have the same velocity, they will never collide
    return false;
  }

  // calculate the time it will take for the orbs to collide, if they do
  const a = dvx * dvx + dvy * dvy;
  const b = 2 * (dx * dvx + dy * dvy);
  const c = dx * dx + dy * dy - 50 * 50;
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
