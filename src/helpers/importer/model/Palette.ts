/**
 Copyright (c) 2015 Michel de Bree
 https://github.com/micheldebree/retropixels
 */

export default class Palette {
    public colors: number[][]

    public enabled: number[] = []

    constructor (colors: number[][]) {
        this.colors = colors
        colors.forEach((_color, index) => this.enabled.push(index))
    }
}