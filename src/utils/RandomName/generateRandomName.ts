import adjectives from './adjectives.json';
import animals from './animals.json';

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function aRandom(length: number): number {
  return Math.floor(Math.random() * length);
}

export function generateRandomName() {
  const animal = animals[aRandom(animals.length)];
  const adjective = adjectives[aRandom((adjectives as Array<string>).length)];
  return `${capitalizeFirstLetter(adjective)} ${capitalizeFirstLetter(animal)}`;
}
