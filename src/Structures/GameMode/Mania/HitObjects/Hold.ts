import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {TimingPoint} from "../../../TimingPoint";
import {Beatmap} from "../../../Beatmap";

export class Hold extends HitObject {
    constructor(pos: Vector2, startTime: number, endTime: number, type: HitType) {
        super(pos, startTime, endTime, type);
    }

    async updateCalculations() {
        let velocityMultiplier = 1;
        if(this.currentTimingPoint.isInherited && this.currentTimingPoint.beatLength < 0) {
            velocityMultiplier = -100/this.currentTimingPoint.beatLength;
        }
        let duration = this.endTime - this.startTime;
        this.combo = Math.ceil(duration / (this.beatmap.Difficulty.SliderTickRate * 100 * velocityMultiplier)); // Rough estimation, 99% of the time it's correct
    }
}