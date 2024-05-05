import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { DataSet, Genetique, GenetiqueConfig, HillClimbing, HillClimbingConfig, Metaheuristique, RecuitSimule, RecuitSimuleConfig, Tabou, TabouConfig } from 'polytech_opti-dis_bin_packing_2d';

export const metaheuristiques = ["Recuit simulé", "Tabou", "Genetique", "Hill Climbing"] as const
export type Metaheuristiques = typeof metaheuristiques[number];

interface RootState {
    metaheuristique: Metaheuristiques
    algo: Metaheuristique | null,
    dataSet: DataSet | null,
    speed: number
    state: "idle" | "running" | "paused" | "finished",
    config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig,
    fitness: Array<{
        iteration: number,
        fitness: number,
        numberOfBin: number
    }>,
    darkMode: boolean
}

const initialState = { 
    metaheuristique: "Tabou",
    algo: null,
    speed:1000,
    dataSet: null,
    state: "idle",
    fitness: [],
    darkMode: true,

} satisfies RootState as RootState

const counterSlice = createSlice({
  name: 'rootReducer',
  initialState,
  reducers: {
    setAlgo(state, action: PayloadAction<Metaheuristiques>) {
        
        state.metaheuristique = action.payload
        state.algo = createAlgo(state.dataSet,state.metaheuristique,state.config)
        state.fitness = []
       
    },
    setFileContent(state, action: PayloadAction<string>) {
        state.dataSet = new DataSet(action.payload)
        state.algo = createAlgo(state.dataSet,state.metaheuristique,state.config)
    },
    setSpeed(state, action: PayloadAction<number>) {
        state.speed = action.payload
    },
    setState(state, action: PayloadAction<"idle" | "running" | "paused"| "finished">) {
        if((state.state === "idle" || state.state === "finished") &&  action.payload === "running"){
            state.fitness = []
            state.algo = createAlgo(state.dataSet,state.metaheuristique,state.config)
        }
        state.state = action.payload
    },
    addFitness(state, action: PayloadAction<{
        iteration: number,
        fitness: number,
        numberOfBin: number
    }>) {
        // Remove last element if it's the same as the one we want to add
        if(state.fitness.length >= 2){ 
            const last = state.fitness.at(-1)!
            const beforeLast = state.fitness.at(-2)!
            if(last.fitness === beforeLast.fitness && last.numberOfBin === beforeLast.numberOfBin  && action.payload.fitness === last.fitness && action.payload.numberOfBin === last.numberOfBin){
                state.fitness.at(-1)!.iteration = action.payload.iteration
                return
            }
        }
        state.fitness.push(action.payload)
    },
    setConfig(state, action: PayloadAction<TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig>) {
        state.config = action.payload
        if(state.algo)state.algo.config = action.payload
    },
    setDarkMode(state, action: PayloadAction<boolean>){
        state.darkMode = action.payload
    },
  },
})

function createAlgo(dataSet: DataSet | null,metaheuristique: Metaheuristiques| null,config?: TabouConfig | GenetiqueConfig | RecuitSimuleConfig | HillClimbingConfig){
    if(dataSet === null || metaheuristique === null){
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
    setState,
    addFitness,
    setConfig,
    setDarkMode
} = counterSlice.actions
export default counterSlice.reducer