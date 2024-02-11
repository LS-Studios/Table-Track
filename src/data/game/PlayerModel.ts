export class PlayerModel {
    uid: string;
    name: string;
    image: string;

    constructor(uid: string, name: string, image?: string) {
        this.uid = uid;
        this.name = name;
        this.image = image || "image_preview";
    }
}