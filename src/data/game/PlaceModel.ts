import {PlayerModel} from "./PlayerModel";
import {LoseWay} from "./LoseWay";

export class PlaceModel {
    number: number;
    player: PlayerModel;
    loseWay: LoseWay | null;

    constructor(number: number, player: PlayerModel, loseWay: LoseWay | null) {
        this.number = number;
        this.player = player;
        this.loseWay = loseWay;
    }
}