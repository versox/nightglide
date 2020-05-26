export function random(seed: number) {
    const nextSeed = (seed * 9301 + 49297) % 233280;
    return {
        seed: seed,
        nextSeed: nextSeed,
        random: (min, max) => (min + (seed / 233280) * (max - min))
    }
}