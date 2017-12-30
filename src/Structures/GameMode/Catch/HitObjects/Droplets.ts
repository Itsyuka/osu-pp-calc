import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";

export class Droplets extends HitObject {
    constructor(pos: Vector2, startTime: number, type: HitType) {
        super(pos, startTime, startTime, type, false);
    }
}