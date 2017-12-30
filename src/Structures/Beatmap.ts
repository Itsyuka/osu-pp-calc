import {ParseHitObjects as ParseOsuHitObjects} from "./GameMode/Standard/ParseHitObjects";
import {ParseHitObjects as ParseTaikoHitObjects} from "./GameMode/Taiko/ParseHitObjects";
import {ParseHitObjects as ParseCatchHitObjects} from "./GameMode/Catch/ParseHitObjects";
import {ParseHitObjects as ParseManiaHitObjects} from "./GameMode/Mania/ParseHitObjects";
import {TimingPoint} from "./TimingPoint";
import {ParseTimingPoints} from "./ParseTimingPoints";
import {HitType} from "../Enums/HitType";
import {PlayMode} from "../Enums/PlayMode";
import {Calculator as StandardDifficultyCalculator} from "./GameMode/Standard/Difficulty/Calculator";
import {Calculator as TaikoDifficultyCalculator} from "./GameMode/Taiko/Difficulty/Calculator";
import {Calculator as CatchDifficultyCalculator} from "./GameMode/Catch/Difficulty/Calculator";
import {Calculator as ManiaDifficultyCalculator} from "./GameMode/Mania/Difficulty/Calculator";
import {Mods} from "../Enums/Mods";
const REG_HEADER = /^\s*\[(.+?)\]\s*$/;
const REG_PROP = /^\s*([^#].*?)\s*:\s*(.*?)\s*$/;

export class Beatmap {
    version: number = 0;
    General = {
        AudioFilename: '',
        AudioLeadIn: 0,
        PreviewTime: 0,
        Countdown: 0,
        SampleSet: '',
        StackLeniency: 0,
        Mode: 0,
        LetterboxInBreaks: 0,
        WidescreenStoryboard: 0
    };
    Difficulty = {
        HPDrainRate: 0,
        CircleSize: 0,
        OverallDifficulty: 0,
        ApproachRate: 0,
        SliderMultiplier: 0,
        SliderTickRate: 0,
    };
    Editor = {
        DistanceSpacing: 0,
        BeatDivisor: 0,
        GridSize: 0,
        TimelineZoom: 0,
    };
    Metadata = {
        Title: '',
        TitleUnicode: '',
        Artist: '',
        ArtistUnicode: '',
        Creator: '',
        Version: '',
        Source: '',
        Tags: '',
        BeatmapID: 0,
        BeatmapSetID: 0
    };
    hitObjects: any[] = [];
    timingPoints: TimingPoint[] = [];

    /**
     * Reads a file from given path and returns a Beatmap class
     * @param {string} body
     * @returns {Promise<Beatmap>}
     */
    static async read(body: string|Buffer): Promise<Beatmap> {
        let content: string = (body instanceof Buffer) ? body.toString() : body;
        let beatmap = new Beatmap();
        let currentHeader: string;
        let hitObjectLines: string[] = []; // Save these for last
        let timingPointLines: string[] = []; // Save these for last
        for(let line of content.split('\n')) {
            let match;
            line = line.trim();
            if(line.startsWith('\\')) continue;
            if(!line) continue;
            if(!currentHeader && line.includes('osu file format')) { // First line, can't be anywhere else
                beatmap.version = parseInt(line.split('osu file format v')[1].trim());
                continue;
            }
            if(match = line.match(REG_HEADER)) {
                currentHeader = match[1].toString();
                continue;
            }
            if(['General', 'Editor', 'Metadata', 'Difficulty'].indexOf(currentHeader) !== -1) {
                if(match = line.match(REG_PROP)) {
                    if(!(beatmap[currentHeader][match[1]])) {
                        beatmap[currentHeader][match[1]] = typeof beatmap[currentHeader][match[1]] === 'number' ? parseFloat(match[2]) : match[2];
                    }
                }
                continue;
            }
            if(currentHeader === 'HitObjects') {
                hitObjectLines.push(line);
                continue;
            }
            if(currentHeader === 'TimingPoints') {
                timingPointLines.push(line);
            }
        }

        beatmap.timingPoints = await ParseTimingPoints(timingPointLines);
        switch(beatmap.General.Mode) {
            case PlayMode.standard:
                beatmap.hitObjects = await ParseOsuHitObjects(hitObjectLines, beatmap);
                break;
            case PlayMode.taiko:
                beatmap.hitObjects = await ParseTaikoHitObjects(hitObjectLines, beatmap);
                break;
            case PlayMode.ctb:
                beatmap.hitObjects = await ParseCatchHitObjects(hitObjectLines, beatmap);
                break;
            case PlayMode.mania:
                beatmap.hitObjects = await ParseManiaHitObjects(hitObjectLines, beatmap);
                break;
        }

        let parentPoint = beatmap.timingPoints.find(timingPoint => !timingPoint.isInherited);

        for(const timingPoint of beatmap.timingPoints) {
            if(!timingPoint.isInherited) {
                parentPoint = timingPoint;
            }
            for(let hitObject of beatmap.hitObjects.filter(hitObject => hitObject.startTime >= timingPoint.time)) {
                await hitObject.finalize(timingPoint, parentPoint, beatmap);
            }
        }

        return beatmap;
    }

    get countNormal() {
        return this.hitObjects.filter(hit => (hit.type & HitType.Normal) > 0).length
    }

    get countSlider() {
        return this.hitObjects.filter(hit => (hit.type & HitType.Slider) > 0).length
    }

    get countSpinner() {
        return this.hitObjects.filter(hit => (hit.type & HitType.Spinner) > 0).length
    }

    get countObjects() {
        return this.hitObjects.length;
    }

    get maxCombo() {
        return this.hitObjects.map(hit => hit.combo).reduce((a,b) => a+b, 0);
    }

    difficultyCalculator(mods: Mods) {
        switch(this.General.Mode) {
            case 0:
                return new StandardDifficultyCalculator(this, mods);
            case 1:
                return new TaikoDifficultyCalculator(this, mods);
            case 2:
                return new CatchDifficultyCalculator(this, mods);
            case 3:
                return new ManiaDifficultyCalculator(this, mods);
            default:
                return null;
        }
    }

    toJSON() {
        return {
            version: this.version,
            General: this.General,
            Difficulty: this.Difficulty,
            Editor: this.Editor,
            Metadata: this.Metadata,
            countNormal: this.countNormal,
            countSlider: this.countSlider,
            countSpinner: this.countSpinner,
            countObjects: this.countObjects,
            maxCombo: this.maxCombo,
            hitObjects: this.hitObjects,
            timingPoints: this.timingPoints,
        }
    }
}