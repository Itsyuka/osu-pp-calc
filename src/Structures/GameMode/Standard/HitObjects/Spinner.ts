import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";

export class Spinner extends HitObject {
    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType, newCombo: boolean) {
        super(pos, startTime, endTime, type, newCombo);
    }
}