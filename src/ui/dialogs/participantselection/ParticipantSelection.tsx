import React, {useEffect} from 'react';
import "./ParticipantSelection.scss";
import ItemGrid from "../../components/itemgrid/ItemGrid";
import BoxItem from "../../components/boxitem/Boxtem";
import {get, onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {PlayerModel} from "../../../data/game/PlayerModel";
import Button from "../../components/button/Button";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {RoundModel} from "../../../data/game/RoundModel";
import {useToast} from "../../../provider/toast/ToastProvider";
import {CalculationHelper} from "../../../helper/CalculationHelper";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";

const ParticipantSelection = () => {
    const toast = useToast()
    const dialog = useDialog()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [players, setPlayers] = React.useState<PlayerModel[]>([])
    const [notParticipants, setNotParticipants] = React.useState<PlayerModel[]>([])

    useEffect(() => {
        onValue(ref(db, "servers/" + server.uid + "/game/players"), (snapshot) => {
            setPlayers([]);

            const data = snapshot.val();

            if (data) {
                Object.keys(data).forEach((key) => {
                    const player = new PlayerModel(
                        data[key].uid,
                        data[key].name,
                        data[key].image
                    );
                    setPlayers((current) => {
                        return [...current, player]
                    });
                })
            }
        })
    }, []);

    const getStartRoundText = () => {
        if (notParticipants.length === 0) {
            return "Mit allen Spielern starten"
        } else {
            return "Ohne " + notParticipants.length + " Spieler starten"
        }
    }

    const startRound = () => {
        if (notParticipants.length > players.length - 2) {
            toast.open("Es müssen mindestens 2 Spieler teilnehmen")
            return
        }

        get(ref(db, "servers/" + server.uid + "/game/rounds")).then((snapshot) => {
            const roundsData = snapshot.val();
            const newRoundNumber = roundsData ? Object.keys(roundsData).length + 1 : 1

            set(ref(db, "servers/" + server.uid + "/game/current-round"), new RoundModel(
                newRoundNumber,
                CalculationHelper.difference(players, notParticipants),
                []
            ))
        })

        dialog.closeCurrent()
    }

    return (
        <div className="ParticipantSelection">
            <ItemGrid
                itemComponent= { item =>
                    <BoxItem
                        item={item}
                        selected={notParticipants.find((p) => p.uid === item.uid) !== undefined}
                        onClick={
                            (item) => {
                                setNotParticipants((current) => {
                                    if (current.find((p) => p.uid === item.uid)) {
                                        return current.filter((p) => p.uid !== item.uid)
                                    }
                                    return [...current, item]
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
                itemSpacing="10px"
            />
            <Button text={getStartRoundText()} width="300px" onClick={startRound} />
        </div>
    );
};

export default ParticipantSelection;