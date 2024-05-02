import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { DataSet } from 'polytech_opti-dis_bin_packing_2d';

export const metaheuristiques = ["Recuit simulé", "Tabou", "Genetique", "Hill Climbing"] as const
export type Metaheuristiques = typeof metaheuristiques[number];

interface RootState {
    metaheuristique: Metaheuristiques
    fileContent: string | null,
    binHeight: number
    binWidth: number
    speed: number
    state: "idle" | "running" | "paused" | "finished"
}

const initialState = { 
    metaheuristique: "Tabou",
    speed:1000,
    fileContent: null,
    binHeight: 0,
    binWidth: 0,
    state: "idle"
} satisfies RootState as RootState

const counterSlice = createSlice({
  name: 'rootReducer',
  initialState,
  reducers: {
    setAlgo(state, action: PayloadAction<Metaheuristiques>) {
        state.metaheuristique = action.payload
     },
     setFileContent(state, action: PayloadAction<string>) {
        state.fileContent = action.payload
        const dataset = new DataSet(action.payload)
        state.binHeight = dataset.binHeight
        state.binWidth = dataset.binWidth
     },
     setSpeed(state, action: PayloadAction<number>) {
        state.speed = action.payload
     },
        setState(state, action: PayloadAction<"idle" | "running" | "paused"| "finished">) {
            state.state = action.payload
        },
  },
})

export const { 
    setAlgo,
    setFileContent,
    setSpeed,
    setState
} = counterSlice.actions
export default counterSlice.reducer