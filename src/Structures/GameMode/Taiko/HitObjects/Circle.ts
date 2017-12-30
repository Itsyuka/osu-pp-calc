import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {HitSoundType} from "../../../../Enums/HitSoundType";

export class Circle extends HitObject {
    constructor(pos: Vector2, startTime: number, type: HitType, hitSound: HitSoundType) {
        super(pos, startTime, startTime, type, hitSound);
    }
}