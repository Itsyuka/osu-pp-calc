import {BaseDifficultyCalculator} from "../../../BaseDifficultyCalculator";
import {Calculator as PerformanceCalculator} from "../Performance/Calculator";
import {Score} from "../../../Score";
import {HitObject} from "./HitObject";
import {quickSort} from "../../../../Functions/QuickSort";

export class Calculator extends BaseDifficultyCalculator {

    static readonly STAR_SCALING_FACTOR = 0.018;
    static readonly INDIVIDUAL_DECAY_BASE = 0.125;
    static readonly OVERALL_DECAY_BASE = 0.3;
    static readonly DECAY_WEIGHT = 0.9;
    static readonly STRAIN_STEP = 400;

    async calculate() {
        let diffObjects = await this.generateDifficultyObjects();
        let strains = await this.calculateStrains(diffObjects);
        this.strainDifficulty = await this.calculateDifficulty(strains);
        this.starDifficulty = this.strainDifficulty * Calculator.STAR_SCALING_FACTOR;
    }

    async calculateDifficulty(strains: number[]) {
        let sortedStrains = strains.sort((a, b) => Math.sign(b-a));
        let difficulty = 0;
        let weight = 1;
        for(let strain of sortedStrains) {
            difficulty += weight * strain;
            weight *= Calculator.DECAY_WEIGHT;
        }
        return difficulty;
    }

    async calculateStrains(diffObjects: HitObject[]) {
        let highestStrains: number[] = [];
        let intervalEnd = Calculator.STRAIN_STEP;
        let maxStrain = 0;

        let previous = null;
        for(let diffObject of diffObjects) {
            while(diffObject.startTime > intervalEnd) {
                highestStrains.push(maxStrain);
                if(previous !== null) {
                    let individualDecay = Math.pow(Calculator.INDIVIDUAL_DECAY_BASE, (intervalEnd - previous.startTime) / 1000);
                    let overallDecay = Math.pow(Calculator.OVERALL_DECAY_BASE, (intervalEnd - previous.startTime) / 1000);
                    maxStrain = previous.individualStrains[previous.column] * individualDecay + previous.strain * overallDecay;
                }
                intervalEnd += Calculator.STRAIN_STEP;
            }
            maxStrain = Math.max(maxStrain, diffObject.individualStrains[diffObject.column] + diffObject.strain);
            previous = diffObject;
        }
        return highestStrains;
    }

    async generateDifficultyObjects() {
        let diffObjects = this.beatmap.hitObjects.map(hitObject => new HitObject(hitObject, this.timeRate, this.columns));

        // This is such a bad method
        diffObjects = quickSort(diffObjects);

        let previous = null;
        for(let diffObject of diffObjects) {
            if(previous !== null) {
                diffObject.calculateStrains(previous)
            }
            previous = diffObject;
        }
        return diffObjects;
    }

    get columns() {
        return this.beatmap.Difficulty.CircleSize;
    }

    performance(score: Score) {
        return new PerformanceCalculator(this, score);
    }
}