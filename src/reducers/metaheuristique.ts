import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DataSet, GenetiqueConfig, HillClimbingConfig, RecuitSimuleConfig, TabouConfig } from 'polytech_opti-dis_bin_packing_2d';
import { RootState } from '../store';

Worker.prototype.emit = function (...data) {
    this.postMessage({ type: data[0], data: data[1] });
}

export const metaheuristiques = ["Recuit simulé", "Tabou", "Genetique", "Hill Climbing"] as const
export type Metaheuristiques = typeof metaheuristiques[number];

export type MetaheuristiqueConfigs = TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig
export type MetaheuristiqueStatistic = {
    iteration: number,
    fitness: number,
    numberOfBin: number
}

export type BinPackingSvgs = {
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

interface MetaheuristiqueState {
    current: number,
    metaheuristiques: Array<{
        metaheuristique: Metaheuristiques
        dataSet: DataSet | null,
        speed: {
            interval: number,
            iterationCount: number
        },
        state: "idle" | "running" | "paused" | "finished",
        config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig,
        fitness: MetaheuristiqueStatistic[],
        binPakings: BinPackingSvgs
        test: string,
    }>
}

const initialState = {
    current: -1,
    metaheuristiques: []
} satisfies MetaheuristiqueState as MetaheuristiqueState

const workers: Worker[] = [];


export const stop = createAsyncThunk<any, { id: number }, { state: RootState }>('stop', ({ id }, thunkAPI) => {
    workers[id].emit("stop")
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState({ id, state: "idle" }))
})

export const pause = createAsyncThunk<any, { id: number }, { state: RootState }>('pause', ({ id }, thunkAPI) => {
    workers[id].emit("pause")
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState({ id, state: "paused" }))
})

export const start = createAsyncThunk<any, { id: number }, { state: RootState }>('start', ({ id }, thunkAPI) => {
    thunkAPI.dispatch(methaeuristiqueSlice.actions.setState({ id, state: "running" }))
    workers[id].emit("start")
})

const methaeuristiqueSlice = createSlice({
    name: 'rootReducer',
    initialState,
    reducers: {
        setSpeed(state, { payload: { id, ...speed } }: PayloadAction<{
            id: number,
            interval: number,
            iterationCount: number
        }>) {
            state.metaheuristiques[id].speed = speed
            workers[id].emit("speed", speed)
        },

        setState(state, { payload: { id, state: _state } }: PayloadAction<{
            id: number,
            state: "idle" | "running" | "paused" | "finished"
        }>) {
            if ((state.metaheuristiques[id].state === "idle" || state.metaheuristiques[id].state === "finished") && _state === "running") {
                state.metaheuristiques[id].fitness = []
            }
            state.metaheuristiques[id].state = _state
        },

        addFitness(state, { payload: { id, stats } }: PayloadAction<{
            id: number,
            stats: Array<{
                iteration: number,
                fitness: number,
                numberOfBin: number
            }>
        }>) {
            stats.forEach((value) => {
                // Remove last element if it's the same as the one we want to add
                if (state.metaheuristiques[id].fitness.length >= 2) {
                    const last = state.metaheuristiques[id].fitness.at(-1)!
                    const beforeLast = state.metaheuristiques[id].fitness.at(-2)!
                    if (last.fitness === beforeLast.fitness && last.numberOfBin === beforeLast.numberOfBin && value.fitness === last.fitness && value.numberOfBin === last.numberOfBin) {
                        state.metaheuristiques[id].fitness.at(-1)!.iteration = value.iteration
                        return
                    }
                }
                state.metaheuristiques[id].fitness.push(value)
            })
        },
        setConfig(state, { payload: { id, config } }: PayloadAction<{
            id: number,
            config: MetaheuristiqueConfigs
        }>) {
            state.metaheuristiques[id].config = config
        },
        editConfig(state, { payload: { id, config } }: PayloadAction<{
            id: number,
            config: MetaheuristiqueConfigs
        }>) {
            workers[id].emit("config", config)
            state.metaheuristiques[id].config = config
        },
        setItems(state, { payload: { id, items } }: PayloadAction<{
            id: number,
            items: BinPackingSvgs[]
        }>) {
            state.metaheuristiques[id].binPakings = items.at(-1)!;
        },
        setCurrent(state, { payload: { id } }: PayloadAction<{
            id: number
        }>) {
            state.current = id
        },
        createSolition(state, { payload: { fileContent, metaheuristique } }: PayloadAction<{
            fileContent: string,
            metaheuristique: Metaheuristiques,
        }>) {
            state.metaheuristiques.push({
                metaheuristique: metaheuristique,
                speed: {
                    interval: 1000,
                    iterationCount: 1
                },
                dataSet: new DataSet(fileContent),
                state: "idle",
                fitness: [],
                binPakings: {
                    binPacking: [],
                    width: 0,
                    height: 0
                },
                test: fileContent,
            })
            state.current = state.metaheuristiques.length - 1
            createWorker(state.metaheuristiques.length - 1)
        },
        removeSolition(state, { payload: { id } }: PayloadAction<{
            id: number
        }>) {
            if (state.current >= id) {
                state.current--
            }

            state.metaheuristiques.splice(id, 1)
            workers[id].terminate()
            workers.splice(id, 1)
        }
    }
})

function createWorker(id: number) {
    import("../store").then(({ default: store }) => {
        const worker = new Worker(new URL("../utils/worker.ts", import.meta.url))
        workers[id] = worker

        if (store.getState().metaheuristique.metaheuristiques[id].dataSet && store.getState().metaheuristique.metaheuristiques[id].metaheuristique) {
            worker.emit("init", {
                dataSet: store.getState().metaheuristique.metaheuristiques[id].test,
                metaheuristique: store.getState().metaheuristique.metaheuristiques[id].metaheuristique,
                config: store.getState().metaheuristique.metaheuristiques[id].config,
                speed: store.getState().metaheuristique.metaheuristiques[id].speed
            })
        }

        worker.addEventListener("config", (e) => {
            store.dispatch(methaeuristiqueSlice.actions.setConfig({
                id,
                config: e.detail
            }))
        })

        worker.addEventListener("stats", ({ detail }) => {
            store.dispatch(methaeuristiqueSlice.actions.addFitness({
                id,
                stats: detail
            }))
        })

        worker.addEventListener("message", ({ data: { data, type } }) => {
            worker.dispatchEvent(new CustomEvent(type, {
                detail: data
            }));
        })

        worker.addEventListener("solution", ({ detail }) => {
            store.dispatch(methaeuristiqueSlice.actions.setItems({
                id,
                items: detail
            }))
        })

        worker.addEventListener("done", () => {
            store.dispatch(methaeuristiqueSlice.actions.setState({
                id,
                state: "finished"
            }))
            worker.terminate()
            createWorker(id)
        })
    })
}


export const {
    setSpeed,
    editConfig,
    setState,
    createSolition,
    setCurrent,
    removeSolition
} = methaeuristiqueSlice.actions
export default methaeuristiqueSlice.reducer