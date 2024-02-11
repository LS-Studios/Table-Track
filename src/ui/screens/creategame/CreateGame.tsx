import React, {useEffect, useState} from 'react';
import {GameModel} from "../../../data/game/GameModel";
import {db} from "../../../firebase/Firebase";
import { ref, onValue, get, set, remove } from "firebase/database";
import './CreateGame.scss';
import Button from "../../components/button/Button";
import uuid from "react-uuid";
import ItemGrid from "../../components/itemgrid/ItemGrid";
import BoxItem from "../../components/boxitem/Boxtem";
import {IItemModel} from "../../../data/components/IItemModel";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import PlayerSelectionDialog from "../../dialogs/playerselection/PlayerSelectionDialog";
import {DialogModel} from "../../../data/components/DialogModel";
import DropdownSelection from "../../components/dropdownselection/DropdownSelection";
import {useNavigate} from "react-router-dom";
import {useToast} from "../../../provider/toast/ToastProvider";
import {MdError} from "react-icons/md";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";

const Game = () => {
    const toast = useToast()
    const navigate = useNavigate()
    const dialog = useDialog()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [thereIsActiveGame, setThereIsActiveGame] = useState<boolean>(false);
    const [players, setPlayers] = useState<PlayerModel[]>([]);
    const [rules, setRules] = useState<number>(0);

    useEffect(() => {
        onValue(ref(db, "servers/" + server.uid + "/game"), (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                setThereIsActiveGame(false)
                return
            }

            if (data.started) {
                setThereIsActiveGame(true)
            }
        });

        onValue(ref(db, "servers/" + server.uid + "/game/players"), (snapshot) => {
            setPlayers([]);

            const data = snapshot.val();

            if (data) {
                setPlayers(Object.values(data).map((value) => {
                    return value as PlayerModel
                }));
            }
        })
    }, []);

    const startNewGame = () => {
        if (players.length < 2) {
            toast.open("Es müssen mindestens 2 Spieler mitspielen")
            return
        }

        const newGame = new GameModel(
            uuid(),
            new Date(),
            null,
            players,
            [],
            rules
        );

        set(ref(db, "servers/" + server.uid + "/game"), {
            ...newGame,
            started: true,
            startTime: newGame.startTime.toISOString()
        }).then(() => {
            navigate("/game")
        })
    }

    return (
        <div className="CreateGame">
            <h1>Spiel erstellen</h1>

            { thereIsActiveGame ? <>
                <MdError size={60} />
                <h2>Es läuft bereits ein Spiel</h2>
                <Button text="Zum Spiel" onClick={() => navigate("/game")} />
            </> : <>
                <h2>Mitspieler</h2>
                <ItemGrid
                    itemComponent={ item =>
                        <BoxItem
                            item={item}
                            onClick={
                                (item: IItemModel) => {
                                    get(ref(db, "servers/" + server.uid + "/game/players")).then((snapshot) => {
                                        const data = snapshot.val();

                                        Object.keys(data).forEach((key) => {
                                            if (data[key].uid === item.uid) {
                                                remove(ref(db, "servers/" + server.uid + "/game/players/" + key))
                                                return
                                            }
                                        })
                                    })
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
                    onAddClick={() => {
                        dialog.open(new DialogModel(
                            "Spieler auswählen",
                            <PlayerSelectionDialog />
                        ))
                    }}
                />

                <h2>Regeln</h2>
                <DropdownSelection currentState={rules} setCurrentState={setRules} items={["Chinesisch"]} />

                <h2>Starten</h2>
                <Button text="Neues Spiel starten" onClick={startNewGame} />
            </>}
        </div>
    );
};

export default Game;