import {
  addChildAddedListener,
  addValueListener,
  makeRef,
  refGet,
  refPush,
  refRemove,
  refSet,
  refUpdate,
  runTransactionImpl,
  serverTimestampImpl,
} from './firebaseRtdbStore';
import type {MockReference, Snapshot} from './firebaseRtdbStore';

interface MockDatabase {
  __isMockDatabase: true;
}

const db: MockDatabase = {__isMockDatabase: true};

export function getDatabase(): MockDatabase {
  return db;
}

export function ref(_db: MockDatabase, path: string): MockReference {
  return makeRef(path);
}

export function child(parent: MockReference, path: string): MockReference {
  return makeRef(`${parent.path}/${path}`);
}

export function set(reference: MockReference, value: unknown): Promise<void> {
  return refSet(reference, value);
}

export function update(
  reference: MockReference,
  value: Record<string, unknown>,
): Promise<void> {
  return refUpdate(reference, value);
}

export function remove(reference: MockReference): Promise<void> {
  return refRemove(reference);
}

export function get(reference: MockReference): Promise<Snapshot> {
  return refGet(reference);
}

export function push(reference: MockReference, value?: unknown): MockReference {
  return refPush(reference, value);
}

export function onValue(
  reference: MockReference,
  cb: (snapshot: Snapshot) => void,
): () => void {
  return addValueListener(reference, cb);
}

export function onChildAdded(
  reference: MockReference,
  cb: (snapshot: Snapshot) => void,
): () => void {
  return addChildAddedListener(reference, cb);
}

export function runTransaction(
  reference: MockReference,
  fn: (current: unknown) => unknown,
): Promise<{committed: boolean; snapshot: Snapshot}> {
  return runTransactionImpl(reference, fn);
}

export function serverTimestamp(): number {
  return serverTimestampImpl();
}

export function onDisconnect(_reference: MockReference): {
  set: (value: unknown) => Promise<void>;
  remove: () => Promise<void>;
  cancel: () => Promise<void>;
} {
  return {
    set: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    cancel: () => Promise.resolve(),
  };
}

export default getDatabase;
