import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {HitSoundType} from "../../../../Enums/HitSoundType";

export class Drumroll extends HitObject {
    pixelLength: number;
    combo = 0;
    constructor(pos: Vector2, startTime: number, type: HitType, hitSound: HitSoundType, pixelLength: number) {
        super(pos, startTime, startTime, type, hitSound);
        this.pixelLength = pixelLength;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            pixelLength: this.pixelLength
        }
    }
}