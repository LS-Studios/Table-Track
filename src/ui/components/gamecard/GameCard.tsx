import React, {useEffect} from 'react';
import {GameModel} from "../../../data/game/GameModel";
import "./GameCard.scss";
import {useNavigate} from "react-router-dom";
import Divider from "../divider/Divider";
import {BarChart} from "@mui/x-charts";

const GameCard = (
{
    game
}: {
    game: GameModel
}
) => {
    const navigate = useNavigate()

    const [points, setPoints] = React.useState<{name: string, points: number}[]>([{name: "", points: 0}])

    useEffect(() => {
        const pointMap = new Map<string, number>();

        if (!game || !game.rounds) return;

        game.players.forEach((player) => {
            pointMap.set(player.uid, 0)
        })

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
    }, []);

    const goToGameDetails = () => {
        navigate("/games/" + game.uid)
    }

    return (
        <div className="GameCard" onClick={goToGameDetails}>
            <div className="GameCardHeader">{game.startTime.toLocaleString()} - {game.endTime?.toLocaleString()}</div>

            <Divider />

            <BarChart
                dataset={points}
                yAxis={[{
                    scaleType: 'band',
                    dataKey: 'name',
                }]}
                xAxis={[{
                    tickNumber: 1
                }]}
                series={[{ dataKey: 'points', color: 'tomato' }]}
                layout="horizontal"
                width={350}
                height={300}
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
                margin={{ left: 70, top: 20, bottom: 30, right: 30 }}
            />
        </div>
    );
};

export default GameCard;