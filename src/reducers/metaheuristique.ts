import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DataSet, Genetique, GenetiqueConfig, HillClimbing, HillClimbingConfig, Metaheuristique, RecuitSimule, RecuitSimuleConfig, Tabou, TabouConfig } from 'polytech_opti-dis_bin_packing_2d';
import Bin from 'polytech_opti-dis_bin_packing_2d/dist/src/bin';
import { RootState } from '../store';

export const metaheuristiques = ["Recuit simulé", "Tabou", "Genetique", "Hill Climbing"] as const
export type Metaheuristiques = typeof metaheuristiques[number];

const paddingPercent = 1.1;

interface MetaheuristiqueState {
    metaheuristique: Metaheuristiques
    dataSet: DataSet | null,
    speed: {
        interval: number,
        iterationCount: number
    },
    state: "idle" | "running" | "paused" | "finished",
    config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig,
    fitness: Array<{
        iteration: number,
        fitness: number,
        numberOfBin: number
    }>,
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
    }
}

const initialState = {
    metaheuristique: "Tabou",
    speed: {
        interval: 1000,
        iterationCount: 1
    },
    dataSet: null,
    state: "idle",
    fitness: [],
    binPakings: {
        binPacking: [],
        width: 0,
        height: 0
    }

} satisfies MetaheuristiqueState as MetaheuristiqueState

let metaheuristique: Metaheuristique | null = null
let interval: NodeJS.Timer | null = null

export const stop = createAsyncThunk<any, void, { state: RootState }>('stop', (params, thunkAPI) => {
    clearTimeout(interval!)
    metaheuristique = null
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState("idle"))
})

export const pause = createAsyncThunk<any, void, { state: RootState }>('pause', (params, thunkAPI) => {
    clearTimeout(interval!)
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState("paused"))
})

export const start = createAsyncThunk<any, void, { state: RootState }>('start', (params, thunkAPI) => {
    clearTimeout(interval!)
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState("running"))

    if (!metaheuristique) metaheuristique = createAlgo(thunkAPI.getState().metaheuristique.dataSet, thunkAPI.getState().metaheuristique.metaheuristique)
    run()

    function run() {
        if (!metaheuristique) return
        const start = performance.now()
        const dataSet = thunkAPI.getState().metaheuristique.dataSet
        if (!dataSet) return;
        const stats: Parameters<typeof addFitness>[0] = []
        let solutions: MetaheuristiqueState["binPakings"]["binPacking"] = []
        for (let i = 0; i < thunkAPI.getState().metaheuristique.speed.iterationCount; i++) {
            const { value, done } = metaheuristique.run()

            if (done) {
                thunkAPI.dispatch(methaeuristiqueSlice.actions.setState("finished"))
                metaheuristique = null
                break
            }
            else {
                stats.push({
                    iteration: value.iteration,
                    fitness: value.solution[0].fitness,
                    numberOfBin: value.solution[0].bins.length
                })
                solutions = value.solution.map((solution, y) => {
                    const binPaking: MetaheuristiqueState["binPakings"]["binPacking"][0] = {
                        bins: [],
                        items: [],
                    };

                    solution.bins.forEach((bin, i) => {
                        let result = draw(
                            bin,
                            i * (dataSet.binWidth) * paddingPercent,
                            y * (dataSet.binWidth) * paddingPercent,
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

            }
        }
        thunkAPI.dispatch(methaeuristiqueSlice.actions.setItems({
            binPacking: solutions,
            width: solutions.reduce((acc, { bins }) => Math.max(bins.reduce((acc, bin) => Math.max(acc, bin.x + bin.width), 0), acc), 0),
            height: (solutions.length - 1) * dataSet.binHeight * paddingPercent + dataSet.binHeight
        }))
        thunkAPI.dispatch(addFitness(stats))
        interval = setTimeout(() => {
            run()
        }, thunkAPI.getState().metaheuristique.speed.interval - (performance.now() - start))
    }

    interval = setTimeout(() => {

    }, thunkAPI.getState().metaheuristique.speed.interval)

    return {}
})


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


const methaeuristiqueSlice = createSlice({
    name: 'rootReducer',
    initialState,
    reducers: {
        setAlgo(state, action: PayloadAction<Metaheuristiques>) {
            state.metaheuristique = action.payload
            state.fitness = []
            metaheuristique = createAlgo(state.dataSet, state.metaheuristique, state.config)
            if (metaheuristique) state.config = metaheuristique.config
        },
        setFileContent(state, action: PayloadAction<string>) {
            state.dataSet = new DataSet(action.payload)
            state.fitness = []
            metaheuristique = createAlgo(state.dataSet, state.metaheuristique, state.config)
            if (metaheuristique) state.config = metaheuristique.config
        },
        setSpeed(state, action: PayloadAction<{
            interval: number,
            iterationCount: number
        }>) {
            state.speed = action.payload
        },
        setState(state, action: PayloadAction<"idle" | "running" | "paused" | "finished">) {
            if ((state.state === "idle" || state.state === "finished") && action.payload === "running") {
                state.fitness = []
            }
            state.state = action.payload
        },
        addFitness(state, action: PayloadAction<{
            iteration: number,
            fitness: number,
            numberOfBin: number
        }[]>) {
            action.payload.forEach((value) => {
                // Remove last element if it's the same as the one we want to add
                if (state.fitness.length >= 2) {
                    const last = state.fitness.at(-1)!
                    const beforeLast = state.fitness.at(-2)!
                    if (last.fitness === beforeLast.fitness && last.numberOfBin === beforeLast.numberOfBin && value.fitness === last.fitness && value.numberOfBin === last.numberOfBin) {
                        state.fitness.at(-1)!.iteration = value.iteration
                        return
                    }
                }
                state.fitness.push(value)
            })
        },
        setConfig(state, action: PayloadAction<TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig>) {
            state.config = action.payload
            if (metaheuristique) metaheuristique.config = action.payload
        },
        setItems(state, action: PayloadAction<MetaheuristiqueState["binPakings"]>) {
            state.binPakings = action.payload
        }
    },
})


function createAlgo(dataSet: DataSet | null, metaheuristique: Metaheuristiques | null, config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig) {
    if (dataSet === null || metaheuristique === null) {
        return null
    }
    switch (metaheuristique) {
        case "Recuit simulé":
            return new RecuitSimule(dataSet, config)
        case "Tabou":
            return new Tabou(dataSet, config)
        case "Genetique":
            return new Genetique(dataSet, config)
        case "Hill Climbing":
            return new HillClimbing(dataSet, config)
    }
}


export const {
    setAlgo,
    setFileContent,
    setSpeed,
    addFitness,
    setConfig,
} = methaeuristiqueSlice.actions
export default methaeuristiqueSlice.reducer