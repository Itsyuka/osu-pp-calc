import {BaseHitObject} from "../../../BaseHitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {TimingPoint} from "../../../TimingPoint";
import {Beatmap} from "../../../Beatmap";

export class HitObject extends BaseHitObject {
    column: number;

    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType) {
        super(pos, startTime, endTime, type);
    }

    async updateCalculations() {
        let columns = this.beatmap.Difficulty.CircleSize;
        this.column = Math.floor(this.position.x/(512/columns));
    }

    toJSON() {
        return {
            ...super.toJSON(),
            column: this.column
        }
    }
}