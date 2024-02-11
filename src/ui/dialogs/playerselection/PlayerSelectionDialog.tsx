import React, {useEffect} from 'react';
import InputField from "../../components/inputfield/InputField";
import "./PlayerSelectionDialog.scss";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {get, onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import Divider from "../../components/divider/Divider";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {useToast} from "../../../provider/toast/ToastProvider";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import BoxItem from "../../components/boxitem/Boxtem";
import ItemGrid from "../../components/itemgrid/ItemGrid";

const PlayerSelectionDialog = () => {
    const dialog = useDialog()
    const toast = useToast()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [searchText, setSearchText] = React.useState<string>("")
    const [players, setPlayers] = React.useState<PlayerModel[]>([])
    const [alreadyAttending, setAlreadyAttending] = React.useState<PlayerModel[]>([])
    const [filteredPlayers, setFilteredPlayers] = React.useState<PlayerModel[]>([])

    useEffect(() => {
        onValue(ref(db, "servers/" + server.uid + "/game/players"), (snapshot) => {
            setAlreadyAttending([]);

            const data = snapshot.val();

            if (data) {
                setAlreadyAttending(Object.values(data).map((value) => {
                    return value as PlayerModel
                }))
            }
        })

        onValue(ref(db, "servers/" + server.uid + "/players"), (snapshot) => {
            const data = snapshot.val();

            setPlayers(Object.values(data).map((value) => {
                return value as PlayerModel
            }))
        })
    }, []);

    useEffect(() => {
        setFilteredPlayers(players.filter((player) => {
            return player.name.toLowerCase().includes(searchText.toLowerCase()) && !alreadyAttending.find((attending) => attending.uid === player.uid)
        }))
    }, [players, alreadyAttending, searchText]);

    const selectPlayer = (player: PlayerModel) => {
        const newPlayers = [...alreadyAttending]

        newPlayers.push(player)

        set(ref(db, "servers/" + server.uid + "/game/players"), newPlayers).then(() => {
            toast.open(player.name + " ist dazugekommen")
        })
    }

    return (
        <div className="PlayerSelectionDialog">
            <InputField currentState={searchText} setCurrentState={setSearchText} placeholder="Nach Spielern suchen" width="300px" />
            <Divider />
            <div className="PlayerSelectionDialogContent">
                { filteredPlayers.length > 0 ? <>
                    <ItemGrid
                        itemComponent= { item =>
                            <BoxItem
                                item={item}
                                onClick={(item) => {
                                    selectPlayer(item)
                                }}
                            />
                        }
                        items={filteredPlayers.map((player) => {
                            return {
                                uid: player.uid,
                                name: player.name,
                                image: player.image
                            }
                        })}
                        itemSpacing="10px"
                    />
                </> : <h4 className="PlayerSelectionDialogNoPlayersText">Keine Spieler zum hinzufügen gefunden</h4> }
            </div>
        </div>
    );
};

export default PlayerSelectionDialog;