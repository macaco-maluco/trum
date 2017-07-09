import { createStore } from 'redux'
import { range } from 'ramda'
import parseTabs from './parseTabs'
import tablature from './tabs/singleStrokeRoll.txt'

const { ceil, floor } = Math

const TICK = 'TICK'
const INPUT_NOTE = 'INPUT_NOTE'
const SET_TABLATURE = 'SET_TABLATURE'
const PLAY = 'PLAY'
const RESIZE = 'RESIZE'

export const NOTE_SIZE = 100

const initialState = {
  windowSize: {
    width: 0,
    height: 0,
  },
  tablature: tablature,
  now: 0,
  playbackStart: 0,
  bpm: 60,
  drumKit: [
    { midiNote: 46, icon: 'HiHat', color: '#f7a59c', label: 'hi-hat', symbols: ['hh', 'h'] },
    { midiNote: 49, icon: 'Cymbal', color: '#fa9846', label: 'ride cymbal', symbols: ['rd', 'r'] },
    { midiNote: 38, icon: 'Snare', color: '#5b9193', label: 'snare drum', symbols: ['sn', 's'] },
    { midiNote: 48, icon: 'Tom', color: '#8ac8da', label: 'high tom', symbols: ['t1', 't'] },
    { midiNote: 36, icon: 'BassDrum', color: '#613846', label: 'bass drum', symbols: ['db', 'b'] },
    { midiNote: 47, icon: 'Tom', color: '#8ac8da', label: 'low tom', symbols: ['t2'] },
    { midiNote: 43, icon: 'Tom', color: '#8ac8da', label: 'floor tom', symbols: ['ft', 'f'] },
    { midiNote: 51, icon: 'Cymbal', color: '#fa9846', label: 'crash cymbal', symbols: ['cc', 'c'] },
  ],
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
  floor((state.now - state.playbackStart) / (60000 / state.bpm / 4) * 100)

export const getAmountOfVisibleNotes = state => ceil(state.windowSize.height / NOTE_SIZE) + 2

export const getMusicInstruments = state => {
  const amountOfVisibleNotes = getAmountOfVisibleNotes(state)
  const instruments = parseTabs(state.tablature)
  const playbackTime = getPlaybackTime(state)
  const firstVisibleNote = floor(playbackTime / NOTE_SIZE)

  return state.drumKit.map(instrument => {
    const musicInstrument = instruments.find(musicInstrument => {
      return instrument.symbols.indexOf(musicInstrument.symbol) !== -1
    })

    if (!musicInstrument) {
      return {
        ...instrument,
        symbol: instrument.symbols[0],
        notes: [],
      }
    }

    return {
      ...instrument,
      symbol: musicInstrument.symbol,
      notes: range(firstVisibleNote, amountOfVisibleNotes + firstVisibleNote).map(id => ({
        live: musicInstrument.notes[id % musicInstrument.notes.length] !== '-',
        id,
        position: id * NOTE_SIZE - NOTE_SIZE / 2 - playbackTime,
      })),
    }
  })
}

export default createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)
