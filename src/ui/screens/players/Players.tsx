import React, {useEffect} from 'react';
import "./Players.scss";
import BoxItem from "../../components/boxitem/Boxtem";
import {IItemModel} from "../../../data/components/IItemModel";
import {get, onValue, ref, remove, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {DialogModel} from "../../../data/components/DialogModel";
import PlayerSelectionDialog from "../../dialogs/playerselection/PlayerSelectionDialog";
import ItemGrid from "../../components/itemgrid/ItemGrid";
import {PlayerModel} from "../../../data/game/PlayerModel";
import Button from "../../components/button/Button";
import {useToast} from "../../../provider/toast/ToastProvider";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import NameDialog from "../../dialogs/namedialog/NameDialog";
import uuid from "react-uuid";
import {CalculationHelper} from "../../../helper/CalculationHelper";

const Players = () => {
    const dialog = useDialog()
    const toasts = useToast()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [players, setPlayers] = React.useState<PlayerModel[]>([])

    useEffect(() => {
        onValue(ref(db, "servers/" + server.uid + "/players"), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setPlayers(Object.keys(data).map((key) => {
                    return data[key] as PlayerModel
                }));
            }
        })
    }, []);

    const invitePlayer = () => {
        navigator.clipboard.writeText("http://localhost:3000/login/" + server.uid)
        toasts.open("Einladungslink kopiert")
    }

    const addPlayer = () => {
        dialog.open(new DialogModel(
            "Spieler hinzufügen",
            <NameDialog onAdd={
                (name: string) => {
                    get(ref(db, "servers/" + server.uid + "/players")).then((snapshot) => {
                        const data = snapshot.val();

                        const newPlayers = data ? Object.values(data).map((value) => value as PlayerModel) : [];
                        newPlayers.push(new PlayerModel(
                            uuid(),
                            name,
                            CalculationHelper.getRandomImage(newPlayers)
                        ));
                        set(ref(db, "servers/" + server.uid + "/players"), newPlayers).then(() => {
                            dialog.closeCurrent()
                        })
                    })
                }
            } placeholder="Max M." />
        ))
    }

    return (
        <div className="Players">
            <h1>Spieler</h1>

            <div className="PlayersContent">
                <ItemGrid
                    itemComponent={ item =>
                        <BoxItem
                            item={item}
                            onClick={
                                (item: IItemModel) => {

                                }
                            }
                        />
                    }
                    items={players.map((player) => {
                        return {
                            uid: player.uid,
                            name: player.name,
                            image: player.image
                        }
                    })}
                />

                <Button text="Lade einen Spieler ein" onClick={invitePlayer} />
                <Button text="Spieler manuel hinzügen" onClick={addPlayer} />
            </div>
        </div>
    );
};

export default Players;