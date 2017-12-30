import {Mods} from "../../../../Enums/Mods";
import {hasType} from "../../../../Utils/hasType";
import {BaseDifficultyCalculator} from "../../../BaseDifficultyCalculator";
import {Calculator as  PerformanceCalculator} from "../Performance/Calculator";
import {Score} from "../../../Score";
import {HitObject} from "./HitObject";

export class Calculator extends BaseDifficultyCalculator {
    static readonly DECAY_BASE = [0.3, 0.15];
    static readonly WEIGHT_SCALING = [1400, 26.25];
    static readonly STAR_SCALING_FACTOR = 0.0675;
    static readonly EXTREME_SCALING_FACTOR = 0.5;
    static readonly PLAYFIELD_WIDTH = 512;
    static readonly DECAY_WEIGHT = 0.9;

    static readonly ALMOST_DIAMETER = 90;
    static readonly STREAM_SPACING = 110;
    static readonly SINGLE_SPACING = 125;

    static readonly STRAIN_STEP = 400;

    static readonly CIRCLE_SIZE_BUFF_THRESHOLD = 30;

    static readonly DIFF_SPEED = 0;
    static readonly DIFF_AIM = 1;

    async calculate(): Promise<any> {
        let diffObjects = await this.generateDifficultyObjects();
        let aimStrainsOG = await this.calculateStrains(diffObjects, Calculator.DIFF_AIM);
        let speedStrainsOG = await this.calculateStrains(diffObjects, Calculator.DIFF_SPEED);

        this.aimDifficulty = await this.calculateDifficulty(aimStrainsOG);
        this.speedDifficulty = await this.calculateDifficulty(speedStrainsOG);
        this.strainDifficulty = this.aimDifficulty + this.speedDifficulty;

        this.starDifficulty = this.strainDifficulty + Math.abs(this.speedDifficulty - this.aimDifficulty) * Calculator.EXTREME_SCALING_FACTOR;
    }

    async calculateStrains(diffObjects: HitObject[], difficultyType: number) {
        let highestStrains = [];
        let intervalEnd = Calculator.STRAIN_STEP;
        let maxStrain = 0;

        let previous: HitObject = null;
        for(let diffObject of diffObjects) {
            while(diffObject.startTime > intervalEnd) {
                highestStrains.push(maxStrain);
                if(previous !== null) {
                    let decay = Math.pow(Calculator.DECAY_BASE[difficultyType], (intervalEnd - previous.startTime)/1000);
                    maxStrain = previous.strains[difficultyType]*decay;
                }
                intervalEnd += Calculator.STRAIN_STEP;
            }
            maxStrain = Math.max(maxStrain, diffObject.strains[difficultyType]);
            previous = diffObject;
        }
        return highestStrains;
    }

    async calculateDifficulty(strains: number[]) {
        let difficulty = 0;
        let weight = 1;
        let sorted = strains.sort((a, b) => b - a);
        for(const strain of sorted) {
            difficulty += weight*strain;
            weight *= Calculator.DECAY_WEIGHT;
        }

        return Math.sqrt(difficulty)*Calculator.STAR_SCALING_FACTOR;
    }

    async generateDifficultyObjects() {
        let radius = (Calculator.PLAYFIELD_WIDTH/16)*(1 - 0.7*(this.circleSize - 5) / 5);
        let diffHitObjects = this.beatmap.hitObjects
            .map((hitObject) => new HitObject(hitObject, this.timeRate, radius))
            .sort((a,b) => a.startTime - b.startTime);
        let previous = null;
        for(const diffHitObject of diffHitObjects) {
            if(previous !== null) {
                await diffHitObject.calculateStrains(previous);
            }
            previous = diffHitObject;
        }
        return diffHitObjects;
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

    get overallDifficulty() {
        let multiplier = 1;
        if(hasType(this.mods, Mods.HardRock)) multiplier *= 1.4;
        if(hasType(this.mods, Mods.Easy)) multiplier *= 0.5;
        let od = this.beatmap.Difficulty.OverallDifficulty;
        od *= multiplier;
        let odms = 79.5 - Math.ceil(6 * od);
        odms = Math.min(79.5, Math.max(19.5, odms));
        odms /= this.timeRate;
        od = (79.5 - odms) / 6;
        return od;
    }

    get hpDrainRate() {
        let multiplier = 1;
        if(hasType(this.mods, Mods.HardRock)) multiplier *= 1.4;
        if(hasType(this.mods, Mods.Easy)) multiplier *= 0.5;
        let hp = this.beatmap.Difficulty.HPDrainRate;
        return Math.min(hp*multiplier, 10);
    }

    performance(score: Score) {
        return new PerformanceCalculator(this, score);
    }
}