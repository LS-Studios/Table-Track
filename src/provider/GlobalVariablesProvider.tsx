import {PropsWithChildren, useContext, useMemo, useState} from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import {DialogModel} from "../data/components/DialogModel"
import {GlobalVariablesContext} from "./Contexts";

export interface GlobalVariablesProviderProps {
    getTempVar: (name: string) => any;
    setTempVar: (name: string, value: any) => void;
    getLSVar: (name: string) => any;
    setLSVar: (name: string, value: any) => void;
}

export function GlobalVariablesProvider({ children }: PropsWithChildren) {
    const [tempVariables, setTempVariables] = useState({})
    const [localStorageVariables, setLocalStorageVariables] = useLocalStorage("localStorageVariables", {})

    const getTempVar = (name: string) => {
        // @ts-ignore
        return tempVariables[name]
    }

    const setTempVar = (name: string, value: any) => {
        setTempVariables((current) => {
            const newTempVariables = {...current}
            // @ts-ignore
            newTempVariables[name] = value
            return newTempVariables
        })
    }

    const getLSVar = (name: string) => {
        // @ts-ignore
        return localStorageVariables[name]
    }

    const setLSVar = (name: string, value: any) => {
        const newLocalStorageVariables = {...localStorageVariables}
        // @ts-ignore
        newLocalStorageVariables[name] = value
        setLocalStorageVariables(newLocalStorageVariables)
    }

    const contextValue: GlobalVariablesProviderProps = useMemo(
        () => ({
            getTempVar,
            setTempVar,
            getLSVar,
            setLSVar
        }),
        [tempVariables, localStorageVariables]
    )

    return  <GlobalVariablesContext.Provider value={contextValue}>
        {children}
    </GlobalVariablesContext.Provider>
};

export const useGlobalVariables = () => useContext(GlobalVariablesContext)