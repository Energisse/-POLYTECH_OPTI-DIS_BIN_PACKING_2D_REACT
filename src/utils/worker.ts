import { DataSet, Genetique, HillClimbing, Metaheuristique, RecuitSimule, Tabou } from "polytech_opti-dis_bin_packing_2d";
import Bin from "polytech_opti-dis_bin_packing_2d/dist/src/bin";
import { BinPackingSvgs, MetaheuristiqueStatistic } from "../reducers/metaheuristique";
declare var self: DedicatedWorkerGlobalScope;

type MetaheuristiqueState = {
    binPakings: {
        binPacking: Array<{
            bins: Array<{
                x: number;
                y: number;
                width: number;
                height: number;
                id: string;
            }>;
            items: Array<{
                x: number;
                y: number;
                width: number;
                height: number;
                id: number;
            }>;
        }>;
        width: number;
        height: number;
    },
}

//Default event listener
self.addEventListener("message", ({ data: { data, type } }) => {
    self.dispatchEvent(new CustomEvent(type, {
        detail: data
    }));
});

let dataSet: DataSet | null = null;
let algo: Metaheuristique | null = null;

let timeout: NodeJS.Timeout | null = null;

let interval = 100
let iterationCount = 1

DedicatedWorkerGlobalScope.prototype.emit = function (...data) {
    this.postMessage({ type: data[0], data: data[1] });
}

const metaheuristiques = {
    "Recuit simulé": RecuitSimule,
    "Tabou": Tabou,
    "Genetique": Genetique,
    "Hill Climbing": HillClimbing,
}

self.addEventListener("init", ({ detail: { rawDataSet, metaheuristique, config, speed } }) => {
    dataSet = new DataSet(rawDataSet)
    algo = new metaheuristiques[metaheuristique](dataSet, config);
    interval = speed.interval;
    iterationCount = speed.iterationCount;
    self.emit("config", algo.config);
});

self.addEventListener("config", ({ detail }) => {
    if (!algo) throw new Error('metaheuristique is not initialized');
    algo.config = detail;
});

self.addEventListener("start", () => {
    if (!dataSet || !algo) throw new Error('dataSet or metaheuristique is not initialized');
    if (timeout) {
        clearTimeout(timeout);
    }
    let _dataSet = dataSet;
    const _algo = algo;
    run(_dataSet, _algo);
});


self.addEventListener("pause", () => {
    if (timeout) {
        clearTimeout(timeout);
    }
});

self.addEventListener("stop", () => {
    if (timeout) {
        clearTimeout(timeout);
    }
    self.emit("done");
    self.close();
});

self.addEventListener("speed", ({ detail }) => {
    interval = detail.interval;
    iterationCount = detail.iterationCount;
});

function run(dataSet: DataSet, metaheuristique: Metaheuristique) {
    const stats: MetaheuristiqueStatistic[] = [];
    const solutions: BinPackingSvgs[] = [];
    let isFinnished = false;
    for (let i = 0; i < iterationCount; i++) {
        const { value, done } = metaheuristique.run();
        if (done) {
            isFinnished = true;
            break;
        }
        const { solution, iteration } = value;
        const currentSolutions = solution.map((solution, y) => {
            const binPaking: MetaheuristiqueState["binPakings"]["binPacking"][0] = {
                bins: [],
                items: [],
            };


            solution.bins.forEach((bin, i) => {
                let result = draw(
                    bin,
                    i * (dataSet.binWidth) * 1.1,
                    y * (dataSet.binWidth) * 1.1,
                    i.toString()
                );
                binPaking.bins.push(...result.bins);
                binPaking.items.push(...result.items);
            });
            return {
                bins: binPaking.bins.sort((a, b) => parseInt(a.id) - parseInt(b.id)),
                items: binPaking.items.sort((a, b) => a.id - b.id)
            };
        });

        solutions.push({
            binPacking: currentSolutions,
            width: currentSolutions.reduce((acc, { bins }) => Math.max(bins.reduce((acc, bin) => Math.max(acc, bin.x + bin.width), 0), acc), 0),
            height: (currentSolutions.length - 1) * dataSet.binHeight * 1.1 + dataSet.binHeight
        })


        stats.push({
            fitness: solution[0].fitness,
            iteration,
            numberOfBin: solution[0].bins.length
        });
    }
    if (solutions.length && stats.length) {
        self.emit("stats", stats);
        self.emit("solution", solutions)
    }
    if (!isFinnished) {
        timeout = setTimeout(() => {
            run(dataSet, metaheuristique);
        }, interval);
    }
    else {
        self.emit("done");
        self.close();
    }
}

function draw(bin: Bin, d: number, y: number, id: string) {
    const binPaking: MetaheuristiqueState["binPakings"]["binPacking"][0] = {
        bins: [],
        items: [],
    };

    binPaking.bins.push({
        x: bin.x + d,
        y: bin.y + y,
        width: bin.width,
        height: bin.height,
        id,
    });
    if (bin.item) {
        binPaking.items.push({
            x: bin.x + d,
            y: bin.y + y,
            width: bin.item.width,
            height: bin.item.height,
            id: bin.item.id,
        });
    }

    bin.subBins.forEach((item, i) => {
        let result = draw(item, d, y, id + "-" + i);
        binPaking.bins.push(...result.bins);
        binPaking.items.push(...result.items);
    });

    return binPaking;
}

export { };
