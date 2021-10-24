// @ts-nocheck
const createUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r: number = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

const maskBit = (value: any, bit: number) => value & ~(1<<bit);

const swapNibbles = (value: any) => {
    return ( (value & 0x0F) << 4 | (value & 0xF0) >> 4 )
}

const colorMega65 = (color: any) => {

    let result = { r: 0, g: 0, b: 0}
    result.r = maskBit(color.r,0)
    result.r = swapNibbles(result.r)
    result.g = swapNibbles(color.g)
    result.b = swapNibbles(color.b)

    return result

}

const getColr = () => {
    fetch("http://www.colr.org/json/scheme/177").then(res => {
            res.json().then(json => console.log(json)
        )
    })
}

//function hexToAscii(str){
//    let hexString = str;
//    let strOut = '';
//    for (let x = 0; x < hexString.length; x += 2) {
//        strOut += String.fromCharCode(parseInt(hexString.substr(x, 2), 16));
//    }
//    return strOut;
//}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function uploadData(file, resolver) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
            let arrayBuffer = e.target.result
            resolver(new Uint8Array(arrayBuffer))
        }
    })
}

function uploadDataLineByLine(file, resolver) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = (e) => {
        let textBuffer = e.target.result
        resolver( textBuffer.split('\n'))
    }
}



export { createUUID, colorMega65, getColr, hexToRgb, rgbToHex, uploadData, uploadDataLineByLine }