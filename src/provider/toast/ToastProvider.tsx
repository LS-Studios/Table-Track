import React, {useState, useMemo, PropsWithChildren, useContext} from 'react';
import { createPortal } from 'react-dom';
import {ToastContext} from "../Contexts";
import "./ToastProvider.scss";
import uuid from "react-uuid";
import {ToastModel} from "../../data/components/ToastModel";
import Toast from "../../ui/components/toast/Toast";

export interface ToastProviderProps {
    open: (message: string) => void;
}

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<ToastModel[]>([]);
    const open = (message: string) => {
        setToasts(currentToasts => {
            return [
                ...currentToasts,
                new ToastModel(uuid(), message)
            ];
        });
    }
    const close = (id: string) =>
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
        );

    const contextValue: ToastProviderProps =
        useMemo(() => ({
            open
        }), []);

    return (
        <ToastContext.Provider value={contextValue}>
            { children }

            <div className="toastsWrapper">
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} close={() => close(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);