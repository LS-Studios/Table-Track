import React, {useEffect} from 'react';
import "./LoseSelection.scss";
import ItemGrid from "../../components/itemgrid/ItemGrid";
import BoxItem from "../../components/boxitem/Boxtem";
import {get, onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {PlayerModel} from "../../../data/game/PlayerModel";
import Button from "../../components/button/Button";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {RoundModel} from "../../../data/game/RoundModel";
import DropdownSelection from "../../components/dropdownselection/DropdownSelection";
import {useToast} from "../../../provider/toast/ToastProvider";
import {PlaceModel} from "../../../data/game/PlaceModel";
import {CalculationHelper} from "../../../helper/CalculationHelper";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {LoseWay} from "../../../data/game/LoseWay";

const LoseSelection = () => {
    const dialog = useDialog()
    const toast = useToast()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [participants, setParticipants] = React.useState<PlayerModel[]>([])
    const [places, setPlaces] = React.useState<PlaceModel[]>([])
    const [selectedPlayer, setSelectedPlayer] = React.useState<PlayerModel | null>(null)
    const [loseWays, setLoseWays] = React.useState<LoseWay[]>([])
    const [selectedLoseWay, setSelectedLoseWay] = React.useState<number>(0)

    useEffect(() => {
        onValue(ref(db, "data/lose-ways"), (snapshot) => {
            setLoseWays([])

            const data = snapshot.val()

            if (data) {
                setLoseWays(Object.keys(data).map((key) => {
                    return new LoseWay(
                        data[key].uid,
                        data[key].name,
                    )
                }));
            }
        })
        onValue(ref(db, "servers/" + server.uid + "/game/current-round/participants"), (snapshot) => {
            setParticipants([]);

            const data = snapshot.val();

            if (data) {
                Object.keys(data).forEach((key) => {
                    const player = new PlayerModel(
                        data[key].uid,
                        data[key].name,
                        data[key].image
                    );
                    setParticipants((current) => {
                        return [...current, player]
                    });
                })
            }
        })
        onValue(ref(db, "servers/" + server.uid + "/game/current-round/places"), (snapshot) => {
            setPlaces([]);

            const data = snapshot.val();

            if (data) {
                Object.keys(data).forEach((key) => {
                    const place = new PlaceModel(
                        data[key].number,
                        new PlayerModel(
                            data[key].player.uid,
                            data[key].player.name,
                            data[key].player.image
                        ),
                        data[key].loseWay
                    );
                    setPlaces((current) => {
                        return [...current, place]
                    });
                })
            }
        })
    }, []);

    const makePlayerLose = () => {
        if (!selectedPlayer) {
            toast.open("Bitte wähle einen Spieler aus")

            return
        }

        const newPlaces = places
        newPlaces.push(
            new PlaceModel(
                participants.length - newPlaces.length,
                selectedPlayer,
                loseWays.find((loseWay) => loseWay.uid === loseWay.uid) || null
            )
        )

        if (newPlaces.length === participants.length - 1) {
            const winner = CalculationHelper.difference(participants, newPlaces.map((place) => place.player))[0]

            newPlaces.push(
                new PlaceModel(
                    1,
                    winner,
                    null
                )
            )

            toast.open(winner.name + " hat gewonnen")
        }

        set(ref(db, "servers/" + server.uid + "/game/current-round/places"), newPlaces.map((place) => {
            return new PlaceModel(
                place.number,
                new PlayerModel(
                    place.player.uid,
                    place.player.name,
                    place.player.image
                ),
                place.loseWay
            )
        })).then(() => {
            toast.open(selectedPlayer.name + " rausgeschmissen")

            dialog.closeCurrent()
        })
    }

    return (
        <div className="LoseSelection">
            <ItemGrid
                itemComponent= { item =>
                    <BoxItem
                        item={item}
                        selected={selectedPlayer?.uid === item.uid}
                        onClick={
                            (item) => {
                                setSelectedPlayer(item as PlayerModel)
                            }
                        }
                    />
                }
                items={CalculationHelper.difference(participants, places.map((place) => place.player)).map((player) => {
                    return {
                        ...player,
                        uid: player.uid,
                        name: player.name,
                        image: player.image
                    }
                })}
                itemSpacing="10px"
            />

            <h4 style={{margin:0}}>Rausgeflogen durch</h4>

            <DropdownSelection
                currentState={selectedLoseWay}
                setCurrentState={setSelectedLoseWay}
                items={loseWays.map((way) => way.name)}
                width={"300px"}
                color={"#547958"}
            />

            <Button text="Rausschmeißen" onClick={makePlayerLose} width="300px" />
        </div>
    );
};

export default LoseSelection;