export function hasType(given, required): boolean {
    return (given & required) > 0;
}