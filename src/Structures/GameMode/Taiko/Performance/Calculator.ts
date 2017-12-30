import {Calculator as DifficultyCalculator} from "../Difficulty/Calculator";
import {BasePerformanceCalculator} from "../../../BasePerformanceCalculator";
import {Mods} from "../../../../Enums/Mods";

export class Calculator extends BasePerformanceCalculator {
    difficulty: DifficultyCalculator;

    async calculate() {
        this.strainValue = await this.calculateStrain();
        this.accuracyValue = await this.calculateAccuracy();

        let multiplier = 1.1;
        if(this.hasMod(Mods.NoFail)) multiplier *= 0.9;
        if(this.hasMod(Mods.Hidden)) multiplier *= 1.1;

        this.totalPerformanceValue = Math.pow(Math.pow(this.strainValue, 1.1) + Math.pow(this.accuracyValue, 1.1), 1/1.1)*multiplier;
    }

    async calculateAccuracy() {
        let perfectHitWindow = (()=>{
            let od = this.difficulty.overallDifficulty;
            if(this.hasMod(Mods.Easy)) od = Math.max(0, od*0.5);
            if(this.hasMod(Mods.HardRock)) od = Math.min(10, od*1.4);
            return (od > 5) ? (35 + (20 - 35) * (od - 5) / 5) :
                (od < 5) ? (35 - (35 - 50) * (5 - od) / 5) :
                    35;
        })()/this.difficulty.timeRate;
        if(perfectHitWindow <= 0) {
            return 0;
        }

        let accuracyValue = Math.pow(150 / perfectHitWindow, 1.1) * Math.pow(this.accuracy(), 15)*22;
        return accuracyValue*Math.min(1.15, Math.pow(this.totalHits() / 1500, 0.3));
    }

    async calculateStrain() {
        let strainValue = Math.pow(5 * Math.max(1, this.difficulty.starDifficulty / 0.0075) - 4, 2)/100000;
        let lengthBonus = 1 + 0.1 * Math.min(1, this.totalHits() / 1500);
        strainValue *= lengthBonus;

        strainValue *= Math.pow(0.985, this.score.countMiss);

        let maxCombo = this.difficulty.beatmap.maxCombo;

        if(maxCombo > 0) strainValue *= Math.min(Math.pow(this.score.combo, 0.5)/Math.pow(maxCombo, 0.5), 1);
        if(this.hasMod(Mods.Hidden)) strainValue *= 1.025;
        if(this.hasMod(Mods.Flashlight)) strainValue *= 1.05 * lengthBonus;

        return strainValue*this.accuracy();
    }

    accuracy(): number {
        if(this.totalHits() === 0) {
            return 0;
        }

        return Math.min(1, Math.max(0, this.score.count100 * 150 + this.score.count300 * 300) / this.totalHits() * 300);
    }

    totalSuccessfulHits() {
        return this.score.count300+this.score.count100+this.score.count50;
    }

    totalHits() {
        return this.score.count300+this.score.count100+this.score.count50+this.score.countMiss;
    }
}