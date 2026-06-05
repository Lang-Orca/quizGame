interface MockAuth {
  currentUser: {uid: string} | null;
}

let uidCounter = 0;
const auth: MockAuth = {currentUser: null};

export function getAuth(): MockAuth {
  return auth;
}

export function signInAnonymously(
  authInstance: MockAuth,
): Promise<{user: {uid: string}}> {
  uidCounter += 1;
  const user = {uid: `mock-uid-${uidCounter}`};
  authInstance.currentUser = user;
  return Promise.resolve({user});
}

export default getAuth;
