/* eslint-env browser */
const supportsPRNG =
  typeof window.crypto !== "undefined" && typeof window.crypto.getRandomValues !== "undefined";

function devkitUUID() {
  // This isn't gonna be the best implementation ever, but it will do well

  // Designed according to
  // http://codingrepo.com/regular-expression/2015/11/23/javascript-generate-uuidguid-for-rfc-4122-version-4-compliant-with-regular-expression/

  // We need 31 random ints. Other are dashes and the magic 4
  const randomNumbers = new Array(31);

  // Populate the random numbers
  if (supportsPRNG) {
    const prngRandomBytes = new Uint8Array(randomNumbers.length);
    window.crypto.getRandomValues(prngRandomBytes);
    for (let i = 0; i < randomNumbers.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      randomNumbers[i] = prngRandomBytes[i] % 16 | 0;
    }
  } else {
    for (let i = 0; i < randomNumbers.length; i += 1) {
      // eslint-disable-next-line no-bitwise
      randomNumbers[i] = (Math.random() * 16) | 0;
    }
  }

  // The 16th number needs to be ‘8’, ‘9’, ‘A’, or ‘B’. We can bitmask that.
  // eslint-disable-next-line no-bitwise, no-mixed-operators
  randomNumbers[15] = (randomNumbers[15] & 0x3) | 0x8;

  let uuidString = "";
  // Generate the uuid string. Don't forget to add the - and 4 at the right positions
  for (let i = 0; i < randomNumbers.length; i += 1) {
    uuidString += randomNumbers[i].toString(16);

    if (i === 7 || i === 14 || i === 18) {
      uuidString += "-";
    } else if (i === 11) {
      uuidString += "-4";
    }
  }

  return uuidString;
}
