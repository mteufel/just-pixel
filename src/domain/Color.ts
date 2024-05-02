export type Color = {
    color:string,
    colorIndex:number,
    r:number,
    g:number,
    b:number
}

export type PalettColor = Color & {
    style: string,
    selected: boolean,
    css: string
}