const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}

const maskBit = (value, bit) => value & ~(1<<bit);

const swapNibbles = (value) => {
    return ( (value & 0x0F) << 4 | (value & 0xF0) >> 4 )
}

const colorMega65 = (color) => {

    let result = { r: 0, g: 0, b: 0}
    result.r = maskBit(color.r,0)
    result.r = swapNibbles(result.r)
    result.g = swapNibbles(color.g)
    result.b = swapNibbles(color.b)

    return result

}

export { createUUID, colorMega65 }