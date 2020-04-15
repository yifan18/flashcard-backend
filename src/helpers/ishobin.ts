const bezier = require('./bezier-easing');
// const base = 10; // min

// const times = 15;
// Array.from({
//   length: times,
// }).reduce((b: number, c, i) => {
//   const increase = bezier(0.78, 0.18, 0.71, 0.32)((i + 1) / 5);
//   b = b * (1 + increase);
//   // console.log(`No.${i+1}`, dd(b), increase);
//   console.log(`No.${i}`, dd(b), increase);
//   return b;
// }, base);

// function dd(peroid: number) {
//   if (peroid < 60) return peroid + 'm';
//   if (peroid < 24 * 60) return peroid / 60 + 'h';
//   if (peroid < 30 * 24 * 60) return peroid / (24 * 60) + 'd';
//   if (peroid < 12 * 30 * 24 * 60) return peroid / (30 * 24 * 60) + 'M';
//   return peroid / (12 * 30 * 24 * 60) + 'Y';
// }

export function generateLevels(times: number) {
  //   const times = 15;
  let base = 10;
  return Array.from({
    length: times,
  }).map((r, i) => {
    const increase = bezier(0.78, 0.18, 0.71, 0.32)((i + 1) / 5);
    base = base * (1 + increase);
    return parseInt(base + '');
  });
}
