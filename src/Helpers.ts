// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Array helpers
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// compare_fn is a function that compares two elements and returns a number
// -1 if a < b
// 0 if a == b
// 1 if a > b
function binarySearch<T>(array: Array<T>, element: T, compare_fn: (a: T, b: T) => number): number {

    if (array.length === 0) {
        return 0;
    }

    // Check first element
    const firstElement = array[0];
    if (compare_fn(element, array[0]) <= 0) // element is less than first element
        return 0;

    // Check last element
    const lastElement = array[array.length - 1];
    if (compare_fn(element, lastElement) > 0) // element is greater than last element
        return array.length;

    let lowerBound = 1; // start at index 1 to avoid checking the first element again
    let upperBound = array.length - 1;

    let midpoint: number = (upperBound + lowerBound) >> 1
    while (lowerBound <= upperBound) {
        midpoint = (upperBound + lowerBound) >> 1; // divide by 2 and round down

        let comparison = compare_fn(element, array[midpoint]); // compare the element with the element at the middle index

        if (comparison > 0) { // element is greater than the element at the middle index
            lowerBound = midpoint + 1;
        } else if (comparison < 0) { // element is less than the element at the middle index
            upperBound = midpoint - 1;
        } else { // element is equal to the element at the middle index
            return midpoint;
        }
    }
    // console.log('🔍🔍🔍 binarySearch', array, element, 'not found', 'lowerBound:', lowerBound, 'midpoint:', midpoint, 'upperBound:', upperBound);
    // if we get here, the element is not in the array so we return the index where it should be inserted
    return lowerBound;
}

export function pushSorted<T>(array: Array<T>, element: T, compare_fn: (a: T, b: T) => number): number {

    // find the index where the element should be inserted
    const indexToInsert = binarySearch(array, element, compare_fn);
    // console.log('🔍🔍 pushSorted', array, element, indexToInsert);

    array.splice(indexToInsert, 0, element);

    // console.log('🔍🔍 pushSorted result:', array, element, 'inserted at index', indexToInsert);
    return indexToInsert;
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Numerical helpers
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export function varyNumberByPercentage(originalNumber: number, maxPercentageVariance: number): number {
    // e.g: given then originalNumber 10 and a max percentage variance of 0.2 -> retur random number between 8 and 12

    const randomVariance = (Math.random() - 1) * 2 // this will be between -1 and 1

    const randomPercentageVariance = maxPercentageVariance * randomVariance;
    // e.g for maxPercentageVariance of 0.2 this will be between -0.2 and 0.2


    // return the original number plus the random percentage variance
    return originalNumber * (1 + randomPercentageVariance); // e.g 10 * (1 - 0.12) = 10 * 0.88 = 8.8
}

export function degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Color helpers
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
export function randomShadeOfBlue(): string {

    const red = varyNumberByPercentage(35, 0.5);
    const green = varyNumberByPercentage(35, 0.5);
    const blue = varyNumberByPercentage(155, 0.15);

    const color = `rgb(${red}, ${green}, ${blue})`;

    return color;
}

function parseRgbColor(color: string): { r: number, g: number, b: number } {
    // color e.g: 'rgb(12.11, 12.11, 200.111)' -> { r: 12.11, g: 12.11, b: 200.111 }
    // convert the color string to an object with r, g, b values


    if (!color.startsWith('rgb(')) {
        throw new Error('Invalid color string: ' + color);
    }

    const threeColors = color.slice(4, -1).split(',');

    const r = parseFloat(threeColors[0]);
    const g = parseFloat(threeColors[1]);
    const b = parseFloat(threeColors[2]);

    return { r, g, b };
}


export function lightenColor(color: string): string {
    // given a color string, return a lighter version of the color
    // e.g. #000000 -> #111111
    // e.g. #ffffff -> #eeeeee
    // e.g. #000000 -> #111111 

    // convert the color string to an object with r, g, b values
    let colorObject = { r: 0, g: 0, b: 0 };
    try {
        colorObject = parseRgbColor(color);
    } catch (error) {
        console.error('🎨🎨 lightenColor', color, '->', error);
        return color;
    }

    // lighten the color by 20%
    colorObject.r = colorObject.r * 1.4;
    colorObject.g = colorObject.g * 1.4;
    colorObject.b = colorObject.b * 1.4;


    const lightenedColor = `rgb(${colorObject.r}, ${colorObject.g}, ${colorObject.b})`;
    // console.log('🎨🎨 lightenColor', color, '->', lightenedColor);
    return lightenedColor;
}
