export function getHash(input: string) {
   var hash = 0,
      len = input.length;
   for (var i = 0; i < len; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0; // to 32bit integer
   }
   return hash;
}

export function getSeed(seed: string | number, digit = 1) {
   var x = Math.abs(
      Math.round(
         Math.sin(typeof seed === 'number' ? seed++ : getHash(seed) + 1) *
            10 *
            digit,
      ),
   );
   return x;
}
