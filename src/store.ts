import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import metaheuristique, { rehydrateMiddleware } from './reducers/metaheuristique'
import rootReducer from './reducers/rootReducer'

const reducers = combineReducers({
  rootReducer,
  metaheuristique
})

const store = configureStore({
  reducer: persistReducer<ReturnType<typeof reducers>>({
    key: 'root',
    storage,
    version: 1,
  }, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(rehydrateMiddleware),
  devTools: process.env.NODE_ENV === 'development',
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store

