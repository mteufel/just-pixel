// @ts-nocheck
import ScreenStore from "../stores/ScreenStore";
import {arrayRotate, calculateMempos, calculateXY, refreshComplete, toBinary} from "./utils";
import BitmapStore from "../stores/BitmapStore";

enum DIRECTION {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

function movePixelsLeftRight(direction:DIRECTION) {

    let cc = ScreenStore.getCopyContext()
    //console.log('copy-context......', cc)
    //console.log('direction.........', direction)

    let doRight = false
    if (direction == DIRECTION.RIGHT) {
        doRight = true
    }
    let memPosCache = []

    // get mempos per axis to move
    for (let y = cc.startCharY; y < cc.endCharY+1; y++) {
        memPosCache = []
        // get mempos per axis to move
        for (let x = cc.startCharX; x < cc.endCharX+1; x++) {
            memPosCache.push( calculateMempos(x, y) )
        }

        // create a byte array for all pixels in this axis (line by line)
        for (let i = 0; i < 8 ; i++) {
            let bits = []
            memPosCache.forEach( memPos => {
                bits = bits.concat( toBinary( BitmapStore.getBitmap()[memPos+i]).split("") )
            } )
            // move the line 1 pixel
            arrayRotate( bits, 2, doRight )
            // get the bytes out of the line and return them back into the bitmap
            memPosCache.forEach( memPos => {
                let calc = calculateXY(memPos)
                let neu = bits.slice(calc.z, calc.z + 8)
                neu = parseInt(neu.join(""),2)
                BitmapStore.getBitmap()[memPos+i] = neu
            })
        }

    }
    refreshComplete()
}

function movePixelsUpDown(direction) {

    let cc = ScreenStore.getCopyContext()
    //console.log('copy-context......', cc)
    //console.log('direction.........', direction)

    let doDown = false
    if (direction == DIRECTION.DOWN) {
        doDown = true
    }
    let memPosCache = []

    for (let x = cc.startCharX; x < cc.endCharX+1; x++) {
        moveY(cc, memPosCache, doDown, x)
        memPosCache = []
    }

    refreshComplete()

}
function moveY(cc, memPosCache, doDown, xPos) {
    // get mempos per axis to move
    for (let y = cc.startCharY; y < cc.endCharY+1; y++) {
        memPosCache.push( calculateMempos(xPos, y) )
    }
    console.log('xPos...........', xPos)
    console.log('memPosCache....', memPosCache)

    let bits_1 = []
    let bits_2 = []
    let bits_3 = []
    let bits_4 = []
    memPosCache.forEach( memPos => {
        for (let i = 0; i < 8; i++) {
            let binary = toBinary(BitmapStore.getBitmap()[memPos + i]).split("")
            bits_1 = bits_1.concat(binary[0])
            bits_1 = bits_1.concat(binary[1])
            bits_2 = bits_2.concat(binary[2])
            bits_2 = bits_2.concat(binary[3])
            bits_3 = bits_3.concat(binary[4])
            bits_3 = bits_3.concat(binary[5])
            bits_4 = bits_4.concat(binary[6])
            bits_4 = bits_4.concat(binary[7])
        }
    })

    let all = [ bits_1, bits_2, bits_3, bits_4 ]
    console.log('all....', all)
    let counter = 0
    all.forEach( (bits) => {
        arrayRotate(bits, 2, doDown)
        let firstByte = 0
        let secondByte = 1
        memPosCache.forEach( memPos => {

            for (let i = 0; i < 8 ; i++) {
                let binary = toBinary( BitmapStore.getBitmap()[memPos+i]).split("")
                binary[0+counter] = bits[firstByte]
                binary[1+counter] = bits[secondByte]
                firstByte = firstByte + 2
                secondByte = secondByte + 2
                let neu = parseInt(binary.join(""),2)
                BitmapStore.getBitmap()[memPos+i] = neu
            }

        })
        counter = counter + 2
    })
}


function movePixels(direction:DIRECTION) {

    if (ScreenStore.getCopyContext().isCopyable()) {
        //console.log('=================== pixel-move ======= START')
        if (direction == DIRECTION.UP || direction == DIRECTION.DOWN) {
            movePixelsUpDown(direction)
        } else {
            movePixelsLeftRight(direction)
        }
        //console.log('=================== pixel-move ======= END')
    }
}

export { DIRECTION, movePixels}