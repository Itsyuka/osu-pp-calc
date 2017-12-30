import {Vector2} from "../../../../Utils/Vector2";
import {Calculator as DifficultyCalculator} from "./Calculator";
import {HitType} from "../../../../Enums/HitType";
import {hasType} from "../../../../Utils/hasType";
import {Circle} from "../HitObjects/Circle";
import {Slider} from "../HitObjects/Slider";
import {Spinner} from "../HitObjects/Spinner";
import {BaseDifficultyHitObject} from "../../../BaseDifficultyHitObject";

export class HitObject extends BaseDifficultyHitObject {
    object: Circle|Slider|Spinner;
    strains = [1, 1];

    normStart: Vector2;

    constructor(hitObject: Circle | Slider | Spinner, timeRate: number, radius: number) {
        super(hitObject, timeRate);
        this.object = hitObject;
        let scalingFactor = 52/radius;
        if(radius < DifficultyCalculator.CIRCLE_SIZE_BUFF_THRESHOLD) {
            scalingFactor *= 1 + Math.min(DifficultyCalculator.CIRCLE_SIZE_BUFF_THRESHOLD - radius, 5) / 50;
        }
        this.normStart = hitObject.position.scale(scalingFactor);
    }

    async calculateStrains(previous: HitObject) {
        await this.calculateStrain(previous, DifficultyCalculator.DIFF_SPEED);
        await this.calculateStrain(previous, DifficultyCalculator.DIFF_AIM);
    }

    async calculateStrain(previous: HitObject, difficultyType: number) {
        let res = 0;
        let timeElapsed = (this.startTime - previous.startTime);
        let decay = Math.pow(DifficultyCalculator.DECAY_BASE[difficultyType], timeElapsed/1000);
        let scaling = DifficultyCalculator.WEIGHT_SCALING[difficultyType];

        if(!hasType(this.object.type, HitType.Spinner)) {
            let distance = this.normStart.distance(previous.normStart);
            res = this.spacingWeight(distance, difficultyType) * scaling;
        }

        res /= Math.max(timeElapsed, 50);
        this.strains[difficultyType] = previous.strains[difficultyType]*decay + res;
    }

    spacingWeight(distance: number, difficultyType: number) {
        if(difficultyType === DifficultyCalculator.DIFF_SPEED) {
            if(distance > DifficultyCalculator.SINGLE_SPACING) {
                return 2.5;
            } else if(distance > DifficultyCalculator.STREAM_SPACING) {
                return 1.6 + 0.9*(distance - DifficultyCalculator.STREAM_SPACING)/(DifficultyCalculator.SINGLE_SPACING - DifficultyCalculator.STREAM_SPACING);
            } else if(distance > DifficultyCalculator.ALMOST_DIAMETER) {
                return 1.2 + 0.4*(distance - DifficultyCalculator.ALMOST_DIAMETER)/(DifficultyCalculator.STREAM_SPACING - DifficultyCalculator.ALMOST_DIAMETER);
            } else if(distance > DifficultyCalculator.ALMOST_DIAMETER/2) {
                return 0.95 + 0.25*(distance - DifficultyCalculator.ALMOST_DIAMETER/2)/(DifficultyCalculator.ALMOST_DIAMETER/2);
            }
            return 0.95
        } else if(difficultyType === DifficultyCalculator.DIFF_AIM) {
            return Math.pow(distance, 0.99);
        }
        return 0;
    }
}