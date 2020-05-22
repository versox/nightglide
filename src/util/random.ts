export function random(seed: number, min: number, max: number) {
    const nextSeed = (seed * 9301 + 49297) % 233280;
    return {
        nextSeed: nextSeed,
        random: min + (nextSeed / 233280) * (max - min)
    }
}