import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
interface RootState {
    darkMode: boolean
}

const initialState = { 
    darkMode: true,
} satisfies RootState as RootState

const counterSlice = createSlice({
  name: 'rootReducer',
  initialState,
  reducers: {
    setDarkMode(state, action: PayloadAction<boolean>){
        state.darkMode = action.payload
    },
  },
})

export const { 
    setDarkMode
} = counterSlice.actions
export default counterSlice.reducer