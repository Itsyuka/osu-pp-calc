import {Calculator as DifficultyCalculator} from "../Difficulty/Calculator";
import {Mods} from "../../../../Enums/Mods";
import {clamp} from "../../../../Utils/Math";
import {BasePerformanceCalculator} from "../../../BasePerformanceCalculator";

export class Calculator extends BasePerformanceCalculator {
    difficulty: DifficultyCalculator;

    async calculate() {
        let od = this.difficulty.overallDifficulty;
        let ar = this.difficulty.approachRate;
        let circles = this.difficulty.beatmap.countNormal;
        let totalHits = this.score.count300 + this.score.count100 + this.score.count50 + this.score.countMiss;
        let acc = this.accuracyCalc(this.score.count300, this.score.count100, this.score.count50, this.score.countMiss);

        let aimValue = this.baseStrain(this.difficulty.aimDifficulty);
        let totalHitsOver = totalHits / 2000;
        let lengthBonus = 0.95 + 0.4 * Math.min(1.0, totalHitsOver) + (totalHits > 2000 ? Math.log(totalHitsOver) * 0.5 : 0);

        let missPenalty = Math.pow(0.97, this.score.countMiss);

        let comboBreak = Math.pow(this.score.combo, 0.8) / Math.pow(this.difficulty.beatmap.maxCombo, 0.8);

        aimValue *= lengthBonus;
        aimValue *= missPenalty;
        aimValue *= comboBreak;

        let arBonus = 1;
        if(ar > 10.33) {
            arBonus += 0.45 * (ar - 10.33);
        } else if(ar < 8) {
            let lowArBonus = 0.01 * (8 - ar);
            if(this.hasMod(Mods.Hidden)) {
                lowArBonus *= 2;
            }
            arBonus += lowArBonus;
        }

        aimValue *= arBonus;

        if(this.hasMod(Mods.Hidden)) {
            aimValue *= 1.18;
        }

        if(this.hasMod(Mods.Flashlight)) {
            aimValue *= 1.45 * lengthBonus;
        }

        let accBonus = 0.5 + acc / 2;
        let odBonus = 0.98 + Math.pow(od, 2) / 2500;

        aimValue *= accBonus;
        aimValue *= odBonus;
        this.aimValue = aimValue;

        let speedValue = this.baseStrain(this.difficulty.speedDifficulty);
        speedValue *= lengthBonus;
        speedValue *= missPenalty;
        speedValue *= comboBreak;
        speedValue *= accBonus;
        speedValue *= odBonus;

        this.speedValue = speedValue;

        let realAcc = 0;

        if(this.score.scoreVersion === 1) {
            circles = totalHits;
            realAcc = acc;
        } else {
            if(circles) {
                realAcc = ((this.score.count300 - (totalHits - circles)) * 300 + this.score.count100 * 100 + this.score.count50 * 50)/(circles * 300);
            }

            realAcc = Math.max(0.0, realAcc);
        }

        let accValue = Math.pow(1.52163, od) * Math.pow(realAcc, 24) * 2.83;

        accValue *= Math.min(1.15, Math.pow(circles / 1000, 0.3));

        if(this.hasMod(Mods.Hidden)) {
            accValue *= 1.02;
        }

        if(this.hasMod(Mods.Flashlight)) {
            accValue *= 1.02;
        }

        this.accuracyValue = accValue;

        let finalMultiplier = 1.12;

        if(this.hasMod(Mods.NoFail)) {
            finalMultiplier *= 0.90;
        }

        if(this.hasMod(Mods.SpunOut)) {
            finalMultiplier *= 0.95;
        }

        this.totalPerformanceValue = Math.pow(
            Math.pow(aimValue, 1.1) +
            Math.pow(speedValue, 1.1) +
            Math.pow(accValue, 1.1),
            1.0/1.1
        ) * finalMultiplier;
    }

    accuracyCalc(count300, count100, count50, countMiss) {
        let totalHits = count300 + count100 + count50 + countMiss;
        let acc = 0;
        if(totalHits > 0) {
            acc = clamp(0, 1, (count50*50+count100*100+count300*300)/(totalHits*300));
        }
        return acc;
    }

    baseStrain(strain: number) {
        return Math.pow(5*Math.max(1, strain/0.0675) - 4, 3)/100000;
    }
}