import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {HitSoundType} from "../../../../Enums/HitSoundType";

export class Shaker extends HitObject {
    combo = 0;
    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType, hitSound: HitSoundType) {
        super(pos, startTime, endTime, type, hitSound);
    }
}