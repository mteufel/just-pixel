// @ts-nocheck
import {PNG} from "pngjs/browser"
import BitmapStore from "../stores/BitmapStore"
import { cloneDeep } from "lodash-es"
import ScreenStore from "../stores/ScreenStore";

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

const flipBitsHorizontally = (value: number) => {

    // mode = MCM

    if (BitmapStore.getModeAsText()==='mcm') {

        let o =  pad(value.toString(2), 8, '0')
        console.log('flipBits old=', o)


        let pixel1 = o.substring(0,2)
        let pixel2 = o.substring(2,4)
        let pixel3 = o.substring(4,6)
        let pixel4 = o.substring(6,8)

        o = pixel4 + pixel3 + pixel2 + pixel1
        console.log('flipBits new=', o)
        return parseInt(o,2)

    }



    return value
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

function rgbToRgbValue(r , g ,b) {
    let value = r.toString(16) +  g.toString(16) + b.toString(16)
    let rgbValue = parseInt(value, 16)
    //console.log('rgbToRgbValue ', { r: r, g: g, b: b, value: rgbValue })
    return rgbValue
}

function rgbValueToRgb(rgbValue) {
    let r = rgbValue >> 16 & 0xFF;
    let g = rgbValue >> 8 & 0xFF;
    let b = rgbValue & 0xFF;
    return { r: r, g: g, b: b }
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

function uploadPng(file, resolver) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
            let arrayBuffer = e.target.result
            resolver(new PNG({}).parse(arrayBuffer, (err, image) => {
                if (err != null) {
                    console.log('error ', {err, image})
                }

            }).on("parsed", () => console.log('parsed ' ))) }
    })
}

function pad(num, padlen, padchar) {
    let pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    let pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

function deepCopy(o) {
    return cloneDeep(o)
}

function refreshComplete() {
    ScreenStore.refreshAll()
    ScreenStore.setLastAction('refresh-whole-preview' )
    BitmapStore.callSubscribers()
    ScreenStore.refreshChar()
    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())
}

function isUndefined(x) {
    return typeof x == "undefined";
}

function toBinary(d) {
    return  pad(Number(d).toString(2),8,'0')
}

function arrayRotate(arr, count, reverse) {
    for (let i = 0; i < count; i++) {
        if (reverse) arr.unshift(arr.pop());
        else arr.push(arr.shift());
    }
    return arr;
}

function precisionRound(number, precision) {
    let factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

function fromMemPos(mempos:number):object {
    let charX = (  (  precisionRound( (mempos / 320) - Math.trunc(mempos / 320)  , 3) * 320 ) / 8 ) + 1
    let charY = Math.trunc(mempos / 320) + 1
    let coordX = ( (charX - 1) * 4 ) + 1
    let coordY = ( (charY - 1) * 8 ) + 1
    return { mempos: mempos, charX: charX, charY: charY, coordX: coordX, coordY: coordY }
}

function getNibble(number : number, nth : number) {
   return (number >> 4*nth) & 0xF
}

function calculateMempos(x, y) {
    // x --->
    // y |
    //   V
    return  ( (y-1) * (40*8) + (x-1) * 8 )
}

function getDaultColors() {

    let defaultColors : Color[] = [
        { color: 'black',       colorIndex: 0, r: 0, g: 0, b: 0 },
        { color: 'white',       colorIndex: 1, r: 255, g: 255, b: 255 },
        { color: 'red',         colorIndex: 2, r: 0x68, g: 0x37, b: 0x2b },
        { color: 'cyan',        colorIndex: 3, r: 0x70, g: 0xa4, b: 0xb2 },
        { color: 'purple',      colorIndex: 4, r: 0x6f, g: 0x3d, b: 0x86 },
        { color: 'green',       colorIndex: 5, r: 0x58, g: 0x85, b: 0x43 },
        { color: 'blue',        colorIndex: 6, r: 0x35, g: 0x28, b: 0x79 },
        { color: 'yellow',      colorIndex: 7, r: 0xb8, g: 0xc7, b: 0x6f },
        { color: 'orange',      colorIndex: 8, r: 0x6f, g: 0x4f, b: 0x25 },
        { color: 'brown',       colorIndex: 9, r: 0x43, g: 0x39, b: 0x00 },
        { color: 'light red',   colorIndex: 10, r: 0x9a, g: 0x67, b: 0x59 },
        { color: 'dark grey',   colorIndex: 11, r: 0x44, g: 0x44, b: 0x44 },
        { color: 'grey',        colorIndex: 12, r: 0x6c, g: 0x6c, b: 0x6c },
        { color: 'light green', colorIndex: 13, r: 0x9a, g: 0xd2, b: 0x84 },
        { color: 'light blue',  colorIndex: 14, r: 0x6c, g: 0x5e, b: 0xb5 },
        { color: 'light grey',  colorIndex: 15, r: 0x94, g: 0x95, b: 0x95 },
    ]
    return colors;
}

function removeLastChar(str:string) {
    return str.substring(0, str.length - 1)
}

export { calculateMempos, arrayRotate, toBinary, isUndefined, createUUID, colorMega65,
         getColr, hexToRgb, rgbToHex, uploadData, uploadDataLineByLine, uploadPng, rgbToRgbValue,
         rgbValueToRgb, pad, flipBitsHorizontally, deepCopy, refreshComplete,
         removeLastChar, fromMemPos, getNibble }