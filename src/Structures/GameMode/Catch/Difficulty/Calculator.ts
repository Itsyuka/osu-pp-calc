import {BaseDifficultyCalculator} from "../../../BaseDifficultyCalculator";
import {Calculator as PerformanceCalculator} from "../Performance/Calculator";
import {Score} from "../../../Score";
import {hasType} from "../../../../Utils/hasType";
import {Mods} from "../../../../Enums/Mods";
import {HitObject, DECAY_BASE} from "./HitObject";
import {HitType} from "../../../../Enums/HitType";
import {clamp} from "../../../../Utils/Math";

const STRAIN_STEP = 750;
const DECAY_WEIGHT = 0.94;
const STAR_SCALING_FACTOR = 0.145;

export class Calculator extends BaseDifficultyCalculator {

    async calculate() {
        let diffObjects = await this.generateDifficultyObjects();
        let strains = await this.calculateStrains(diffObjects);
        this.aimDifficulty = Math.sqrt(await this.calculateDifficulty(strains));
        this.starDifficulty = this.aimDifficulty * STAR_SCALING_FACTOR;
    }

    async calculateDifficulty(strains: number[]) {
        let sortedStrains = strains.sort((a, b) => Math.sign(b-a));
        let difficulty = 0;
        let weight = 1;
        for(let strain of sortedStrains) {
            difficulty += weight * strain;
            weight *= DECAY_WEIGHT;
        }
        return difficulty;
    }

    async calculateStrains(diffObjects: HitObject[]) {
        let highestStrains = [];
        let intervalEnd = STRAIN_STEP;
        let maxStrain = 0;

        let previous = null;
        for(let diffObject of diffObjects) {
            while(diffObject.startTime > intervalEnd) {
                highestStrains.push(maxStrain);
                if(previous !== null) {
                    let decay = Math.pow(DECAY_BASE, (intervalEnd - previous.startTime) / 1000);
                    maxStrain = previous.strain * decay;
                }
                intervalEnd += STRAIN_STEP;
            }
            maxStrain = Math.max(maxStrain, diffObject.strain);
            previous = diffObject;
        }
        return highestStrains;
    }

    async generateDifficultyObjects() {
        let diffObjects = this.beatmap.hitObjects
            .filter(hitObject => hasType(hitObject.type, HitType.Normal))
            .map(hitObject => new HitObject(hitObject, this.timeRate, this.catcherWidth))
            .sort((a, b) => a.startTime - b.startTime);

        await this.initializeHyperDash(diffObjects);

        let previous = null;
        for(let diffObject of diffObjects) {
            if(previous !== null) {
                await diffObject.calculateStrains(previous);
            }
            previous = diffObject;
        }
        return diffObjects;
    }

    async initializeHyperDash(diffObjects: HitObject[]) {
        let lastDirection = 0;
        let catcherWidthHalf = this.catcherWidth / 2;
        let lastExcess = catcherWidthHalf;

        for(let i = 0; i < diffObjects.length - 1; i++) {
            let currentObject = diffObjects[i];

            let nextObject = diffObjects[i+1];

            let thisDirection = nextObject.object.position.x > currentObject.object.position.x ? 1 : -1;
            let timeToNext = nextObject.object.startTime - currentObject.object.endTime - ((1000 / 60) / 4);
            let distanceToNext = Math.abs(nextObject.object.position.x - currentObject.object.position.x) - (lastDirection === thisDirection ? lastExcess : catcherWidthHalf);

            if(timeToNext < distanceToNext) {
                currentObject.makeHyperDash(nextObject);
                lastExcess = catcherWidthHalf;
            } else {
                currentObject.distanceToHyperDash = timeToNext - distanceToNext;
                lastExcess = clamp(0, catcherWidthHalf, timeToNext - distanceToNext);
            }

            lastDirection = thisDirection;
        }
    }

    get catcherWidth() {
        return 305 * ((512 / 8 * (1 - 0.7 * (this.circleSize - 5) / 5)) / 128) * 0.7;
    }

    get circleSize() {
        let multiplier = 1;
        if(hasType(this.mods, Mods.HardRock)) multiplier *= 1.3;
        if(hasType(this.mods, Mods.Easy)) multiplier *= 0.5;
        let cs = this.beatmap.Difficulty.CircleSize;
        cs *= multiplier;
        cs = Math.max(0, Math.min(10, cs));
        return cs;
    }

    get approachRate() {
        let multiplier = 1;
        if(hasType(this.mods, Mods.HardRock)) multiplier *= 1.4;
        if(hasType(this.mods, Mods.Easy)) multiplier *= 0.5;
        let ar = this.beatmap.Difficulty.ApproachRate;
        ar *= multiplier;
        let arms = ar <= 5 ? (1800 - 120 * ar) : (1200 - 150 * (ar - 5));
        arms = Math.min(1800, Math.max(450, arms));
        arms /= this.timeRate;
        ar = arms > 1200 ? ((-(arms - 1800)) / 120): (5+(-(arms - 1200))/150);
        return ar;
    }

    performance(score: Score) {
        return new PerformanceCalculator(this, score);
    }
}