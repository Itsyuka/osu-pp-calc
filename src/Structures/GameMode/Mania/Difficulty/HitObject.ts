import {BaseDifficultyHitObject} from "../../../BaseDifficultyHitObject";
import {Hold} from "../HitObjects/Hold";
import {Single} from "../HitObjects/Single";
import {Calculator} from "./Calculator";

export class HitObject extends BaseDifficultyHitObject {
    object: Hold|Single;
    column: number;
    columns: number; // Number of columns there were

    strain: number = 0;
    individualStrains = {};
    heldUntil = {};

    constructor(hitObject: Hold|Single, timeRate: number, columns: number) {
        super(hitObject, timeRate);
        this.individualStrains = {};
        this.heldUntil = {};
        for(let i = 0; i < columns; i++) {
            this.individualStrains[i] = 0;
            this.heldUntil[i] = 0;
        }
        this.columns = columns;
        this.column = Math.floor(hitObject.position.x/(512/columns));
    }

    compare(hitObject: HitObject) {
        return this.startTime <= hitObject.startTime;
    }

    calculateStrains(previous) {
        let timeElapsed = this.startTime - previous.startTime;
        let individualDecay = Math.pow(Calculator.INDIVIDUAL_DECAY_BASE, timeElapsed / 1000);
        let overallDecay = Math.pow(Calculator.OVERALL_DECAY_BASE, timeElapsed / 1000);
        let holdFactor = 1;
        let holdAddition = 0;

        for(let i = 0; i < this.columns; i++) {
            this.heldUntil[i] = previous.heldUntil[i];

            if(this.startTime < this.heldUntil[i] && this.endTime > this.heldUntil[i] && this.endTime != this.heldUntil[i]) {
                holdAddition = 1;
            }

            if(this.endTime === this.heldUntil[i]) {
                holdAddition = 0;
            }

            if(this.heldUntil[i] > this.endTime) {
                holdFactor = 1.25;
            }

            this.individualStrains[i] = previous.individualStrains[i] * individualDecay;
        }

        this.heldUntil[this.column] = this.endTime;
        this.individualStrains[this.column] += 2 * holdFactor;
        this.strain = previous.strain * overallDecay + (1 + holdAddition) * holdFactor;
    }
}