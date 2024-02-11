import React, {useEffect} from 'react';
import "./Admin.scss";
import InputField from "../../components/inputfield/InputField";
import {signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth"
import {auth, db} from "../../../firebase/Firebase";
import Button from "../../components/button/Button";
import {useToast} from "../../../provider/toast/ToastProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {get, onValue, ref, set} from "firebase/database";
import {LoseWay} from "../../../data/game/LoseWay";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import {DialogModel} from "../../../data/components/DialogModel";
import DeleteDialog from "../../dialogs/deletedialog/DeleteDialog";
import NameDialog from "../../dialogs/namedialog/NameDialog";
import uuid from "react-uuid";

const Admin = () => {
    const toast = useToast();
    const dialog = useDialog()

    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loseWays, setLoseWays] = React.useState<LoseWay[]>([]);
    const [servers, setServers] = React.useState<ServerModel[]>([]);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user?.isAnonymous) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        });

        onValue(ref(db, "servers"), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setServers(Object.keys(data).map((key) => {
                    return new ServerModel(
                        data[key].name,
                        data[key].uid,
                    )
                }));
            } else {
                setServers([])
            }
        })

        onValue(ref(db, "data/lose-ways"), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLoseWays(Object.keys(data).map((key) => {
                    return new LoseWay(
                        data[key].uid,
                        data[key].name,
                    )
                }));
            } else {
                setLoseWays([])
            }
        })
    }, []);

    const [password, setPassword] = React.useState("");

    const signIn = () => {
        signInWithEmailAndPassword(auth, "table-track@ls-studios.de", password).then((userCredential) => {
            setIsAuthenticated(true);
        }).catch((error) => {
            toast.open("Das eingebene Passwort ist falsch.")
        })
    }

    const deleteLoseWay = (way: LoseWay) => {
        dialog.open(
            new DialogModel(
                "Art zu verlieren löschen",
                <DeleteDialog text={"Möchtest du \"" + way.name + "\" wirklich löschen?"} onDelete={() => {
                    const newLoseWays = loseWays.filter((loseWay) => loseWay.uid !== way.uid);
                    set(ref(db, "data/lose-ways"), newLoseWays)
                }} />
            )
        )
    }

    const addLoseWay = () => {
        dialog.open(
            new DialogModel(
                "Art zu verlieren hinzufügen",
                <NameDialog onAdd={
                    (name: string) => {
                        const newLoseWays = loseWays

                        newLoseWays.push(
                            new LoseWay(
                                uuid(),
                                name
                            )
                        )

                        set(ref(db, "data/lose-ways"), newLoseWays)
                    }
                } placeholder=""/>
            )
        )
    }

    const deleteServer = (server: ServerModel) => {
        dialog.open(
            new DialogModel(
                "Server löschen",
                <DeleteDialog text={"Möchtest du \"" + server.name + "\" wirklich löschen?"} onDelete={() => {
                    const newServers = servers.filter((s) => s.uid !== server.uid);
                    set(ref(db, "servers"), newServers)
                }} />
            )
        )
    }

    const addServer = () => {
        dialog.open(
            new DialogModel(
                "Server hinzufügen",
                <NameDialog onAdd={
                    (name: string) => {
                        const newServers = servers

                        newServers.push(
                            new ServerModel(
                                name,
                                uuid()
                            )
                        )

                        const serversObject = {}

                        newServers.forEach((server) => {
                            // @ts-ignore
                            serversObject[server.uid] = server
                        })
                        console.log(serversObject)

                        set(ref(db, "servers"), serversObject)
                    }
                } placeholder=""/>
            )
        )
    }

    return (
        <div className="Admin">
            <h1>Admin</h1>

            { isAuthenticated ? <>
                <h2>Arten zu verlieren</h2>
                <div className="AdminLoseWayList">
                    { loseWays.map((way, index) => {
                        return <div key={index} className="AdminLoseWayCard" onClick={() => deleteLoseWay(way)}>{way.name}</div>
                    })}
                    <Button text="Art zu verlieren hinzufügen" onClick={addLoseWay} />
                </div>

                <h2>Server</h2>
                <div className="AdminLoseWayList">
                    { servers.map((server, index) => {
                        return <div key={index} className="AdminLoseWayCard" onClick={() => deleteServer(server)}>{server.name}</div>
                    })}
                    <Button text="Server hinzufügen" onClick={addServer} />
                </div>
            </> : <>
                <h2>Passwort</h2>
                <InputField currentState={password} setCurrentState={setPassword} type="password" />

                <h2>Verifizieren</h2>
                <Button text="Bestätigen" onClick={signIn} />
            </>}
        </div>
    );
};

export default Admin;