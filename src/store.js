import { createStore } from 'redux'
import { range } from 'ramda'
import parseTabs from './parseTabs'

const { ceil, floor } = Math

const TICK = 'TICK'
const INPUT_NOTE = 'INPUT_NOTE'
const SET_TABLATURE = 'SET_TABLATURE'
const PLAY = 'PLAY'
const RESIZE = 'RESIZE'

const NOTE_SIZE = 100

const initialState = {
  windowSize: {
    width: 0,
    height: 0,
  },
  tablature: `
C |--------|c-c-----|
Rd|--------|--------|
H |--------|--------|
t |--------|--------|
S |--------|----o---|
F |--------|----o-oo|
B |--------|o-o-----|`,
  trackMapping: { 46: 0, 49: 1, 38: 2, 48: 3, 36: 4, 47: 5, 43: 6, 51: 7 },
  now: 0,
  playbackStart: 0,
  bpm: 130,
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY:
      return { ...state, playbackStart: action.payload }
    case RESIZE:
      return { ...state, windowSize: action.payload }
    case TICK:
      return { ...state, now: action.payload }
    case SET_TABLATURE:
      return { ...state, tablature: action.payload }
    case INPUT_NOTE:
      if (action.payload.intensity === 0) return state

      const trackIndex = state.trackMapping[action.payload.note]
      if (trackIndex === undefined) return state

      return {
        ...state,
        tracks: state.tracks.map((track, index) => {
          if (index !== trackIndex) return track
          return [...track, action.payload.timestamp]
        }),
      }
    default:
      return state
  }
}

// actions
export const tick = now => ({ type: TICK, payload: now })
export const inputNote = info => ({ type: INPUT_NOTE, payload: info })
export const setTablature = tablature => ({ type: SET_TABLATURE, payload: tablature })
export const play = timestamp => ({ type: PLAY, payload: timestamp })
export const resize = ({ width, height }) => ({ type: RESIZE, payload: { width, height } })

// selectors
export const getPlaybackTime = state =>
  floor((state.now - state.playbackStart) / (60000 / state.bpm) * 100)
export const getAmountOfVisibleNotes = state => ceil(state.windowSize.height / NOTE_SIZE) + 2
export const getMusicInstruments = state => {
  const amountOfVisibleNotes = getAmountOfVisibleNotes(state)
  const instruments = parseTabs(state.tablature)
  const playbackTime = getPlaybackTime(state)
  const firstVisibleNote = floor(playbackTime / NOTE_SIZE)

  return instruments.map(instrument => ({
    ...instrument,
    notes: range(firstVisibleNote, amountOfVisibleNotes + firstVisibleNote).map(id => ({
      live: instrument.notes[id % instrument.notes.length] !== '-',
      id,
      position: id * NOTE_SIZE - NOTE_SIZE / 2 - playbackTime - NOTE_SIZE,
    })),
  }))
}

export default createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
