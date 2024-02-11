import React, {useEffect, useState} from 'react';
import {GameModel} from "../../../data/game/GameModel";
import "./Game.scss";
import {onValue, ref, set} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {useNavigate} from "react-router-dom";
import ValueField from "../../components/valuefield/ValueField";
import Button from "../../components/button/Button";
import {BarChart, pieArcLabelClasses, PieChart, ScatterChart} from "@mui/x-charts";
import {AnchorPosition} from "@mui/x-charts/ChartsLegend/utils";
import {RoundModel} from "../../../data/game/RoundModel";
import {PlaceModel} from "../../../data/game/PlaceModel";
import RoundCard from "../../components/roundcard/RoundCard";
import {useDialog} from "../../../provider/dialog/DialogProvider";
import ParticipantSelection from "../../dialogs/participantselection/ParticipantSelection";
import {DialogModel} from "../../../data/components/DialogModel";
import LoseSelection from "../../dialogs/loseselection/LoseSelection";
import PlayerSelectionDialog from "../../dialogs/playerselection/PlayerSelectionDialog";
import PlayerPreview from "../../dialogs/playerpreview/PlayerPreview";
import {CalculationHelper} from "../../../helper/CalculationHelper";
import roundCard from "../../components/roundcard/RoundCard";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {MdError} from "react-icons/md";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {LoseWay} from "../../../data/game/LoseWay";

