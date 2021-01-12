import {defaultColors} from '../components/palette/ColorPalette'
import {colorMega65} from '../utils'

const createBitmapStore = () => {

    let bitmap = []          // Hires: 8 x 8 bits per char (8 Bytes), 40 chars per line (320 Bytes), 25 lines (8000 Bytes)

    let screenRam = []       // Hires:
                             // 1 Byte per char, 40 chars per line, 25 line   = 1000 Bytes
                             // Color for one char e.g. 176
                             //     => $b0 => Highbyte : grey ($b)
                             //               LowByte  : black ($0)


    let colorRam = []

    let backgroundColorMCM = null

    let mode = 0             // 0 = Classic Hires Bitmaps C64
                             // 1 = Multicolor Bitmap


    let subscribers = []

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
        getNibble: (number, nth) =>  (number >> 4*nth) & 0xF,
        clearBitmap: () => {
            bitmap = []
            screenRam = []
            colorRam = []
            for (let i = 0; i < 8000; i++) {
                bitmap.push(0)
            }
            for (let i = 0; i < 1000; i++) {
                screenRam.push(0)
                colorRam.push(0)
            }
            if (BitmapStore.isMCM()) {
                BitmapStore.setBackgroundColorMCM(0)
            }

        },
        setBitmap: (data) => bitmap = data,
        setScreenRam: (data) => screenRam = data,
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
        getBinaryLine: (idx) => {
            let value = bitmap[idx]
            let s = value.toString(2);
            while (s.length < (8 || 2)) {
                  s = "0" + s
            }
            return s;
        },
        flipBackground: (index, pos) => {
            bitmap[index] = bitmap[index] & ~(1<<pos)  //  CLEAR BIT
            callSubscribers()
        },
        flipForeground: (index, pos) => {
            //bitmap[index] = bitmap[index]^(1<<pos)  // XOR
            bitmap[index] = bitmap[index] | (1<<pos)  //  OR / SET BIT
            callSubscribers()
        },
        flipBit: (index,pos) => {
            //bitmap[index] = bitmap[index]^(1<<pos)  // XOR
            bitmap[index] = bitmap[index]|(1<<pos)  //  OR
            callSubscribers()
        },
        setBinaryLine: (index, binaryLine) => bitmap[index] = parseInt(binaryLine,2),
        callSubscribers: () => {
            callSubscribers()
        },
        getColorByIndex: (idx) => defaultColors.find( color => color.colorIndex===idx),
        getColorByHexNumber: (hex) => defaultColors.find( color => color.colorIndexHex===hex),
        getColorByName: (name) => defaultColors.find( color => color.color===name),


        getColorFromScreenRam: (memoryPosition) => screenRam[memoryPosition/8],

        // ------------------------------------------------------------
        //   Color Getters and Setter for HIRES Mode
        // ------------------------------------------------------------
        getBackgroundColorHires: (memoryPosition) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            // returns the LowByte == Background
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 0))
        },
        getForegroundColorHires: (memoryPosition) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            // returns the HighByte == Foreground
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 1))
        },
        setBackgroundColorHires: (memoryPosition, bg) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)  // hi und low byte
            let fg = BitmapStore.getNibble(color, 1)
            screenRam[memoryPosition/8] =  (fg << 4) | bg
        },
        setForegroundColorHires: (memoryPosition, fg) => {
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
        getForegroundColorMCM: (memoryPosition) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)
            // returns the HighByte == Foreground
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 1))
        },
        getForegroundColor2MCM: (memoryPosition) => {
            let color = BitmapStore.getColorFromScreenRam(memoryPosition)
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 0))
        },
        getForegroundColor3MCM: (memoryPosition) => {
            let color = colorRam[memoryPosition/8]
            return BitmapStore.getColorByHexNumber(color)
        },

        setBackgroundColorMCM: (bg) => {
            backgroundColorMCM = BitmapStore.getColorByIndex(bg)

        },
        setForegroundColorMCM: (memoryPosition, fg) => {
            let selColor = BitmapStore.getColorByIndex(fg)
            console.log('setForegroundColorMCM selColor ', { selColor } )
            let colorValue = BitmapStore.getColorFromScreenRam(memoryPosition)
            console.log('setForegroundColorMCM colorValue ', { colorValue } )
            let colorValueHexComplete = colorValue.toString(16)
            //let ColorValueVorne = colorValueHexComplete.substr(0,1)
            let ColorValueVorne = selColor.colorIndexHex.toString(16)
            let ColorValueHinten = colorValueHexComplete.substr(1,1)
            let colorValueNeu = '0x'.concat(ColorValueVorne,ColorValueHinten)
            console.log('setForegroundColorMCM alt/neu ', { colorValueHexComplete, colorValueNeu })
            screenRam[memoryPosition/8] =  parseInt(colorValueNeu,16)
        },

        setForegroundColor2MCM: (memoryPosition, fg) => {
            let selColor = BitmapStore.getColorByIndex(fg)
            console.log('setForegroundColor2MCM selColor ', { selColor } )
            let colorValue = BitmapStore.getColorFromScreenRam(memoryPosition)
            console.log('setForegroundColor2MCM colorValue ', { colorValue } )
            let colorValueHexComplete = colorValue.toString(16)
            let ColorValueVorne = colorValueHexComplete.substr(0,1)
            //let ColorValueHinten = colorValueHexComplete.substr(1,1)
            let ColorValueHinten = selColor.colorIndexHex.toString(16)
            let colorValueNeu = '0x'.concat(ColorValueVorne,ColorValueHinten)
            console.log('setForegroundColor2MCM alt/neu ', { colorValueHexComplete, colorValueNeu })
            screenRam[memoryPosition/8] =  parseInt(colorValueNeu,16)
        },

        setForegroundColor3MCM: (memoryPosition, fg) => {
            // MCM Foreground color to be stored into Color RAM
            colorRam[memoryPosition/8] = fg
        },



        download: (fileName) => {
            console.log('download ', fileName)
            let fileCreated = false

            if (BitmapStore.isMCM()) {

                // ======================================
                //  Prepare Multicolor (MCM) File
                // ======================================

                // 0000-1f3f Bitmap data (8000 bytes)
                // 1f40-2327 Screen RAM colors (1000 bytes)
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
        subscribe: (fn) => {
            subscribers.push(fn)
        },
        activateHiresBitmaps: () => mode = 0,
        activateMulticolorBitmaps: () => mode = 1,
        isMCM: () => mode == 1,
        getMode: () => mode,
        getModeAsText: () => {
            switch (mode) {
                case 0:
                    return 'hires'
                    break
                case 1:
                    return 'mcm'
                    break
            }
            return '???'

        },
        setColorRam: (colRam) => colorRam = colRam

    }
}

const BitmapStore = createBitmapStore()

export default BitmapStore
