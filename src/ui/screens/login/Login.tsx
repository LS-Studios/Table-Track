import React, {useEffect} from 'react';
import {PlayerModel} from "../../../data/game/PlayerModel";
import {get, onValue, ref, set} from "firebase/database";
import {auth, db} from "../../../firebase/Firebase";
import "./Login.scss";
import InputField from "../../components/inputfield/InputField";
import ValueField from "../../components/valuefield/ValueField";
import {ServerModel} from "../../../data/game/ServerModel";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {DialogModel} from "../../../data/components/DialogModel";
import ServerSelectionDialog from "../../dialogs/serverselection/ServerSelectionDialog";
import useLocalStorage from "../../../hooks/useLocalStorage";
import Button from "../../components/button/Button";
import JoinServerDialog from "../../dialogs/joinserver/JoinServerDialog";
import {useToast} from "../../../provider/toast/ToastProvider";
import uuid from "react-uuid";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {useNavigate} from "react-router-dom";
import {signInAnonymously} from "firebase/auth";
import firebase from "firebase/compat";

const Login = () => {
    const navigate = useNavigate()
    const dialog = useDialog()
    const toast = useToast()

    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [name, setName] = React.useState<string>("")
    const [selectedServer, setSelectedServer] = React.useState<string | null>(null)
    const [servers, setServers] = React.useState<ServerModel[]>([])
    const [players, setPlayers] = React.useState<PlayerModel[]>([])

    useEffect(() => {
        if (server) {
            navigate("/games")
        }

        onValue(ref(db, "servers"), (snapshot) => {
            setServers([])

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
        onValue(ref(db, "servers/" + selectedServer + "/players"), (snapshot) => {
            setPlayers([])

            const data = snapshot.val();

            if (data) {
                setPlayers(Object.keys(data).map((key) => {
                    return data[key] as PlayerModel
                }));
            }
        })
    }, [selectedServer]);

    useEffect(() => {
        if (selectedServer == null && servers.length > 0) {
            setSelectedServer(servers[0].uid)
        }
    }, [servers]);

    const getRandomImage = () => {
        const array = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array.filter((image) => players.every((player) => player.image !== image))[0]
    };

    const openServerSelection = () => {
        dialog.open(
            new DialogModel(
                "Server auswählen",
                <ServerSelectionDialog onServerSelected={(server) => {
                    setSelectedServer(server.uid)
                }} />
            )
        )
    }

    const login = () => {
        if (name === "") {
            toast.open("Bitte gib deinen Namen ein")
            return
        }

        if (selectedServer == null) {
            toast.open("Bitte wähle einen Server aus")
            return
        }

        const existingPlayer = players.find((player) => player.name === name)

        if (existingPlayer) {
            signInAnonymously(auth).then(() => {
                globalVariables.setLSVar("server", servers.find((server) => server.uid === selectedServer))
                navigate("/games")
            })
        } else {
            dialog.open(
                new DialogModel(
                    "Server beitreten",
                    <JoinServerDialog onJoinServer={() => {
                        signInAnonymously(auth).then(() => {
                            const newPlayers = [...players]
                            newPlayers.push(new PlayerModel(uuid(), name, getRandomImage()))

                            set(ref(db, "servers/" + selectedServer + "/players"), newPlayers).then(() => {
                                globalVariables.setLSVar("server", servers.find((server) => server.uid === selectedServer))
                                navigate("/games")
                            })
                        })
                    }}/>
                )
            )
        }
    }

    return (
        <div className="Login">
            <h1>Anmelden</h1>

            <h2>Name</h2>
            <InputField currentState={name} setCurrentState={setName} placeholder={"Max M."} type={"text"}/>

            <h2>Server</h2>
            <ValueField value={servers.find((server) => server.uid === selectedServer)?.name || "Kein Server ausgewählt"} onClick={openServerSelection}/>

            <h2>Anmelden</h2>
            <Button text="Anmelden" onClick={login} />
        </div>
    );
};

export default Login;