import React from 'react';
import "./JoinServerDialog.scss";
import Button from "../../components/button/Button";
import Divider from "../../components/divider/Divider";
import {useDialog} from "../../../provider/dialog/DialogProvider";

const JoinServerDialog = (
{
    onJoinServer,
}: {
    onJoinServer: () => void
}
) => {
    const dialog = useDialog()

    const joinServer = () => {
        onJoinServer()
        dialog.closeCurrent()
    }

    const cancel = () => {
        dialog.closeCurrent()
    }

    return (
        <div className="JoinServerDialog">
            <div style={{width:325}}>Ein Spieler mit diesen Namen gibt es noch nicht auf dem ausgewählten Server.<br/><br/>Möchtest du diesen Server beitreten?</div>
            <Divider />
            <div className="JoinServerDialogButtonRow">
                <Button text="Ja" onClick={joinServer} width="150px"/>
                <Button text="Nein" onClick={cancel} width="150px"/>
            </div>
        </div>
    );
};

export default JoinServerDialog;