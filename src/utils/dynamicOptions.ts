/**
 * Generates dynamic options based on the provided parameters.
 *
 * @param cups - Number of cups.
 * @param baseAmountPerCup - Base amount per cup.
 * @param stepSize - Increment/decrement step size.
 * @param numSteps - Number of steps to generate.
 * @returns An array of options.
 */
export function generateDynamicOptions(
  cups: number,
  baseAmountPerCup: number,
  stepSize: number,
  numSteps: number
): number[] {
  return Array.from({ length: numSteps }, (_, i) => 
    cups * baseAmountPerCup + (i - Math.floor(numSteps / 2)) * stepSize
  ).filter(option => option > 0);
}
