import {ToastProviderProps} from "./toast/ToastProvider";
import {createContext} from "react";
import {DialogProviderProps} from "./dialog/DialogProvider";
import {GlobalVariablesProviderProps} from "./GlobalVariablesProvider";

export const ToastContext = createContext({} as ToastProviderProps)
export const DialogContext = createContext({} as DialogProviderProps)
export const GlobalVariablesContext = createContext({} as GlobalVariablesProviderProps)