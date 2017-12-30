import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";

export class Fruit extends HitObject {
    constructor(pos: Vector2, startTime: number, type: HitType, newCombo: boolean) {
        super(pos, startTime, startTime, type, newCombo);
    }
}