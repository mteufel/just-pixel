// @ts-nocheck
import {colorMega65, createBinaryLine, getNibble} from '../util/utils'
import {Color } from '../modals/palette/ColorPalette'
import ColorPaletteStore from "./ColorPaletteStore";
import ScreenStore from "./ScreenStore";
import ColorSelectionStore from "./ColorSelectionStore";

const createBitmapStore = () => {

    let bitmap : number[] = []          // Hires: 8 x 8 bits per char (8 Bytes), 40 chars per line (320 Bytes), 25 lines (8000 Bytes)

    let screenRam : number[] = []       // Hires:
                                        // 1 Byte per char, 40 chars per line, 25 line   = 1000 Bytes
                                        // Color for one char e.g. 176
                                        //     => $b0 => Highbyte : grey ($b)
                                        //               LowByte  : black ($0)


    let colorRam : number[] = []

    let backgroundColorMCM : Color = null

    let mode : number = 1           // 0 = Classic Hires Bitmaps C64
                                    // 1 = Multicolor Bitmap
                                    // 2 = Full Color Mode


    let subscribers : Function[] = []

    let subscribersCursorMove : Function[] = []

    let foregroundColor1FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor2FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor3FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor4FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor5FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor6FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor7FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor8FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor9FCM : Color = ColorPaletteStore.colors()[0]
    let foregroundColor0FCM : Color = ColorPaletteStore.colors()[0]


    const callSubscribers = () => {
        subscribers.forEach( callFunction => callFunction())
    }

    const callSubscribersCursorMove = () => {
        subscribersCursorMove.forEach( callFunction => callFunction())
    }

    return {
        createMulticolorTest: () => {
            console.log('createMulticolorTest')
            BitmapStore.setBackgroundColorMCM(6)
            BitmapStore.setForegroundColor3MCM(0, BitmapStore.getColorByIndex(14).colorIndexHex)
            let myBitmap = BitmapStore.getBitmap()
            myBitmap[0] = 51
            myBitmap[1] = 15
            myBitmap[2] = 240
            BitmapStore.setBitmap(myBitmap)


        },
        //getNibble: (number : number, nth : number) =>  (number >> 4*nth) & 0xF,
        getNibble: (number : number, nth : number) =>  getNibble(number, nth),
        clearBitmap_: ():any => {
            console.log('clearBitmap_')
            let myBitmap = []
            let myScreenRam = []
            let myColorRam = []
            if (BitmapStore.isFCM()) {
                // In Full Color Mode we can have up to 1000 unique characters on the screen (H320)
                // so this means a lot of "bitmap" or better "charset" data. This is 1000 times 8x8 Bytes = 64000 Bytes
                for (let i = 0; i < 64000; i++) {
                    myBitmap.push(0)
                }
            } else {
                for (let i = 0; i < 8000; i++) {
                    myBitmap.push(0)
                }
            }
            if (BitmapStore.isFCM()) {
                for (let i = 0; i < 1000; i++) {
                    myScreenRam.push(i)
                    myColorRam.push(0)
                }
            } else {
                for (let i = 0; i < 1000; i++) {
                    myScreenRam.push(0)
                    myColorRam.push(0)
                }
            }
            return { bitmap: myBitmap, screenRam: myScreenRam, colorRam: myColorRam }

        },
        clearBitmap: function() {
            console.log('clearBitmap')
            let clearAreas = this.clearBitmap_()
            console.log('clearAreas....', clearAreas)
            bitmap = clearAreas.bitmap
            screenRam = clearAreas.screenRam
            colorRam = clearAreas.colorRam
            if (BitmapStore.isMCM()) {
                BitmapStore.setBackgroundColorMCM(ColorPaletteStore.defaultColors()[0])
            }
        },
        setBitmap: (data : number[]) => bitmap = data,
        setScreenRam: (data : number[] ) => screenRam = data,
        dumpBitmap: () => {
            if (BitmapStore.isMCM()) {
                console.info( ' Dumping: MCM ----------------------------------------')
                console.log( { bitmap })
                console.log( { screenRam })
                console.log( { colorRam })
                console.log( { backgroundColorMCM })
                defaultColors.forEach(  color => {
                    let res = colorMega65(color)
                    console.log ('colorConversion ', { color, res })
                } )

            } else {
                console.info( ' Dumping: HIRES ----------------------------------------')
                console.log( { bitmap })
                console.log( { screenRam })
            }

        },
        flipBackground: (index : number, pos : number) => {
            bitmap[index] = bitmap[index] & ~(1<<pos)  //  CLEAR BIT
            callSubscribers()
        },
        flipForeground: (index : number, pos : number) => {
            //bitmap[index] = bitmap[index]^(1<<pos)  // XOR
            bitmap[index] = bitmap[index] | (1<<pos)  //  OR / SET BIT
            callSubscribers()
        },
        flipBit: (index : number,pos : number) => {
            //bitmap[index] = bitmap[index]^(1<<pos)  // XOR
            bitmap[index] = bitmap[index]|(1<<pos)  //  OR
            callSubscribers()
        },
        setBitmapAt: (index: number, value: number) => {
            bitmap[index] = value
            callSubscribers()
        },
        setBinaryLine: (index : number, binaryLine : string) => bitmap[index] = parseInt(binaryLine,2),
        callSubscribers: () => {
            callSubscribers()
        },
        clearSubscribers: () => subscribers = [],
        callSubscribersCursorMove: () => callSubscribersCursorMove(),
        getColorByIndex: (idx : number ) => ColorPaletteStore.colors().find( color  => color.colorIndex===idx),
        getColorByHexNumber: (hex : number) => ColorPaletteStore.colors().find( color => color.colorIndex===hex),
        getColorByName: (name : number ) => ColorPaletteStore.colors().find( color => color.color===name),


        getColorFromScreenRam: (memoryPosition : number) => screenRam[memoryPosition/8],

        // ------------------------------------------------------------
        //   Color Getters and Setter for HIRES Mode
        // ------------------------------------------------------------
        getBackgroundColorHires: (memoryPosition : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            // returns the LowByte == Background
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 0))
        },
        getForegroundColorHires: (memoryPosition : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            // returns the HighByte == Foreground
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 1))
        },
        setBackgroundColorHires: (memoryPosition : number, bg : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            let fg = BitmapStore.getNibble(color, 1)
            screenRam[memoryPosition/8] =  (fg << 4) | bg
        },
        setForegroundColorHires: (memoryPosition : number, fg : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            let bg = BitmapStore.getNibble(color, 0)
            screenRam[memoryPosition/8] =  (fg << 4) | bg
        },




        // ------------------------------------------------------------
        //   Color Getters and Setter for MULTICOLOR Mode
        // ------------------------------------------------------------

        getBackgroundColorMCM: () => {
            return backgroundColorMCM
        },
        getForegroundColorMCM: (memoryPosition : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)
            // returns the HighByte == Foreground
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 1))
        },
        getForegroundColor2MCM: (memoryPosition : number) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 0))
        },
        getForegroundColor3MCM: (memoryPosition : number) => {
            let color = colorRam[memoryPosition/8]
            return BitmapStore.getColorByHexNumber(color)
        },

        setBackgroundColorMCM: (bgColor : Color) => {
            backgroundColorMCM = bgColor;

        },
        setForegroundColorMCM: (memoryPosition : number, selColor : Color) => {

            //console.log("----------------------------------------")
            //console.log("-------------------setForegroundColorMCM")
            //console.log("start................ " ,   memoryPosition, selColor )
            //console.log("screen-ram-old/dez... " ,  BitmapStore.getColorFromScreenRam(memoryPosition))
            //console.log("screen-ram-old/hex... " ,  BitmapStore.getColorFromScreenRam(memoryPosition).toString(16))
            let num = parseInt(BitmapStore.getColorFromScreenRam(memoryPosition).toString(16), 16)
            //let low = (num & 0xF0) >> 4
            let high = num & 0x0F
            let low_new = selColor.colorIndex.toString(16)
            let high_new = high
            let result = "".concat(low_new.toString(16), high_new.toString(16))
            //console.log("num/low_new/high_new..", num.toString(16), low_new.toString(16), high_new.toString(16))
            //console.log("result hex............", result)
            //console.log("result dez............", parseInt(result,16))
            screenRam[memoryPosition/8] =  parseInt(result,16)
            //console.log("----------------------------------------")


        },

        setForegroundColor2MCM: (memoryPosition : number, selColor : Color) => {

            //console.log("----------------------------------------")
            //console.log("------------------setForegroundColor2MCM")
            //console.log("start................ " ,   memoryPosition, selColor )
            //console.log("screen-ram-old/dez... " ,  BitmapStore.getColorFromScreenRam(memoryPosition))
            //console.log("screen-ram-old/hex... " ,  BitmapStore.getColorFromScreenRam(memoryPosition).toString(16))
            let num = parseInt(BitmapStore.getColorFromScreenRam(memoryPosition).toString(16), 16)
            let low = (num & 0xF0) >> 4
            //let high = num & 0x0F
            let low_new = low
            let high_new = selColor.colorIndex.toString(16)
            let result = "".concat(low_new.toString(16), high_new.toString(16))
            //console.log("num/low_new/high_new..", num.toString(16), low_new.toString(16), high_new.toString(16))
            //console.log("result hex............", result)
            //console.log("result dez............", parseInt(result,16))
            screenRam[memoryPosition/8] =  parseInt(result,16)
            //console.log("----------------------------------------")

        },

        setForegroundColor3MCM: (memoryPosition : number, selColor : Color) => {
            // MCM Foreground color to be stored into Color RAM
            colorRam[memoryPosition/8] = selColor.colorIndex
        },



        download: (fileName : string) => {
            console.log('download ', fileName)
            let fileCreated = false

            if (BitmapStore.isMCM()) {

                // ======================================
                //  Prepare Multicolor (MCM) File
                // ======================================

                // 0000-1f3f Bitmap data (8000 bytes)
                // 1f40-2327 ScreenOld RAM colors (1000 bytes)
                // 2828-270f Color RAM (1000 bytes)
                // 2710 background color
                // 2711-2721 Color Palette REDs   10001 - 10017
                // 2722-2732 Color Palette GREENs 10018 - 10034
                // 2733-2743 Color Palette BLUEs  10035 - 10051
                // 2744 mode


                let bitmapLength = 8000
                let screenRamLength = 1000
                let colorRamLength = 1000
                let backgroundLength = 1
                let identifier = 1
                let reds = 16
                let greens = 16
                let blues = 16
                var bytes =  new Uint8Array( bitmapLength + screenRamLength + colorRamLength + backgroundLength + reds + greens + blues + identifier)
                var idx = 0
                console.log('download bitmap length=', BitmapStore.getBitmap().length)
                BitmapStore.getBitmap().forEach( byte => {
                    bytes[idx] = byte
                    idx++
                })
                console.log('download screenRam length=', BitmapStore.getScreenRam().length)
                BitmapStore.getScreenRam().forEach( byte => {
                    bytes[idx] = byte
                    idx++
                })
                console.log('download colorRamLength length=', BitmapStore.getColorRam().length)
                BitmapStore.getColorRam().forEach( byte => {
                    bytes[idx] = byte
                    idx++
                })
                bytes[idx] = BitmapStore.getBackgroundColorMCM()
                idx++

                ColorPaletteStore.defaultColors().forEach( color => {
                    let res = colorMega65(color)
                    bytes[idx] = res.r
                    idx++
                })
                ColorPaletteStore.defaultColors().forEach( color => {
                    let res = colorMega65(color)
                    bytes[idx] = res.g
                    idx++
                })
                ColorPaletteStore.defaultColors().forEach( color => {
                    let res = colorMega65(color)
                    bytes[idx] = res.b
                    idx++
                })

                bytes[idx] = BitmapStore.getMode()  // which type of file to we provide ?
                fileCreated = true

            } else {

                // ======================================
                //  Prepare Hires Bitmap File
                // ======================================


                let bitmapLength = 8000
                let screenRamLength = 1000
                let identifier = 1
                var bytes =  new Uint8Array( bitmapLength + screenRamLength + identifier)
                var idx = 0
                console.log('download bitmap length=', BitmapStore.getBitmap().length)
                BitmapStore.getBitmap().forEach( byte => {
                    bytes[idx] = byte
                    idx++
                })
                console.log('download screenRam length=', BitmapStore.getScreenRam().length)
                BitmapStore.getScreenRam().forEach( byte => {
                    bytes[idx] = byte
                    idx++
                })
                bytes[idx] = BitmapStore.getMode()  // which type of file to we provide ?
                fileCreated = true

            }

            if (fileCreated) {
                // Download the prepared file ....
                let blob = new Blob([bytes], { type: 'application/octet-stream' })
                let link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = fileName + '-' + BitmapStore.getModeAsText() + '.bin'
                link.click()
            }


        },

        getBitmap: () => bitmap,
        getScreenRam: () => screenRam,
        getColorRam: () => colorRam,
        subscribe: (fn : Function) => {
            subscribers.push(fn)
        },
        subscribeCursorMove: (fn : Function) => {
            subscribersCursorMove.push(fn)
        },
        dumpSubscribers: () => console.log(subscribers),
        activateHiresBitmaps: () => mode = 0,
        activateMulticolorBitmaps: () => mode = 1,
        activateFullColorMode: () => mode=2,
        isMCM: () => mode == 1,
        isFCM: () => mode == 2,
        getMode: () => mode,
        getModeAsText: () => {
            switch (mode) {
                case 0:
                    return 'hires'
                    break
                case 1:
                    return 'mcm'
                    break
                case 2:
                    return 'fcm'
                    break
            }
            return '???'

        },
        setColorRam: (colRam : number[]) => colorRam = colRam,
        getForegroundColor1FCM: () => foregroundColor1FCM,
        setForegroundColor1FCM: (color) => foregroundColor1FCM = color,
        getForegroundColor2FCM: () => foregroundColor2FCM,
        setForegroundColor2FCM: (color) => foregroundColor2FCM = color,
        getForegroundColor3FCM: () => foregroundColor3FCM,
        setForegroundColor3FCM: (color) => foregroundColor3FCM = color,
        getForegroundColor4FCM: () => foregroundColor4FCM,
        setForegroundColor4FCM: (color) => foregroundColor4FCM = color,
        getForegroundColor5FCM: () => foregroundColor5FCM,
        setForegroundColor5FCM: (color) => foregroundColor5FCM = color,
        getForegroundColor6FCM: () => foregroundColor6FCM,
        setForegroundColor6FCM: (color) => foregroundColor6FCM = color,
        getForegroundColor7FCM: () => foregroundColor7FCM,
        setForegroundColor7FCM: (color) => foregroundColor7FCM = color,
        getForegroundColor8FCM: () => foregroundColor8FCM,
        setForegroundColor8FCM: (color) => foregroundColor8FCM = color,
        getForegroundColor9FCM: () => foregroundColor9FCM,
        setForegroundColor9FCM: (color) => foregroundColor9FCM = color,
        getForegroundColor0FCM: () => foregroundColor0FCM,
        setForegroundColor0FCM: (color) => foregroundColor0FCM = color,

        setPixel: (x: number, y: number, colorPart: String) => {
            //console.log('setPixel x=' + x + ' y=' + y + ' colorPart=' + colorPart)
            let coords = ScreenStore.calculateCoordinates(x, y)
            let color = ColorSelectionStore.color()

            if (BitmapStore.isMCM()) {



                let pixelPattern = '00'
                //let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                //let charPosition = 7-ScreenStore.getCursorX()
                let index = coords.memPos + (coords.pixelY-1)
                let charPosition = 7 - (coords.pixelX-1)

                //let binary = BitmapStore.getBinaryLine(index)
                let binary = createBinaryLine(BitmapStore.getBitmap()[index]).binary
                //let binaryIndex7 = binary.substr(0,2)
                //let binaryIndex6 = binary.substr(2,2)
                //let binaryIndex5 = binary.substr(4,2)
                //let binaryIndex4 = binary.substr(6,2)
                let binaryIndex7 = binary.substring(0,2)
                let binaryIndex6 = binary.substring(2,4)
                let binaryIndex5 = binary.substring(4,6)
                let binaryIndex4 = binary.substring(6,8)

                switch (colorPart) {
                    case "b":
                        pixelPattern = '00'
                        BitmapStore.setBackgroundColorMCM(color)
                        break;
                    case "f":
                        pixelPattern = '01'
                        BitmapStore.setForegroundColorMCM(coords.memPos, color)
                        break;
                    case "f2":
                        pixelPattern = '10'
                        BitmapStore.setForegroundColor2MCM(coords.memPos, color)
                        break;
                    case "f3":
                        BitmapStore.setForegroundColor3MCM(coords.memPos, color)
                        pixelPattern = '11'
                }

                switch (charPosition) {
                    case 7:
                        binaryIndex7 = pixelPattern
                        break;
                    case 6:
                        binaryIndex6 = pixelPattern
                        break;
                    case 5:
                        binaryIndex5 = pixelPattern
                        break;
                    case 4:
                        binaryIndex4 = pixelPattern
                        break;
                }
                let binaryNew = ''.concat(binaryIndex7 , binaryIndex6 , binaryIndex5 , binaryIndex4)
                BitmapStore.setBinaryLine(index, binaryNew)
                ScreenStore.doCharChange(coords.memPos)
                ScreenStore.refreshChar(coords.memPos)
                BitmapStore.callSubscribers()
            }
        },
        bresenhamEllipse: () => {
            // Source Wikipedia
            let xm = 22
            let ym = 36
            let a = 4
            let b = 10

            let dx = 0
            let dy = b
            let a2 = a*a
            let b2 = b*b
            let err = b2-(2*b-1)*a2
            let e2

            do
            {
                BitmapStore.setPixel(xm + dx, ym + dy, 'f')
                BitmapStore.setPixel(xm - dx, ym + dy, 'f')
                BitmapStore.setPixel(xm - dx, ym - dy, 'f')
                BitmapStore.setPixel(xm + dx, ym - dy, 'f')
                e2 = 2*err
                if (e2 <  (2 * dx + 1) * b2) { ++dx; err += (2 * dx + 1) * b2 }
                if (e2 > -(2 * dy - 1) * a2) { --dy; err -= (2 * dy - 1) * a2 }
            }
            while (dy >= 0)

            while (dx++ < a)
            {
                BitmapStore.setPixel(xm+dx, ym, 'f')
                BitmapStore.setPixel(xm-dx, ym, 'f')
            }

        }






    }
}

const BitmapStore = createBitmapStore()

export default BitmapStore
