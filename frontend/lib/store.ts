import { combineReducers, configureStore } from '@reduxjs/toolkit'
import keplerGlReducer from '@kepler.gl/reducers'
// @ts-ignore
import { taskMiddleware } from 'react-palm/tasks'

const customizedKeplerGlReducer = keplerGlReducer
  .initialState({
    uiState: {
      readOnly: true,
      currentModal: null
    }
  })

const rootReducer = combineReducers({
  keplerGl: customizedKeplerGlReducer
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(taskMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
