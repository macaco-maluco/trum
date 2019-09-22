import React, { useReducer } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import parseTabs, { Tabs } from './lib/tabs-parser/parseTabs'
import Editor from './Editor'
import { reducer, initialState } from './store'

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  let parsedTabs: Tabs | undefined

  try {
    parsedTabs = parseTabs(state.source)
  } catch (e) {
    parsedTabs = undefined
  }

  return (
    <Router>
      <Route
        path="/editor"
        render={() => <Editor source={state.source} parsedTabs={parsedTabs} dispatch={dispatch} />}
      />
    </Router>
  )
}

export default App
