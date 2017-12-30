import {Calculator as DifficultyCalculator} from "../Difficulty/Calculator";
import {Mods} from "../../../../Enums/Mods";
import {BasePerformanceCalculator} from "../../../BasePerformanceCalculator";

export class Calculator extends BasePerformanceCalculator {
    difficulty: DifficultyCalculator;

    async calculate() {
        this.strainValue = await this.calculateStrain();
        this.accuracyValue = await this.calculateAccuracy();

        let multiplier = 1.1;
        if(this.hasMod(Mods.NoFail)) multiplier *= 0.9;
        if(this.hasMod(Mods.SpunOut)) multiplier *= 0.95;
        if(this.hasMod(Mods.Easy)) multiplier *= 0.5;

        this.totalPerformanceValue = Math.pow(Math.pow(this.strainValue, 1.1) + Math.pow(this.accuracyValue, 1.1), 1/1.1) * multiplier;
    }

    async calculateAccuracy() {
        let od = Math.min(10, Math.max(0, 10 - this.difficulty.overallDifficulty));
        let hitWindow = (34+3*od);
        if(hitWindow <= 0) {
            return 0;
        }

        let accuracyValue = Math.pow(150 / hitWindow * Math.pow(this.score.accuracy, 16), 1.8) * 2.5;
        accuracyValue *= Math.min(1.15, Math.pow(this.difficulty.beatmap.countObjects / 1500, 0.3));
        return accuracyValue;
    }

    async calculateStrain() {
        let actualScore = Math.round(this.score.score * (1 / this.scoreMultiplier()));

        let strainValue = Math.pow(5 * Math.max(1, this.difficulty.starDifficulty/0.0825) - 4, 3)/110000;
        strainValue *= 1 + 0.1*Math.min(1, this.difficulty.beatmap.countObjects / 1500);

        if(actualScore <= 500000) {
            strainValue *= actualScore / 500000 * 0.1;
        } else if(actualScore <= 600000) {
            strainValue *= 0.1 + (actualScore - 500000) / 100000 * 0.2;
        } else if(actualScore <= 700000) {
            strainValue *= 0.3 + (actualScore - 600000) / 100000 * 0.35;
        } else if(actualScore <= 800000) {
            strainValue *= 0.65 + (actualScore - 700000) / 100000 * 0.2;
        } else if(actualScore <= 900000) {
            strainValue *= 0.85 + (actualScore - 800000) / 100000 * 0.1;
        } else {
            strainValue *= 0.95 + (actualScore - 900000) / 100000 * 0.05;
        }

        return strainValue;
    }

    scoreMultiplier() {
        let multiplier = 1;
        if(this.hasMod(Mods.NoFail)) multiplier *= 0.5;
        if(this.hasMod(Mods.HalfTime)) multiplier *= 0.5;
        return multiplier;
    }
}