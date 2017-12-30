import {BaseDifficultyHitObject} from "../../../BaseDifficultyHitObject";
import {Circle} from "../HitObjects/Circle";
import {Drumroll} from "../HitObjects/Drumroll";
import {Shaker} from "../HitObjects/Shaker";
import {hasType} from "../../../../Utils/hasType";
import {HitType} from "../../../../Enums/HitType";
import {Calculator} from "./Calculator";

export class HitObject extends BaseDifficultyHitObject {
    isBlue: boolean = false;
    strain: number = 1;
    sameColorChain: number = 0;
    lastColorSwitch: number = 0;
    timeElapsed: number = 0;

    constructor(hitObject: Circle|Drumroll|Shaker, timeRate: number) {
        super(hitObject, timeRate);
        if(hasType(this.object.type, HitType.Normal)) {
            this.isBlue = this.object.isBlue;
        }
    }

    async calculateStrain(previous: HitObject) {
        this.timeElapsed = this.startTime - previous.startTime;
        let decay = Math.pow(Calculator.DECAY_BASE, this.timeElapsed/1000);
        let addition = 1;

        let isClose = this.startTime - previous.startTime < 1000;
        if(hasType(this.object.type, HitType.Normal) && hasType(previous.object.type, HitType.Normal) && isClose) {
            addition += this.colorChangeAddition(previous);
            addition += this.rhythmChangeAddition(previous);
        }

        let additionFactor = 1;
        if(this.timeElapsed < 50) {
            additionFactor = 0.4 + 0.6 * this.timeElapsed / 50;
        }
        this.strain = previous.strain * decay + addition * additionFactor;
    }

    colorChangeAddition(previous: HitObject) {
        if(this.isBlue !== previous.isBlue) {
            this.lastColorSwitch = previous.sameColorChain % 2 === 0 ? 1 : 2;
            if(previous.lastColorSwitch !== 0 && previous.lastColorSwitch !== this.lastColorSwitch) {
                return Calculator.COLOR_CHANGE_BONUS;
            }
        } else {
            this.lastColorSwitch = previous.lastColorSwitch;
            this.sameColorChain = previous.sameColorChain + 1;
        }
        return 0;
    }

    rhythmChangeAddition(previous: HitObject) {
        if(this.timeElapsed === 0 || previous.timeElapsed === 0) {
            return 0;
        }
        let timeElapsedRatio = Math.max(previous.timeElapsed / this.timeElapsed, this.timeElapsed / previous.timeElapsed);
        if(timeElapsedRatio > 8) {
            return 0;
        }
        let difference = (Math.log(timeElapsedRatio) / Math.log(Calculator.RHYTHM_CHANGE_BASE)) % 1;
        if(difference > Calculator.RHYTHM_CHANGE_BASE_THRESHOLD && difference < 1 - Calculator.RHYTHM_CHANGE_BASE_THRESHOLD) {
            return Calculator.RHYTHM_CHANGE_BONUS;
        }
        return 0;
    }
}