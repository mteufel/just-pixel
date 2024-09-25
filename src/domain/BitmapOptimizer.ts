export type Bo = {
    id: string;
    ref: string;
    mempos: number[],
    valueBitmap: number,
    valueColorRam: number,
    valueScreenRam: number,
    value: number,
}

export type BoResult = {
    areaX:number,
    areaY:number,
    blockSizeX:number,
    blockSizeY:number
    size:string,
    bytes:number,
    charsTotal:number
    bos:Bo[],
}

