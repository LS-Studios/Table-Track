import React, {useEffect, useState} from 'react';
import "./Games.scss";
import {onValue, ref} from "firebase/database";
import {db} from "../../../firebase/Firebase";
import {GameModel} from "../../../data/game/GameModel";
import GameCard from "../../components/gamecard/GameCard";
import {BarChart, pieArcLabelClasses, PieChart} from "@mui/x-charts";
import {PlayerModel} from "../../../data/game/PlayerModel";
import {RankModel} from "../../../data/game/RankModel";
import RankCard from "../../components/rankcard/RankCard";
import Divider from "../../components/divider/Divider";
import {useGlobalVariables} from "../../../provider/GlobalVariablesProvider";
import {ServerModel} from "../../../data/game/ServerModel";
import {compile} from "sass";
import {LoseWay} from "../../../data/game/LoseWay";

const Games = () => {
    const globalVariables = useGlobalVariables()
    const server = globalVariables.getLSVar("server") as ServerModel;

    const [players, setPlayers] = React.useState<PlayerModel[]>([]);
    const [games, setGames] = React.useState<GameModel[]>([]);
    const [ranking, setRanking] = React.useState<RankModel[]>([]);
    const [loseWays, setLoseWays] = useState<LoseWay[]>([]);
    const [occurringLoseWays, setOccurringLoseWays] = useState<{id: string, value: number, label: string}[]>([{id: "", value: 0, label: ""}]);

    useEffect(() => {
        if (!server) return

        onValue(ref(db, "data/lose-ways"), (snapshot) => {
            setLoseWays([])

            const data = snapshot.val();

            if (data) {
                setLoseWays(Object.keys(data).map((key) => {
                    return new LoseWay(
                        data[key].uid,
                        data[key].name,
                    )
                }));
            }
        })

        onValue(ref(db, "servers/" + server.uid + "/games"), (snapshot) => {
            setGames([])

            const data = snapshot.val();

            if (!data) return

            setGames(Object.keys(data).map((key) => {
                return {
                    ...data[key],
                    startTime: new Date(data[key].startTime),
                    endTime: new Date(data[key].endTime)
                }
            }).sort((a, b) => b.startTime.getTime() - a.startTime.getTime()) as GameModel[])
        })

        onValue(ref(db, "servers/" + server.uid + "/players"), (snapshot) => {
            setPlayers([])

            const data = snapshot.val();

            if (!data) return

            setPlayers(Object.values(data).map((value) => {
                return value as PlayerModel
            }))
        })
    }, [server]);

    useEffect(() => {
        const loseWaysMap = new Map<string, number>();

        games.forEach((game) => {
            if (game.rounds) {
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
            }
        })

        const newLoseWays = Array.from(loseWaysMap).map(([key, value]) => {
            return {
                id: key,
                value: value,
                label: loseWays.find((loseWay) => loseWay.uid === key)?.name || "Unbekannt"
            }
        })

        setOccurringLoseWays(newLoseWays);
    }, [games]);

    useEffect(() => {
        setRanking([])

        const rankingMap = new Map<string, number>();

        if (players.length === 0) return

        players.forEach((player) => {
            rankingMap.set(player.uid, 0)
        })

        games.forEach((game) => {
            if (game.rounds) {
                game.rounds.forEach((round) => {
                    const winner = round.places.find((place) => place.number === 1)!.player;

                    if (rankingMap.has(winner.uid)) {
                        rankingMap.set(winner.uid, rankingMap.get(winner.uid) as number + 1)
                    } else {
                        rankingMap.set(winner.uid, 1)
                    }
                })
            }
        })

        let currentRank = 0;
        // @ts-ignore
        setRanking(Array.from(new Map([...rankingMap.entries()].sort((a, b) => b[1] - a[1]))).map(([key, value]) => {
            currentRank++;
            return new RankModel(
                players.find((player) => player.uid === key)!,
                currentRank,
                value as number
            )
        }))
    }, [games, players]);

    return (
        <div className="Games">
            <h1>Spiele</h1>

            <h2>Rangliste</h2>
            <div className="GamesRankList">
                <div className="GamesRankListHeader">
                    <div>Platz</div>
                    <div>Spieler</div>
                    <div>Punkte</div>
                </div>
                <Divider />
                <div className="GamesRankListContent">
                    { ranking.length === 0 ? <div className="GameNoRoundsText">Es wurden noch keine Spiele gespielt</div> : <>
                        { ranking.map((rank) => {
                            return <RankCard key={rank.player?.uid || ""} rank={rank} />
                        }) }
                    </> }
                </div>
            </div>

            <h2>Insgesammt rausgeflogen durch</h2>
            { occurringLoseWays.length === 0 ? <div className="GameNoRoundsText">Es wurden noch keine Spiele gespielt</div> : <>
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
            </> }

            <h2>Abgeschlossene Spiele</h2>
            { occurringLoseWays.length === 0 ? <div className="GameNoRoundsText">Es wurden noch keine Spiele gespielt</div> : <>
                <div className="GamesDoneGames">
                    { games.map((game) => {
                        return <GameCard key={game.uid} game={game} />
                    }) }
                </div>
            </>}
        </div>
    );
};

export default Games;