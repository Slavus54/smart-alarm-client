import React, {useState, createContext} from 'react'

let initialState = {
    counter: 0,
    total_duration: 0
}

export const AppContext = createContext(initialState)

const AppProvider = ({children}) => {
    const [state, setState] = useState(initialState)
    const {counter, total_duration} = state

    const increment = payload => {
        setState({...state, counter: counter + payload})
    }

    const set_duration = payload => {
        setState({...state, total_duration: payload})
    }

    return (
        <AppContext.Provider value={{...state, increment, set_duration}}>
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider