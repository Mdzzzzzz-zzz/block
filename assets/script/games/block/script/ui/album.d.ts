interface IAlbumItem {
    season: number;
    isShown: boolean;
}

interface IAlbumPage {
    name: string;
    type: number;
    page: number;
    childItemSeq: Array<number>;
}