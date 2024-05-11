import type { Middleware, PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { GenetiqueConfig, HillClimbingConfig, RecuitSimuleConfig, TabouConfig } from 'polytech_opti-dis_bin_packing_2d';
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

export interface MetaheuristiqueState {
    current: number,
    metaheuristiques: Array<{
        metaheuristique: Metaheuristiques
        rawDataSet?: string,
        speed: {
            interval: number,
            iterationCount: number
        },
        state: "idle" | "running" | "paused" | "finished",
        config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig,
        statistic: MetaheuristiqueStatistic[],
        binPakings: BinPackingSvgs
    }>
}

const initialState = {
    current: -1,
    metaheuristiques: []
} satisfies MetaheuristiqueState as MetaheuristiqueState

const workers: Worker[] = [];

// Middleware personnalisé pour recréer les workers lors de la rehydration
export const rehydrateMiddleware: any = (store: RootState) => (next: (action: PayloadAction<RootState>) => any) => (action: PayloadAction<RootState>) => {
    if (action.type === 'persist/REHYDRATE') {
        console.log(action)
        action.payload.metaheuristique.metaheuristiques.forEach((_, id) => {
            createWorker(id)
        })
    }

    return next(action);
};


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
                state.metaheuristiques[id].statistic = []
            }
            switch (_state) {
                case "running":
                    workers[id].emit("start")
                    break
                case "paused":
                    workers[id].emit("pause")
                    break
                case "finished":
                    workers[id].emit("stop")
                    break
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
                state.metaheuristiques[id].statistic.push(value)
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
        createSolition(state, { payload: { rawDataSet, metaheuristique } }: PayloadAction<{
            rawDataSet: string,
            metaheuristique: Metaheuristiques,
        }>) {
            state.metaheuristiques.push({
                metaheuristique: metaheuristique,
                speed: {
                    interval: 1000,
                    iterationCount: 1
                },
                rawDataSet: rawDataSet,
                state: "idle",
                statistic: [],
                binPakings: {
                    binPacking: [],
                    width: 0,
                    height: 0
                },
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
    ,
})

function createWorker(id: number) {
    import("../store").then(({ default: store }) => {
        const worker = new Worker(new URL("../utils/worker.ts", import.meta.url))
        workers[id] = worker

        const { rawDataSet, metaheuristique, config, speed } = store.getState().metaheuristique.metaheuristiques[id]

        if (rawDataSet && metaheuristique) {
            worker.emit("init", {
                rawDataSet,
                metaheuristique,
                config,
                speed
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

export const selectAllStatistic = createSelector(
    [(state: RootState) => state.metaheuristique.metaheuristiques],
    (metaheuristiques) => {
        const resultat: {
            iteration: number,
            solutions: {
                fitness: number,
                numberOfBin: number
            }[]
        }[] = []
        metaheuristiques.forEach(({ statistic }) => {
            statistic.forEach(({ iteration, ...stats }) => {
                if (!resultat[iteration - 1]) {
                    resultat[iteration - 1] = {
                        iteration,
                        solutions: []
                    }
                }
                resultat[iteration - 1].solutions.push(stats)
            })
        })
        return resultat
    }
);