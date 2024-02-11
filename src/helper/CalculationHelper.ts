import {PlayerModel} from "../data/game/PlayerModel";

export class CalculationHelper {
    static difference(left: PlayerModel[], right: PlayerModel[]) {
        return left.filter(leftValue =>
            !right.some(rightValue =>
                leftValue.uid === rightValue.uid));
    }

    static getRandomImage = (players: PlayerModel[]) => {
        const array = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"]

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array.filter((image) => players.every((player) => player.image !== image))[0]
    };
}