const CORRECTION_FACTOR = 100;

export const generateTimes = (totalDuration: number, delay: number) => {
  const times: number[] = [];
  const period = totalDuration / delay;
  for (let index = 0; index < period; index++) {
    const time =
      (index * CORRECTION_FACTOR * (delay * CORRECTION_FACTOR)) /
      (CORRECTION_FACTOR * CORRECTION_FACTOR);
    times.push(time);
  }
  return times;
};
