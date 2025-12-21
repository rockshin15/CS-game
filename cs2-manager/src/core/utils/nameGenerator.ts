const samplePrefixes = ['Neo', 'Ghost', 'Flash', 'Ace', 'Bolt'];
export function generateName(): string {
  return `${samplePrefixes[Math.floor(Math.random() * samplePrefixes.length)]}${Math.floor(Math.random() * 10000)}`;
}
