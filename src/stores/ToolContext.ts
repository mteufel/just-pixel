import BitmapStore from "./BitmapStore";
import ScreenStore from "./ScreenStore";
import {deepCopy, refreshComplete} from "../util/utils";
import {bresenhamLine, bresenhamEllipse, bresenhamCircle} from "../helpers/bresenham";

enum ToolMode {
    OFF = "OFF",
    LINE = "LINE",
    CIRCLE = "CIRCLE",
}

type ToolContext = {
    getMode: () => ToolMode,
    setMode: (mode : ToolMode) => void,
    isActive: () => boolean,
    doPreview: () => void
    finish: () => void
}

const createToolContext = () : ToolContext => {

    console.log('Creating a new ToolContext')
    let mode = ToolMode.OFF
    let bitmap : number[] = []
    let screenRam : number[] = []
    let colorRam : number[] = []

    let bitmap_original : number[] = []
    let screenRam_original : number[] = []
    let colorRam_original : number[] = []


    let visited : number [] = []
    let x_start : number
    let y_start : number

    const doSetMode = (m: ToolMode) => {
        let coords = ScreenStore.getCoordinates()
        x_start = coords.coordX
        y_start = coords.coordY
        if (m != ToolMode.OFF) {
            bitmap = deepCopy(BitmapStore.getBitmap())
            screenRam = deepCopy(BitmapStore.getScreenRam())
            colorRam = deepCopy(BitmapStore.getColorRam())
            bitmap_original = deepCopy(BitmapStore.getBitmap())
            screenRam_original = deepCopy(BitmapStore.getScreenRam())
            colorRam_original = deepCopy(BitmapStore.getColorRam())
        }
        mode = m
        visited = []
        visited.push(coords.memPos)
        console.log('setMode - ToolContext set to start coords= ', { x: x_start, y: y_start })
        console.log('setMode - ToolContext set to mode=', m)
    }

    const clearAreaCircle = (x0: number, y0: number, radius_x: number, radius_y: number) => {

        if (radius_y == 0) {
            radius_y = radius_x
        }
        let a_x = x0 - radius_x
        let a_y = y0 - radius_y
        let a = ScreenStore.calculateCoordinates(a_x, a_y)

        let b_x = x0 + radius_x
        let b_y = y0 - radius_y
        let b = ScreenStore.calculateCoordinates(b_x, b_y)

        let c_x = x0 - radius_x
        let c_y = y0 + radius_y
        let c = ScreenStore.calculateCoordinates(c_x, c_y)

        let steps_x = (b.charX - a.charX) + 1
        let steps_y = (c.charY - a.charY) + 1

        let v = a.memPos
        for (let y = 0; y <= steps_y; y++) {
            for (let x = 0; x < steps_x; x++) {
                if (visited.indexOf(v) === -1) visited.push(v)
                v = v + 8
            }
            v = a.memPos + ( y * 320)
        }

        visited.forEach( v => {
            ScreenStore.setLastAction('tools-use-move')
            ScreenStore.refreshChar(v)
        })

    }


    const clearAreaLine = (x0: number, y0: number, x1: number, y1: number) => {
        if (x1 < x0) {
            let temp = x0
            x0 = x1
            x1 = temp
        }
        if (y1 < y0) {
            let temp = y0
            y0 = y1
            y1 = temp
        }
        let x = x0
        let y = y0


        while ( x != x1+16 && y != y1+16)  {
            let mp = ScreenStore.calculateCoordinates(x,y).memPos
            if (visited.indexOf(mp) === -1) visited.push(mp);
            x++
            if (x > x1) {
                y++
                x = x0
            }
        }

        visited.forEach( mp => {
            ScreenStore.setLastAction('tools-use-move')
            ScreenStore.refreshChar(mp)
        })
    }

    const calculateRadius = (x0: number, y0: number, x1: number, y1: number) => {
        let radius_x = Math.abs(x1-x0)
        let radius_y = Math.abs(y1-y0)
        return { x0, y0, x1, y1, radius_x, radius_y }
    }

    return {
        getMode: () => mode,
        setMode: (m) => {
            doSetMode(m)
        },
        isActive: () => {
          if (mode === ToolMode.OFF) {
            return false
          }
          return true
        },
        doPreview: () => {

            BitmapStore.setBitmap(deepCopy(bitmap))
            BitmapStore.setColorRam(deepCopy(colorRam))
            BitmapStore.setScreenRam(deepCopy(screenRam))

            let coords = ScreenStore.getCoordinates()
            let x0 = x_start
            let y0 = y_start
            let x1 = coords.coordX
            let y1 = coords.coordY
            ScreenStore.setLastAction('tools-use-move')

            switch (mode) {
                case ToolMode.LINE:
                    bresenhamLine(x0,y0,x1,y1)
                    clearAreaLine(x0,y0,x1,y1)
                    break
                case ToolMode.CIRCLE:
                    let r = calculateRadius(x0,y0,x1,y1)
                    if (r.radius_y != 0) {
                        bresenhamEllipse(x0,y0, r.radius_x, r.radius_y)
                    } else {
                        bresenhamCircle(x0,y0, r.radius_x)
                    }
                    clearAreaCircle(x0,y0, r.radius_x, r.radius_y)  // muss nochmal fuer kreis ueberarbeitet werden
                    break
            }




        },
        finish: () => {
            if (mode == ToolMode.OFF) {
                console.log('1')
                BitmapStore.setBitmap(deepCopy(bitmap_original))
                BitmapStore.setColorRam(deepCopy(colorRam_original))
                BitmapStore.setScreenRam(deepCopy(screenRam_original))
                refreshComplete()
            } else {
                console.log('2')
                doSetMode(ToolMode.OFF)
                refreshComplete()
            }
        }
  }
}

const ToolContext = createToolContext()

export { ToolContext, ToolMode }