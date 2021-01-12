import BitmapStore from './BitmapStore.js'

const createColorCollectionStore = () => {

    const collection = [
        { name: 'Set1', colors: [ ['black', 'dark grey'],
                                  ['dark grey', 'grey'],
                                  ['grey', 'light grey'],
                                  ['light grey', 'yellow'],
                                  ['yellow', 'white'],
                                  ['light grey', 'light green'],
                                  ['light green', 'white'],
                                  ['white', 'white'], ] },

        { name: 'Set2', colors: [ ['black', 'red'],
                ['red', 'light red'],
                ['light red', 'light grey'],
                ['light grey', 'yellow'],
                ['yellow', 'white'],
                ['light grey', 'light green'],
                ['light green', 'white'],
                ['white', 'white'] ] },

        { name: 'Set3', colors: [ ['black', 'dark grey'],
                ['dark grey', 'green'],
                ['green', 'light grey'],
                ['light grey', 'light green'],
                ['light green', 'white'],
                ['white', 'white'] ] },

    ]


    const setColors = (set, colorNameBg, colorNameFg) => {
        let colorBg = BitmapStore.getColorByName(colorNameBg)
        let colorFg = BitmapStore.getColorByName(colorNameFg)
        set.bg_r = colorBg.r
        set.bg_g = colorBg.g
        set.bg_b = colorBg.b
        set.paletteIndexBg = colorBg.colorIndex
        set.fg_r = colorFg.r
        set.fg_g = colorFg.g
        set.fg_b = colorFg.b
        set.paletteIndexFg = colorFg.colorIndex
        return set
    }

    return {
        setCollection: (sets, collectionIndex) => {
            let colors = collection[collectionIndex].colors
            colors.forEach( (color, index) => sets[index] = setColors(sets[index], color[0], color[1]))
            return sets
        }
    }

}

const ColorCollectionStore = createColorCollectionStore()

export default ColorCollectionStore