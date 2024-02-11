import "./DialogBase.scss"

import React from 'react';
import {PropsWithChildren} from "react";
import {MdClose} from "react-icons/md";
import {createPortal} from "react-dom";
import Divider from "../divider/Divider";

const DialogBase = ({
    title,
    onClose,
    children
}: PropsWithChildren<{
    title: string,
    onClose: () => void
}>) => {
    return (
        <div id="popup" className="overlay" onClick={onClose}>
            <div className="popup" onClick={(e) => e.stopPropagation()}>
                <div className="content">
                    <div className="header">
                        <h3>{title}</h3>
                        <MdClose className="closeIcon" onClick={onClose}/>
                    </div>
                    <Divider />
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DialogBase;