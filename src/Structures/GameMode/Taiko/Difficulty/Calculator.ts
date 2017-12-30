import {BaseDifficultyCalculator} from "../../../BaseDifficultyCalculator";
import {Calculator as PerformanceCalculator} from "../Performance/Calculator";
import {Score} from "../../../Score";
import {HitObject} from "./HitObject";

export class Calculator extends BaseDifficultyCalculator {
    static readonly STAR_SCALING_FACTOR = 0.04125;
    static readonly DECAY_WEIGHT = 0.9;
    static readonly STRAIN_STEP = 400;
    static readonly DECAY_BASE = 0.30;

    static readonly COLOR_CHANGE_BONUS = 0.75;

    static readonly RHYTHM_CHANGE_BONUS = 1.0;
    static readonly RHYTHM_CHANGE_BASE_THRESHOLD = 0.2;
    static readonly RHYTHM_CHANGE_BASE = 2.0;

    async calculate() {
        let diffObjects = await this.generateDifficultyObjects();
        let strains = await this.calculateStrains(diffObjects);
        this.strainDifficulty = await this.calculateDifficulty(strains);
        this.starDifficulty = this.strainDifficulty * Calculator.STAR_SCALING_FACTOR;
    }

    async calculateDifficulty(strains: number[]) {
        let sortedStrains = strains.sort((a, b) => b - a);
        let difficulty = 0;
        let weight = 1;
        for(let strain of sortedStrains) {
            difficulty += weight*strain;
            weight *= Calculator.DECAY_WEIGHT;
        }
        return difficulty;
    }

    async calculateStrains(diffObjects: HitObject[]) {
        let highestStrains = [];
        let intervalEnd = Calculator.STRAIN_STEP;
        let maxStrain = 0;

        let previous = null;
        for(let diffObject of diffObjects) {
            while(diffObject.startTime > intervalEnd) {
                highestStrains.push(maxStrain);
                if(previous !== null) {
                    let decay = Math.pow(Calculator.DECAY_BASE, (intervalEnd - previous.startTime)/1000);
                    maxStrain = previous.strain * decay;
                }
                intervalEnd += Calculator.STRAIN_STEP;
            }
            maxStrain = Math.max(maxStrain, diffObject.strain);
            previous = diffObject;
        }

        return highestStrains;
    }

    async generateDifficultyObjects() {
        let diffObjects = this.beatmap.hitObjects
            .map(hitObject => new HitObject(hitObject, this.timeRate))
            .sort((a, b) => a.startTime - b.startTime);

        let previous = null;
        for(let diffObject of diffObjects) {
            if(previous !== null) {
                await diffObject.calculateStrain(previous);
            }
            previous = diffObject;
        }

        return diffObjects;
    }

    performance(score: Score) {
        return new PerformanceCalculator(this, score);
    }
}