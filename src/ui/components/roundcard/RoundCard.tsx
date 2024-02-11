import React, {useEffect, useState} from 'react';
import {RoundModel} from "../../../data/game/RoundModel";
import "./RoundCard.scss";
import Divider from "../divider/Divider";
import {PlaceModel} from "../../../data/game/PlaceModel";

const RoundCard = ({
    round,
}: {
    round: RoundModel
}) => {
    const [places, setPlaces] = useState<PlaceModel[]>([])

    useEffect(() => {
        const places = round.places.sort((a, b) => a.number - b.number);
        setPlaces(places);
    }, []);

    const getHeaderText = () => {
        if (round.isDone) {
            return round.places.find((place) => place.number === 1)?.player.name + " hat gewonnen";
        } else if (round.places.length === round.participants.length) {
            return round.places.find((place) => place.number === 1)?.player.name + " ist der gewinner";
        } else {
            return round.participants.length - round.places.length + " verbleibende Spieler";
        }
    }

    return (
        <div className="RoundCard">
            <div className="RoundCardRoundHeader">{round.number}. Runde</div>

            <Divider />

            <div className="RoundCardPlayerLeft">{ getHeaderText() }</div>

            { round.places.length > 0 && <>
                <Divider />
                <div className="RoundCardPlaceList">
                    { places.map((place) => {
                        return (
                            <div className="RoundCardPlace">
                                <h4>{place.number}.</h4>
                                <h4 className="RoundCardPlacePlayerName">{place.player.name}</h4>
                            </div>
                        )
                    }) }
                </div>
            </>}
        </div>
    );
};

export default RoundCard;