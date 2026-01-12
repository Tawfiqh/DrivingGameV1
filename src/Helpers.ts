export function varyNumberByPercentage(originalNumber: number, maxPercentageVariance: number): number {
    // e.g: given then originalNumber 10 and a max percentage variance of 0.2 -> retur random number between 8 and 12

    const randomVariance = (Math.random() - 1) * 2 // this will be between -1 and 1

    const randomPercentageVariance = maxPercentageVariance * randomVariance;
    // e.g for maxPercentageVariance of 0.2 this will be between -0.2 and 0.2


    // return the original number plus the random percentage variance
    return originalNumber * (1 + randomPercentageVariance); // e.g 10 * (1 - 0.12) = 10 * 0.88 = 8.8
}

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
