/**
 * A Basic Vector 2D class
 */
export class Vector2 {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vec: Vector2): Vector2 {
        return new Vector2(this.x + vec.x, this.y + vec.y);
    }

    subtract(vec: Vector2): Vector2 {
        return new Vector2(this.x - vec.x, this.y - vec.y);
    }

    scale(scale: number): Vector2 {
        return new Vector2(this.x*scale, this.y*scale);
    }

    length(): number {
        return Math.sqrt((this.x*this.x) + (this.y+this.y));
    }

    distance(vec: Vector2): number {
        let x = this.x - vec.x;
        let y = this.y - vec.y;
        let dist = x * x + y * y;
        return Math.sqrt(dist);
    }

    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }
}