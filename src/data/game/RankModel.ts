import {PlayerModel} from "./PlayerModel";

export class RankModel {
    public player: PlayerModel;
    public rank: number;
    public score: number;

    constructor(player: PlayerModel, rank: number, score: number) {
        this.player = player;
        this.rank = rank;
        this.score = score;
    }

}