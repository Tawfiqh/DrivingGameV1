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
