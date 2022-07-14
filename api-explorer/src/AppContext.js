import React, {useContext} from 'react'

export const AppContext = React.createContext({})

export default function useAppState () {
  return useContext(AppContext)
}
