import React, {useState} from 'react';
import "./NameDialog.scss";
import InputField from "../../components/inputfield/InputField";
import Button from "../../components/button/Button";
import Divider from "../../components/divider/Divider";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {get, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {PlayerModel} from "../../../data/game/PlayerModel";
import uuid from "react-uuid";
import {CalculationHelper} from "../../../helper/CalculationHelper";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {useToast} from "../../../provider/toast/ToastProvider";

const NameDialog = ({
    onAdd,
    placeholder,
}: {
    onAdd: (name: string) => void,
    placeholder: string
}) => {
    const toast = useToast()
    const dialog = useDialog()

    const [playerName, setPlayerName] = useState("");

    const addPlayer = () => {
        if (playerName === "") {
            toast.open("Bitte gib einen Namen ein")
            return
        }

        onAdd(playerName)
        dialog.closeCurrent()
    }

    return (
        <div className="NameDialog">
            <h3>Name</h3>
            <InputField currentState={playerName} setCurrentState={setPlayerName} placeholder={placeholder} width="300px" />
            <Divider />
            <Button text="Hinzufügen" onClick={addPlayer} width="300px"/>
        </div>
    );
};

export default NameDialog;