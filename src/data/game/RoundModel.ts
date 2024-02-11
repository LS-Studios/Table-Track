import {PlaceModel} from "./PlaceModel";
import {PlayerModel} from "./PlayerModel";

export class RoundModel {
    number: number;
    participants: PlayerModel[];
    places: PlaceModel[];
    isDone: boolean

    constructor(number: number, participants: PlayerModel[], places: PlaceModel[], isDone?: boolean) {
        this.number = number;
        this.participants = participants;
        this.places = places;
        this.isDone = isDone || false;
    }
}