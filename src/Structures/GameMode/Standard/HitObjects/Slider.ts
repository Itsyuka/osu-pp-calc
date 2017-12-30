import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {TimingPoint} from "../../../TimingPoint";
import {Beatmap} from "../../../Beatmap";

export class Slider extends HitObject {
    sliderPoints: Vector2[] = [];
    sliderScoreTimingPoints: number[] = [];
    sliderVelocityMultiplier: number;
    curveType: Types = Types.Catmull;
    repetitions: number = 0;
    pixelLength: number = 0;
    combo: number = 1;

    constructor(pos: Vector2, startTime: number, type: HitType, newCombo: boolean, curveType: string, sliderPoints: Vector2[], repetitions: number, pixelLength: number) {
        super(pos, startTime, startTime, type, newCombo);
        this.sliderPoints = sliderPoints;
        switch(curveType) {
            case 'C':
                this.curveType = Types.Catmull;
                break;
            case 'B':
                this.curveType = Types.Bezier;
                break;
            case 'L':
                this.curveType = Types.Linear;
                break;
            case 'P':
                this.curveType = Types.PerfectCurve;
                break;
        }
        this.repetitions = repetitions;
        this.pixelLength = pixelLength;
    }

    async finalize(current: TimingPoint, parent: TimingPoint, beatmap: Beatmap) {
        super.finalize(current, parent, beatmap);
        let velocityMultiplier = 1;
        if(current.isInherited && current.beatLength < 0) {
            velocityMultiplier = -100/current.beatLength;
        }
        let pixelsPerBeat = beatmap.Difficulty.SliderMultiplier * 100.0 * velocityMultiplier;
        let beats = (this.pixelLength*this.repetitions)/pixelsPerBeat;
        let duration = Math.ceil(beats*parent.beatLength);
        this.endTime = this.startTime + duration;
        this.combo = Math.ceil((beats - 0.01) / this.repetitions * beatmap.Difficulty.SliderTickRate) - 1;
        this.combo *= this.repetitions;
        this.combo += this.repetitions + 1;
    }

    /*async updateCalculations() {
        this.sliderVelocityMultiplier = 1;
        if(this.currentTimingPoint.isInherited && this.currentTimingPoint.beatLength < 0) {
            this.sliderVelocityMultiplier = -100/this.currentTimingPoint.beatLength;
        }
        let pixelsPerBeat = this.beatmap.Difficulty.SliderMultiplier * 100.0 * this.sliderVelocityMultiplier;
        let beats = (this.pixelLength*this.repetitions)/pixelsPerBeat;
        let duration = Math.ceil(beats*this.parentTimingPoint.beatLength);
        this.endTime = this.startTime + duration;
        this.combo = Math.ceil((beats - 0.01) / this.repetitions * this.beatmap.Difficulty.SliderTickRate) - 1;
        this.combo *= this.repetitions;
        this.combo += this.repetitions + 1;
    }*/

    timeAtLength(length: number) {
        return (this.startTime + (this.length / this.sliderVelocityMultiplier) * 1000);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            sliderPoints: this.sliderPoints,
            curveType: this.curveType,
            repetitions: this.repetitions,
            pixelLength: this.pixelLength,
        }
    }
}

enum Types {
    Catmull = 0,
    Bezier,
    Linear,
    PerfectCurve
}