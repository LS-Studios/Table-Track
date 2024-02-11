import React from 'react';
import "./DeleteDialog.scss";
import Button from "../../components/button/Button";
import Divider from "../../components/divider/Divider";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {LoseWay} from "../../../data/game/LoseWay";

const DeleteDialog = (
{
    text,
    onDelete
}: {
    text: string,
    onDelete: () => void
}
) => {
    const dialog = useDialog()

    const joinServer = () => {
        onDelete()
        dialog.closeCurrent()
    }

    const cancel = () => {
        dialog.closeCurrent()
    }

    return (
        <div className="DeleteDialog">
            <div style={{width:325}}>{text}</div>
            <Divider />
            <div className="JoinServerDialogButtonRow">
                <Button text="Ja" onClick={joinServer} width="150px"/>
                <Button text="Nein" onClick={cancel} width="150px"/>
            </div>
        </div>
    );
};

export default DeleteDialog;