# Osu Performance Calculator

### Example

```javascript
const request = require('request-promise');
const {Beatmap, Mods, Score} = require('osu-pp-calc');

async function main() {
	const beatmapOsu = await request.get(`https://osu.ppy.sh/osu/869222`);
	const beatmap = await Beatmap.read(beatmapOsu);
	const diffCalc = beatmap.difficultyCalculator(Mods.None);
	await diffCalc.calculate();
	const score = Score.from(beatmap);
	const ppCalc = diffCalc.performance(score);
	await ppCalc.calculate();
	console.log(
		'Calculated PP:', ppCalc.totalPerformanceValue.toFixed(2)
	);
}

main().then(e => proccess.exit()).catch(e => console.error(e))
```


### License

Check the LICENSE file
