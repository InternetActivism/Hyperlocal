// Get a random value between min and max. Used for randomized delays in the progress bar
const getRandomValue = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export default getRandomValue;
