import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import "./GameDetail.scss";
import {onValue, ref} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {GameModel} from "../../../data/game/GameModel";
import ValueField from "../../components/valuefield/ValueField";
import {BarChart, pieArcLabelClasses, PieChart, ScatterChart} from "@mui/x-charts";
import RoundCard from "../../components/roundcard/RoundCard";
import {RoundModel} from "../../../data/game/RoundModel";
import {PlaceModel} from "../../../data/game/PlaceModel";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {MdError} from "react-icons/md";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {LoseWay} from "../../../data/game/LoseWay";

const GameDetail = () => {
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const { uid } = useParams();

    const [game, setGame] = React.useState<GameModel | null>(null);
    const [gameNotFound, setGameNotFound] = React.useState<boolean>(false);
    const [rounds, setRounds] = useState<RoundModel[]>([]);
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

        onValue(ref(db, "servers/" + server.uid + "/games/" + uid), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setGame(
                    {
                        ...data,
                        startTime: new Date(data.startTime),
                        endTime: new Date(data.endTime)
                    }
                );
            } else {
                setGame(null);
                setGameNotFound(true);
            }
        });

        onValue(ref(db, "servers/" + server.uid + "/games/" + uid + "/rounds"), (snapshot) => {
            const data = snapshot.val();

            if (data) {
                setRounds(Object.keys(data).map((key) => {
                    return new RoundModel(
                        data[key].number,
                        data[key].participants || [],
                        (data[key].places || []).sort((place: PlaceModel) => place.number),
                        data[key].isDone
                    )
                }));
            } else {
                setRounds([]);
            }
        })
    }, []);

    useEffect(() => {
        const pointMap = new Map<string, number>();

        if (!game) return;

        game.players.forEach((player) => {
            pointMap.set(player.uid, 0)
        })

        rounds.forEach((round) => {
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
    }, [rounds, game]);

    useEffect(() => {
        const loseWaysMap = new Map<string, number>();

        if (!game) return;

        rounds.forEach((round) => {
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
    }, [rounds, game]);

    useEffect(() => {
        const newPlaceDistribution: {x: number, y: number, id: number}[] = []

        if (!game) return;

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

        rounds.forEach((round) => {
            round.places.forEach((place) => {
                newPlaceDistribution.push({
                    x: place.number,
                    y: getPlayerIndex(place.player),
                    id: getPlayerIndex(place.player)
                })
            })
        })

        setPlaceDistribution(newPlaceDistribution);
    }, [rounds, game]);

    return (
        <div className="GameDetail">
            <h1>Spiel details</h1>

            { gameNotFound ? <>
                <MdError size={60} />
                <h2 className="GameDetailGameCouldNotBeFound">Das Spiel mit dieser id konnte nicht gefunden werden!</h2>
            </> : <>
                <h2>Start</h2>
                <ValueField value={game?.startTime.toLocaleString() || ""} />

                <h2>Ende</h2>
                <ValueField value={game?.endTime?.toLocaleString() || ""} />

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
                        tickMinStep: 1,
                        tickNumber: game?.players.length || 0,
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
                    height={350}
                    margin={{ left: 0, top: 0, right: 0, bottom: 80 }}
                />

                <h2>Runden</h2>
                { rounds.length === 0 && <h4 className="GameNoRoundsText">Keine Runden gespielt</h4>}
                <div className="GameLastRounds">
                    { rounds.map((round, index) => {
                        return <RoundCard key={index} round={round} />
                    }) }
                </div>
            </>}
        </div>
    );
};

export default GameDetail;