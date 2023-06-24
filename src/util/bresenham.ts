import BitmapStore from "../stores/BitmapStore";
import {cloneDeep} from "lodash-es";

function bresenhamLine (x0 : number, y0 : number,
                        x1 : number, y1 : number) {

    let x,y
    let dx = x1 - x0
    let dy = y1 - y0
    let incX = Math.sign(dx)
    let incY = Math.sign(dy)
    dx = Math.abs(dx)
    dy = Math.abs(dy)

    if (dy == 0) {
        for ( x = x0; x != x1 + incX; x += incX) {
            BitmapStore.setPixel(x,y0, 'f')
        }
    } else if ( dx==0) {
        for (y = y0; y != y1 + incY; y += incY) {
            BitmapStore.setPixel(x0,y, 'f')
        }
    } else if ( dx >= dy ) {
        let slope = 2 * dy
        let error = -dx
        let errorInc = -2 * dx
        let y = y0

        for (x = x0; x != x1 + incX; x += incX) {
            BitmapStore.setPixel(x,y, 'f')
            error += slope
            if (error >= 0) {
                y += incY
                error += errorInc
            }
        }
    } else {
        let slope = 2 * dx
        let error = -dy
        let errorInc = -2 * dy
        let x = x0

        for (y = y0; y != y1 + incY; y += incY) {
            BitmapStore.setPixel(x,y, 'f')
            error += slope
            if (error >= 0) {
                x += incX
                error += errorInc
            }
        }

    }

}


function bresenhamCircle(x0 : number, y0 : number, radius : number) {

    let x_start = x0
    let y_start = y0
    let error = 1 - radius

    let ddF_x = 0;
    let ddF_y = -2 * radius
    let x = 0
    let y = radius

    BitmapStore.setPixel(x_start,y_start + radius, 'f')
    BitmapStore.setPixel(x_start,y_start - radius, 'f')
    BitmapStore.setPixel(x_start + radius, y_start, 'f')
    BitmapStore.setPixel(x_start - radius, y_start, 'f')

    while (x < y) {
        if (error >= 0) {
            y--
            ddF_y += 2
            error += ddF_y
        }
        x += 1
        ddF_x += 2
        error += ddF_x + 1

        BitmapStore.setPixel(x_start + x, y_start + y, 'f')
        BitmapStore.setPixel(x_start - x, y_start + y, 'f')
        BitmapStore.setPixel(x_start + x, y_start - y, 'f')
        BitmapStore.setPixel(x_start - x, y_start - y, 'f')

        BitmapStore.setPixel(x_start + y, y_start + x, 'f')
        BitmapStore.setPixel(x_start - y, y_start + x, 'f')
        BitmapStore.setPixel(x_start + y, y_start - x, 'f')
        BitmapStore.setPixel(x_start - y, y_start - x, 'f')

    }


}

function bresenhamEllipse(x0 : number, y0 : number,
                          radius_x : number, radius_y : number)  {
    let a = radius_x
    let b = radius_y

    let dx = 0
    let dy = b
    let a2 = a*a
    let b2 = b*b
    let err = b2-(2*b-1)*a2
    let e2

    do
    {
        BitmapStore.setPixel(x0 + dx, y0 + dy, 'f')
        BitmapStore.setPixel(x0 - dx, y0 + dy, 'f')
        BitmapStore.setPixel(x0 - dx, y0 - dy, 'f')
        BitmapStore.setPixel(x0 + dx, y0 - dy, 'f')
        e2 = 2*err
        if (e2 <  (2 * dx + 1) * b2) { ++dx; err += (2 * dx + 1) * b2 }
        if (e2 > -(2 * dy - 1) * a2) { --dy; err -= (2 * dy - 1) * a2 }
    }
    while (dy >= 0)

    while (dx++ < a)
    {
        BitmapStore.setPixel(x0+dx, y0, 'f')
        BitmapStore.setPixel(x0-dx, y0, 'f')
    }

}


export { bresenhamLine, bresenhamCircle, bresenhamEllipse }