const Game = () => {
    const dialog = useDialog()
    const navigate = useNavigate()
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [thereIsActiveGame, setThereIsActiveGame] = useState<boolean>(true);
    const [game, setGame] = useState<GameModel | null>(null);
    const [currentRound, setCurrentRound] = useState<RoundModel | null>(null);
    const [placeBaseDistribution, setPlaceBaseDistribution] = useState<{ x: number, y: number, id: number }[]>([{ x:0, y: 0, id: 1 }]);
    const [placeDistribution, setPlaceDistribution] = useState<{ x: number, y: number, id: number }[]>([{ x:0, y: 0, id: 1 }]);
    const [points, setPoints] = useState<{name: string, points: number}[]>([{name: "", points: 0}]);
    const [loseWays, setLoseWays] = useState<LoseWay[]>([]);
    const [occurringLoseWays, setOccurringLoseWays] = useState<{id: string, value: number, label: string}[]>([{id: "", value: 0, label: ""}]);

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

        onValue(ref(db, "servers/" + server.uid + "/game"), (snapshot) => {
            const data = snapshot.val();

            if (!data || !data.started) {
                setThereIsActiveGame(false);
                return
            }

            if (data) {
                setGame(
                    {
                        ...data,
                        startTime: new Date(data.startTime),
                        rounds: data.rounds || []
                    }
                );
            } else {
                setGame(null);
            }
        });

        onValue(ref(db, "servers/" + server.uid + "/game/current-round"), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setCurrentRound(
                    new RoundModel(
                        data.number,
                        data.participants || [],
                        (data.places || []).sort((place: PlaceModel) => place.number).reverse()
                    )
                );
            } else {
                setCurrentRound(null);
            }
        });
    }, []);

    useEffect(() => {
        const pointMap = new Map<string, number>();

        if (!game || !game.players) return;

        game.players.forEach((player) => {
            pointMap.set(player.uid, 0)
        })

        if (currentRound && currentRound.places.length === currentRound.participants.length) {
            pointMap.set(currentRound.places[0].player.uid, 1)
        }

        if (!game.rounds) return;

        game.rounds.forEach((round) => {
            const playerPoints = pointMap.get(round.places[0].player.uid);

            if (playerPoints) {
                pointMap.set(round.places[0].player.uid, playerPoints + 1)
            } else {
                pointMap.set(round.places[0].player.uid, 1)
            }
        })

        const newPoints = Array.from(pointMap).map(([key, value]) => {
            return {
                name: game.players.find((player) => player.uid === key)?.name || "",
                points: value
            }
        })

        setPoints(newPoints);
    }, [currentRound, game]);

    useEffect(() => {
        const loseWaysMap = new Map<string, number>();

        if (!game || !game.players) return;

        if (currentRound) {
            currentRound?.places.forEach((place) => {
                const loseWay = place.loseWay;
                if (loseWay != null) {
                    if (loseWaysMap.has(loseWay.uid)) {
                        loseWaysMap.set(loseWay.uid, loseWaysMap.get(loseWay.uid) as number + 1)
                    } else {
                        loseWaysMap.set(loseWay.uid, 1)
                    }
                }
            })
        }

        if (!game.rounds) return;

        game.rounds.forEach((round) => {
            round.places.forEach((place) => {
                const loseWay = place.loseWay;

                if (loseWay != null) {
                    if (loseWaysMap.has(loseWay.uid)) {
                        loseWaysMap.set(loseWay.uid, loseWaysMap.get(loseWay.uid) as number + 1)
                    } else {
                        loseWaysMap.set(loseWay.uid, 1)
                    }
                }
            })
        })

        const newLoseWays = Array.from(loseWaysMap).map(([key, value]) => {
            return {
                id: key,
                value: value,
                label: loseWays.find((loseWay) => loseWay.uid === key)?.name || "Unbekannt"
            }
        })

        setOccurringLoseWays(newLoseWays);
    }, [currentRound, game]);

    useEffect(() => {
        const newPlaceDistribution: {x: number, y: number, id: number}[] = []

        if (!game || !game.players) return;

        setPlaceBaseDistribution((game.players.map((player, index) => {
            return {
                x: 0,
                y: index,
                id: index
            }
        })))

        const getPlayerIndex = (player: PlayerModel) => {
            return game.players.findIndex((p) => p.uid === player.uid)
        }

        if (currentRound) {
            currentRound.places.forEach((place) => {
                newPlaceDistribution.push({
                    x: place.number,
                    y: getPlayerIndex(place.player),
                    id: getPlayerIndex(place.player)
                })
            })
        }

        if (!game.rounds) return;

        game.rounds.forEach((round) => {
            round.places.forEach((place) => {
                newPlaceDistribution.push({
                    x: place.number,
                    y: getPlayerIndex(place.player),
                    id: getPlayerIndex(place.player)
                })
            })
        })

        setPlaceDistribution(newPlaceDistribution);
    }, [currentRound, game]);

    const endGame = () => {
        set(ref(db, "servers/" + server.uid + "/game"), {
            started: false
        }).then(() => {
            set(ref(db, "servers/" + server.uid + "/games/" + game?.uid), {
                ...game,
                endTime: new Date().toISOString(),
                startTime: game?.startTime.toISOString()
            }).then(() => {
                navigate("servers/" + server.uid + "/games")
            })
        })
    }

    const addPlayer = () => {
        dialog.open(
            new DialogModel(
                "Spieler hinzufügen",
                <PlayerSelectionDialog />,
                ""
            )
        )
    }

    const startNewRound = () => {
        dialog.open(
            new DialogModel(
                "Aussetzende Spieler",
                <ParticipantSelection />,
                ""
            )
        )
    }

    const makePlayerLoose = () => {
        dialog.open(
            new DialogModel(
                "Spieler auscheiden",
                <LoseSelection />,
            )
        )
    }

    const endRound = () => {
        const newRounds = game!.rounds || [];
        const round = {
            ...currentRound,
            isDone: true
        } as RoundModel;
        newRounds.push(round);

        set(ref(db, "servers/" + server.uid + "/game/rounds"), newRounds).then(() => {
            set(ref(db, "servers/" + server.uid + "/game/current-round"), null)
        })
    }

    const showPlayers = () => {
        dialog.open(
            new DialogModel(
                "Spieler",
                <PlayerPreview />,
            )
        )
    }

    return (
        <div className="Game">
            <h1>Spiel</h1>

            { !thereIsActiveGame ? <>
                <MdError size={60} />
                <h2>Aktuell gibt es kein laufendes Spiel</h2>
                <div className="GameThereIsNoActiveGameContent">
                    <Button text="Erstelle ein Spiel" onClick={() => {
                        navigate("/create-game")
                    }} />
                    <Button text="Gehe zu abgeschlossenen Spielen" onClick={() => {
                        navigate("/games")
                    }} />
                </div>
            </> : <>
                <h2>Start</h2>
                <ValueField value={game?.startTime.toLocaleString() || ""} />

                <h2>Aktionen</h2>
                <div className="GameActions">
                    <Button text="Spieler anzeigen" onClick={showPlayers} enabled={!currentRound} />
                    <Button text="Spiel beenden" onClick={endGame} enabled={!currentRound} />
                    <Button text="Spieler hinzufügen" onClick={addPlayer} enabled={!currentRound} />
                </div>

                <h2>Aktuelle Runde</h2>
                {
                    currentRound ? <div className="GameCurrentRound">
                        { currentRound.participants.length === currentRound.places.length ?
                            <Button text="Runde beenden" onClick={endRound} /> :
                            <Button text="Spieler ausscheiden" onClick={makePlayerLoose} /> }
                        <RoundCard round={currentRound} />
                    </div> : <Button text="Neue Runde starten" onClick={startNewRound} />
                }

                <h2>Platzverteilung</h2>
                <ScatterChart
                    series={[
                        { data: placeDistribution, color: 'white' },
                        { data: placeBaseDistribution, color: 'transparent' }
                    ]}
                    xAxis={[{
                        min: 0,
                        tickNumber: game?.players.length || 0,
                    }]}
                    yAxis={[{
                        min: -1,
                        tickNumber: game?.players.length || 0,
                        tickMinStep: 1,
                        valueFormatter: (value) => {
                            if (!game) return "";
                            const playerNumber = value as number;

                            if (playerNumber === -1) return "";

                            return game?.players[playerNumber].name || ""
                        }

                    }]}
                    height={350}
                    width={350}
                    margin={{ left: 70, top: 10, right: 30, bottom: 30 }}
                    sx={{
                        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                            fontFamily: "myFirstFont",
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-tick":{
                            stroke:"#ffffff",
                            strokeWidth: 1.5
                        },
                    }}
                />

                <h2>Punkteverteilung</h2>
                <BarChart
                    dataset={points}
                    yAxis={[{
                        scaleType: 'band',
                        dataKey: 'name',
                    }]}
                    xAxis={[{
                        tickNumber: 1,
                    }]}
                    series={[{ dataKey: 'points', color: 'white' }]}
                    layout="horizontal"
                    width={350}
                    height={350}
                    sx={{
                        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                            fontFamily: "myFirstFont",
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-tick":{
                            stroke:"#ffffff",
                            strokeWidth: 1.5
                        },
                    }}
                    margin={{ left: 70, top: 10, right: 30, bottom: 30 }}
                />

                <h2>Rausgeflogen durch</h2>
                <div className="GamePiChart">
                    <PieChart
                        series={[
                            {
                                data: occurringLoseWays,
                                innerRadius: 35,
                                cornerRadius: 8,
                                paddingAngle: 4,
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                arcLabel: (item) => "" + item.value,
                                arcLabelMinAngle: 6,
                            }
                        ]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fill: 'white',
                                fontWeight: 'bold',
                            },
                        }}
                        slotProps={
                            {
                                legend: {
                                    direction: 'row',
                                    position: { vertical: 'bottom', horizontal: 'middle' },
                                    padding: 0,
                                    labelStyle: {
                                        fontSize: 14,
                                        fill: 'white',
                                    },
                                },
                            }
                        }
                        width={350}
                        height={250}
                        margin={{ left: 0, top: 0, right: 0, bottom: 80 }}
                    />
                </div>

                <h2>Letze runden</h2>
                { (game && game.rounds.length === 0) && <h4 className="GameNoRoundsText">Keine Runden gespielt</h4>}
                <div className="GameLastRounds">
                    { game?.rounds.map((round, index) => {
                        return <RoundCard key={index} round={round} />
                    }) }
                </div>
            </> }
        </div>
    );
};

export default Game;