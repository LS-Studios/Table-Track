import React from 'react';
import {RankModel} from "../../../data/game/RankModel";
import "./RankCard.scss";

const RankCard = ({
    rank
}: {
    rank: RankModel
}) => {
    return (
        <div className="RankCard">
            <div className="RankCardContent">
                <div style={{width:"20%", textAlign:"left"}}>{rank.rank || ""}.</div>
                <div style={{width:"60%", textAlign:"center"}}>{rank.player?.name || ""}</div>
                <div style={{width:"20%", textAlign:"right"}}>{rank.score || "0"}</div>
            </div>
        </div>
    );
};

export default RankCard;