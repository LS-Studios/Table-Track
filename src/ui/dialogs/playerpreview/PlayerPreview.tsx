import React, {useEffect} from 'react';
import "./PlayerPreview.scss";
import ItemGrid from "../../components/itemgrid/ItemGrid";
import BoxItem from "../../components/boxitem/Boxtem";
import {onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {useToast} from "../../../provider/toast/ToastProvider";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";

const PlayerPreview = () => {
    const toast = useToast()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [players, setPlayers] = React.useState<PlayerModel[]>([])

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

    return (
        <div className="PlayerPreview">
            { players.length === 0 ?
                <h4 className="PlayerPreviewNoPlayers">Keine spieler vorhanden</h4> :
                <ItemGrid
                    itemComponent= { item =>
                        <BoxItem
                            item={item}
                            onClick={() => {}}
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
            }
        </div>
    );
};

export default PlayerPreview;