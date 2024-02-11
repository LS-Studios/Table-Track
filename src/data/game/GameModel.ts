import {RoundModel} from "./RoundModel";
import {PlayerModel} from "./PlayerModel";
import {RulesEnum} from "./RulesEnum";

export class GameModel {
    uid: string;
    startTime: Date;
    endTime: Date | null;
    players: PlayerModel[];
    rounds: RoundModel[];
    rules: RulesEnum;

    constructor(uid: string, startTime: Date, endTime: Date | null, players: PlayerModel[], rounds: RoundModel[], rules: RulesEnum) {
        this.uid = uid;
        this.startTime = startTime;
        this.endTime = endTime;
        this.players = players;
        this.rounds = rounds;
        this.rules = rules;
    }
}