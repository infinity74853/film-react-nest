import * as crypto from 'crypto';

// Полифилл для crypto.randomUUID в Node.js 18
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: () => crypto.randomUUID(),
  } as any;
}
