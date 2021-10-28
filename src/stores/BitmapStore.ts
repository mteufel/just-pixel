// @ts-nocheck
import {colorMega65} from '../util/utils'
import { Color } from '../components/palette/ColorPalette'
import ColorPaletteStore from "./ColorPaletteStore";

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
        getNibble: (number : number, nth : number) =>  (number >> 4*nth) & 0xF,
        clearBitmap: () => {
            bitmap = []
            screenRam = []
            colorRam = []
            if (BitmapStore.isFCM()) {
                // In Full Color Mode we can have up to 1000 unique characters on the screen (H320)
                // so this means a lot of "bitmap" or better "charset" data. This is 1000 times 8x8 Bytes = 64000 Bytes
                for (let i = 0; i < 64000; i++) {
                    bitmap.push(0)
                }
            } else {
                for (let i = 0; i < 8000; i++) {
                    bitmap.push(0)
                }
            }
            if (BitmapStore.isFCM()) {
                for (let i = 0; i < 1000; i++) {
                    screenRam.push(i)
                    colorRam.push(0)
                }
            } else {
                for (let i = 0; i < 1000; i++) {
                    screenRam.push(0)
                    colorRam.push(0)
                }
                if (BitmapStore.isMCM()) {
                    BitmapStore.setBackgroundColorMCM(ColorPaletteStore.defaultColors()[0])
                }

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
        getBinaryLine: (idx : number) => {
            let s = "00000000"
            if (idx < 7999) {
                let value = bitmap[idx]
                s = value.toString(2);
                while (s.length < (8 || 2)) {
                    s = "0" + s
                }
            }
            return s;
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
            backgroundColorMCM = bgColor

        },
        setForegroundColorMCM: (memoryPosition : number, selColor : Color) => {
            console.log('setForegroundColorMCM ', selColor)
            let colorValue = BitmapStore.getColorFromScreenRam(memoryPosition)
            let colorValueHexComplete = colorValue.toString(16)
            if (colorValueHexComplete === "0") {
                colorValueHexComplete = "00"
            }
            let ColorValueVorne = selColor.colorIndex.toString(16)
            let ColorValueHinten = colorValueHexComplete.substr(1,1)
            let colorValueNeu = '0x'.concat(ColorValueVorne,ColorValueHinten)
            screenRam[memoryPosition/8] =  parseInt(colorValueNeu,16)
        },

        setForegroundColor2MCM: (memoryPosition : number, selColor : Color) => {
            let colorValue = BitmapStore.getColorFromScreenRam(memoryPosition)
            let colorValueHexComplete = colorValue.toString(16)
            if (colorValueHexComplete === "0") {
                colorValueHexComplete = "00"
            }
            let ColorValueVorne = colorValueHexComplete.substr(0,1)
            let ColorValueHinten = selColor.colorIndex.toString(16)
            let colorValueNeu = '0x'.concat(ColorValueVorne,ColorValueHinten)
            screenRam[memoryPosition/8] =  parseInt(colorValueNeu,16)
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
                defaultColors.forEach( color => {
                    let res = colorMega65(color)
                    bytes[idx] = res.r
                    idx++
                })
                defaultColors.forEach( color => {
                    let res = colorMega65(color)
                    bytes[idx] = res.g
                    idx++
                })
                defaultColors.forEach( color => {
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
        setForegroundColor0FCM: (color) => foregroundColor0FCM = color

    }
}

const BitmapStore = createBitmapStore()

export default BitmapStore
