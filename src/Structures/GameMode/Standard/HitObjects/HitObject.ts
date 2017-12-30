import {BaseHitObject} from "../../../BaseHitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";

export class HitObject extends BaseHitObject {
    newCombo: boolean;

    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType, newCombo: boolean) {
        super(pos, startTime, endTime, type);
        this.newCombo = newCombo;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            newCombo: this.newCombo
        }
    }
}