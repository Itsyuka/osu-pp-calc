import {Calculator as DifficultyCalculator} from "../Difficulty/Calculator";
import {BasePerformanceCalculator} from "../../../BasePerformanceCalculator";
import {Mods} from "../../../../Enums/Mods";

export class Calculator extends BasePerformanceCalculator {
    difficulty: DifficultyCalculator;

    async calculate() {
        this.totalPerformanceValue = Math.pow(5 * Math.max(1, this.difficulty.starDifficulty / 0.0049) - 4, 2) / 100000;
        let totalComboHits = this.score.count100 + this.score.count300 + this.score.countMiss;
        let lengthBonus = 0.95 + 0.4 * Math.min(1, totalComboHits / 3000) +
            (totalComboHits > 3000 ? Math.log10(totalComboHits / 3000) * 0.5 : 0);
        this.totalPerformanceValue *= lengthBonus;
        this.totalPerformanceValue *= Math.pow(0.97, this.score.countMiss);

        let beatmapMaxCombo = this.difficulty.beatmap.maxCombo;
        if(beatmapMaxCombo > 0) {
            this.totalPerformanceValue *= Math.min(Math.pow(this.score.combo, 0.8) / Math.pow(beatmapMaxCombo, 0.8), 1);
        }

        let ar = this.difficulty.approachRate;
        let arFactor = 1;
        if(ar > 9) {
            arFactor += 0.1 * (ar - 9);
        } else if(ar < 8) {
            arFactor += 0.025 * (8 - ar);
        }

        this.totalPerformanceValue *= arFactor;

        if(this.hasMod(Mods.Hidden)) this.totalPerformanceValue *= 1.05 + 0.075 * (10 - Math.min(10, ar));
        if(this.hasMod(Mods.Flashlight)) this.totalPerformanceValue *= 1.35 * lengthBonus;

        this.totalPerformanceValue *= this.score.accuracy;

        if(this.hasMod(Mods.NoFail)) this.totalPerformanceValue *= 0.9;
        if(this.hasMod(Mods.SpunOut)) this.totalPerformanceValue *= 0.95;
    }
}