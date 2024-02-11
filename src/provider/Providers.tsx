import React, {PropsWithChildren} from 'react';
import {ToastProvider} from "./toast/ToastProvider";
import {DialogProvider} from "./dialog/DialogProvider";
import {GlobalVariablesProvider} from "./GlobalVariablesProvider";

const Providers = ({ children }: PropsWithChildren) => {
    return (
        <GlobalVariablesProvider>
            <ToastProvider>
                <DialogProvider>
                    { children }
                </DialogProvider>
            </ToastProvider>
        </GlobalVariablesProvider>
    );
};

export default Providers;