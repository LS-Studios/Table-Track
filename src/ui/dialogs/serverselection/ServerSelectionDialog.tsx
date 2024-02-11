import React, {useEffect} from 'react';
import InputField from "../../components/inputfield/InputField";
import "./ServerSelectionDialog.scss";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {get, onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import Divider from "../../components/divider/Divider";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {useToast} from "../../../provider/toast/ToastProvider";
import {ServerModel} from "../../../data/game/ServerModel";

const ServerSelectionDialog = (
{
    onServerSelected
}: {
    onServerSelected: (server: ServerModel) => void
}
) => {
    const dialog = useDialog()
    const toast = useToast()

    const [searchText, setSearchText] = React.useState<string>("")
    const [servers, setServers] = React.useState<ServerModel[]>([])
    const [filteredServers, setFilteredServers] = React.useState<ServerModel[]>([])

    useEffect(() => {
        onValue(ref(db, "servers"), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setServers(Object.keys(data).map((key) => {
                    return new ServerModel(
                        data[key].name,
                        data[key].uid,
                    )
                }));
            }
        })
    }, []);

    useEffect(() => {
        setFilteredServers(servers.filter((player) => {
            return player.name.toLowerCase().includes(searchText.toLowerCase())
        }))
    }, [servers, searchText]);

    const selectServer = (server: ServerModel) => {
        onServerSelected(server)
        dialog.closeCurrent()
    }

    return (
        <div className="PlayerSelectionDialog">
            <InputField currentState={searchText} setCurrentState={setSearchText} placeholder="Nach Servern suchen" width="300px" />
            <Divider />
            <div className="PlayerSelectionDialogContent">
                { filteredServers.length > 0 ? filteredServers.map((server) => {
                    return (
                        <div key={server.uid} className="PlayerSelectionDialogItem" onClick={() => selectServer(server)}>
                            {server.name}
                        </div>
                    )
                }) : <h4 className="PlayerSelectionDialogNoPlayersText">Keine Server gefunden</h4> }
            </div>
        </div>
    );
};

export default ServerSelectionDialog;