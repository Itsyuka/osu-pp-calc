import {BaseDifficultyHitObject} from "../../../BaseDifficultyHitObject";
import {Banana} from "../HitObjects/Banana";
import {Fruit} from "../HitObjects/Fruit";
import {Slider} from "../HitObjects/Slider";
import {clamp} from "../../../../Utils/Math";
import {hasType} from "../../../../Utils/hasType";
import {HitType} from "../../../../Enums/HitType";

export const DECAY_BASE = 0.20;
const NORMALIZED_HITOBJECT_RADIUS = 41.0;
const ABSOLUTE_PLAYER_POSITIONING_ERROR = 16;
const DIRECTION_CHANGE_BONUS = 12.5;

export class HitObject extends BaseDifficultyHitObject {
    normalizedPosition: number;
    playerPositionOffset: number = 0;
    lastMovement = 0;
    strain: number = 1;

    hyperDashTarget: HitObject = null;
    distanceToHyperDash: number = 0;

    constructor(hitObject: Banana|Fruit|Slider, timeRate: number, catcherWidth: number) {
        super(hitObject, timeRate);
        let scalingFactor = NORMALIZED_HITOBJECT_RADIUS / ((catcherWidth / 2) * 0.8);
        this.normalizedPosition = this.object.position.x * scalingFactor;
    }

    async calculateStrains(previous) {
        let timeElapsed = this.startTime - previous.startTime;
        let decay = Math.pow(DECAY_BASE, timeElapsed / 1000);
        this.playerPositionOffset = clamp(
            this.normalizedPosition - (NORMALIZED_HITOBJECT_RADIUS - ABSOLUTE_PLAYER_POSITIONING_ERROR),
                this.normalizedPosition + (NORMALIZED_HITOBJECT_RADIUS - ABSOLUTE_PLAYER_POSITIONING_ERROR),
                previous.actualNormalizedPosition) - this.normalizedPosition;

        this.lastMovement = Math.abs(this.actualNormalizedPosition - previous.actualNormalizedPosition);
        let addition = Math.pow(this.lastMovement, 1.3) / 500;

        if(this.normalizedPosition < previous.normalizedPosition) {
            this.lastMovement = -this.lastMovement;
        }

        let previousCircle = (hasType(previous.object.type, HitType.Normal)) ? previous : null;

        let additionBonus = 0;
        let sqrtTime = Math.sqrt(Math.max(timeElapsed, 25));

        if(Math.abs(this.lastMovement) > 0.1) {
            if(Math.abs(previous.lastMovement) > 0.1 && Math.sign(this.lastMovement) !== Math.sign(previous.lastMovement)) {
                let bonus = DIRECTION_CHANGE_BONUS / sqrtTime;
                let bonusFactor = Math.min(ABSOLUTE_PLAYER_POSITIONING_ERROR, Math.abs(this.lastMovement)) / ABSOLUTE_PLAYER_POSITIONING_ERROR;
                addition += bonus * bonusFactor;

                if(previousCircle !== null && previousCircle.distanceToHyperDash <= 10) {
                    additionBonus += 0.3 * bonusFactor;
                }

                addition += 7.5 * Math.min(Math.abs(this.lastMovement), NORMALIZED_HITOBJECT_RADIUS * 2) / (NORMALIZED_HITOBJECT_RADIUS * 6) / sqrtTime;
            }
        }

        if(previousCircle !== null && previousCircle.distanceToHyperDash <= 10) {
            if(!previousCircle.hyperDash) {
                additionBonus += 1;
            } else {
                this.playerPositionOffset = 0;
            }
            addition *= 1 + additionBonus * ((10 - previousCircle.distanceToHyperDash) / 10);
        }

        addition *= 850 / Math.max(timeElapsed, 25);
        this.strain = previous.strain * decay + addition;
    }

    makeHyperDash(hitObject: HitObject) {
        if(this.hyperDash) return;

        this.distanceToHyperDash = 0;
        this.hyperDashTarget = hitObject;
    }

    get hyperDash() {
        return this.hyperDashTarget !== null;
    }

    get actualNormalizedPosition() {
        return this.normalizedPosition - this.playerPositionOffset;
    }
}