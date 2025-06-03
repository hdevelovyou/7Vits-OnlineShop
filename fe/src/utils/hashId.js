import Hashids from 'hashids';

// IMPORTANT: In a real application, use an environment variable for the salt!
const SALT = 'your-secret-salt-here'; // Replace with a strong, unique salt
const MIN_LENGTH = 8; // Minimum length for hashed IDs

const hashids = new Hashids(SALT, MIN_LENGTH);

export const encodeId = (id) => {
  try {
    return hashids.encode(id);
  } catch (error) {
    console.error("Error encoding ID:", error);
    return null; // Or handle error as appropriate
  }
};

export const decodeId = (hashedId) => {
  try {
    const decodedArray = hashids.decode(hashedId);
    return decodedArray[0]; // decode returns an array, we need the first element
  } catch (error) {
    console.error("Error decoding ID:", error);
    return undefined; // Or handle error as appropriate
  }
}; 