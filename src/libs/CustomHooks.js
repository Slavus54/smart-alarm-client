import React, {useState} from 'react'

export const useLoadData = (user) => {
    const [isLoaded, setIsLoaded] = useState(false)

    if (user !== null) {
        setIsLoaded(true)
    }

    return [isLoaded, setIsLoaded]
}