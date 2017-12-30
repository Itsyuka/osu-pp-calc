import {HitObject} from "./HitObject";
import {Vector2} from "../../../../Utils/Vector2";
import {HitType} from "../../../../Enums/HitType";
import {TimingPoint} from "../../../TimingPoint";
import {Beatmap} from "../../../Beatmap";

export class Slider extends HitObject {
    sliderPoints: Vector2[] = [];
    repetitions: number = 0;
    pixelLength: number = 0;
    combo: number = 1;

    constructor(pos: Vector2, startTime: number, type: HitType, newCombo: boolean, sliderPoints: Vector2[], repetitions: number, pixelLength: number) {
        super(pos, startTime, startTime, type, newCombo);
        this.sliderPoints = sliderPoints;
        this.repetitions = repetitions;
        this.pixelLength = pixelLength;
    }

    async finalize(current: TimingPoint, parent: TimingPoint, beatmap: Beatmap) {
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

    toJSON() {
        return {
            ...super.toJSON(),
            sliderPoints: this.sliderPoints,
            repetitions: this.repetitions,
            pixelLength: this.pixelLength,
        }
    }
}