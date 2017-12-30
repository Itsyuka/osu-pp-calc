import {HitType} from "../Enums/HitType";
import {Vector2} from "../Utils/Vector2";
import {TimingPoint} from "./TimingPoint";
import {Beatmap} from "./Beatmap";

export class BaseHitObject {
    position: Vector2;
    startTime: number = 0;
    endTime: number = 0;
    type: HitType = HitType.Normal;
    combo: number = 1;
    currentTimingPoint: TimingPoint;
    parentTimingPoint: TimingPoint;
    beatmap: Beatmap;

    constructor(pos: Vector2, startTime: number, endTime: number, type: number) {
        this.position = pos;
        this.startTime = startTime;
        this.endTime = endTime;
        this.type = type;
    }

    async finalize(current: TimingPoint, parent: TimingPoint, beatmap: Beatmap) { // Used for recalculations
        this.currentTimingPoint = current;
        this.parentTimingPoint = parent;
        this.beatmap = beatmap;
        await this.updateCalculations();
    }

    async updateCalculations() {
        // Nothing to do here;
    }

    get length() {
        return this.endTime - this.startTime;
    }

    toJSON() {
        return {
            position: this.position,
            startTime: this.startTime,
            endTime: this.endTime,
            type: this.type,
            combo: this.combo
        }
    }
}