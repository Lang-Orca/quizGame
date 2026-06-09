/**
 * Implémentation en mémoire minimale de Firebase Realtime Database, partagée
 * par les mocks @react-native-firebase/database et /auth.
 *
 * Couvre uniquement les primitives utilisées par FirebaseSessionSync :
 * ref/set/update/get/remove/push/onValue/onChildAdded/runTransaction/
 * onDisconnect/serverTimestamp.
 */

type AnyValue = unknown;

interface ValueListener {
  type: 'value';
  path: string;
  cb: (snapshot: Snapshot) => void;
}

interface ChildAddedListener {
  type: 'child_added';
  path: string;
  cb: (snapshot: Snapshot) => void;
  seen: Set<string>;
}

type Listener = ValueListener | ChildAddedListener;

let store: Record<string, AnyValue> = {};
let listeners: Listener[] = [];
let pushCounter = 0;

export class Snapshot {
  constructor(public readonly key: string | null, private readonly value: AnyValue) {}

  val(): AnyValue {
    return this.value === undefined ? null : this.value;
  }

  exists(): boolean {
    return this.value !== undefined && this.value !== null;
  }

  forEach(fn: (child: Snapshot) => void): void {
    if (this.value && typeof this.value === 'object') {
      Object.entries(this.value as Record<string, AnyValue>).forEach(
        ([childKey, childVal]) => {
          fn(new Snapshot(childKey, childVal));
        },
      );
    }
  }
}

function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function readNode(path: string): AnyValue {
  let node: AnyValue = store;
  for (const seg of segments(path)) {
    if (node && typeof node === 'object' && seg in (node as object)) {
      node = (node as Record<string, AnyValue>)[seg];
    } else {
      return undefined;
    }
  }
  return node;
}

function writeNode(path: string, value: AnyValue): void {
  const segs = segments(path);
  if (segs.length === 0) {
    store = (value as Record<string, AnyValue>) ?? {};
    return;
  }
  let node = store as Record<string, AnyValue>;
  for (let i = 0; i < segs.length - 1; i += 1) {
    const seg = segs[i];
    if (!node[seg] || typeof node[seg] !== 'object') {
      node[seg] = {};
    }
    node = node[seg] as Record<string, AnyValue>;
  }
  const last = segs[segs.length - 1];
  if (value === undefined || value === null) {
    delete node[last];
  } else {
    node[last] = value;
  }
}

function lastKey(path: string): string | null {
  const segs = segments(path);
  return segs.length ? segs[segs.length - 1] : null;
}

function parentPath(path: string): string {
  const segs = segments(path);
  segs.pop();
  return segs.join('/');
}

function notify(changedPath: string): void {
  for (const listener of listeners) {
    if (listener.type === 'value') {
      const lp = listener.path;
      if (
        lp === changedPath ||
        changedPath.startsWith(`${lp}/`) ||
        lp.startsWith(`${changedPath}/`)
      ) {
        listener.cb(new Snapshot(lastKey(lp), readNode(lp)));
      }
    } else {
      // child_added : déclenché pour chaque nouvel enfant direct.
      if (parentPath(changedPath) === listener.path) {
        const key = lastKey(changedPath);
        if (key && !listener.seen.has(key)) {
          listener.seen.add(key);
          listener.cb(new Snapshot(key, readNode(changedPath)));
        }
      }
    }
  }
}

export interface MockReference {
  path: string;
  key: string | null;
}

export function makeRef(path: string): MockReference {
  return {path, key: lastKey(path)};
}

export function refSet(ref: MockReference, value: AnyValue): Promise<void> {
  writeNode(ref.path, value);
  notify(ref.path);
  return Promise.resolve();
}

export function refUpdate(
  ref: MockReference,
  value: Record<string, AnyValue>,
): Promise<void> {
  Object.entries(value).forEach(([childPath, childVal]) => {
    writeNode(`${ref.path}/${childPath}`, childVal);
    notify(`${ref.path}/${childPath}`);
  });
  notify(ref.path);
  return Promise.resolve();
}

export function refRemove(ref: MockReference): Promise<void> {
  writeNode(ref.path, undefined);
  notify(ref.path);
  return Promise.resolve();
}

export function refGet(ref: MockReference): Promise<Snapshot> {
  return Promise.resolve(new Snapshot(ref.key, readNode(ref.path)));
}

export function refPush(ref: MockReference, value: AnyValue): MockReference {
  pushCounter += 1;
  const key = `mock-${pushCounter}`;
  const childRef = makeRef(`${ref.path}/${key}`);
  if (value !== undefined) {
    refSet(childRef, value);
  }
  return childRef;
}

export function addValueListener(
  ref: MockReference,
  cb: (snapshot: Snapshot) => void,
): () => void {
  const listener: ValueListener = {type: 'value', path: ref.path, cb};
  listeners.push(listener);
  cb(new Snapshot(ref.key, readNode(ref.path)));
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function addChildAddedListener(
  ref: MockReference,
  cb: (snapshot: Snapshot) => void,
): () => void {
  const listener: ChildAddedListener = {
    type: 'child_added',
    path: ref.path,
    cb,
    seen: new Set(),
  };
  listeners.push(listener);
  const existing = readNode(ref.path);
  if (existing && typeof existing === 'object') {
    Object.entries(existing as Record<string, AnyValue>).forEach(
      ([childKey, childVal]) => {
        listener.seen.add(childKey);
        cb(new Snapshot(childKey, childVal));
      },
    );
  }
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function runTransactionImpl(
  ref: MockReference,
  fn: (current: AnyValue) => AnyValue,
): Promise<{committed: boolean; snapshot: Snapshot}> {
  const current = readNode(ref.path);
  const result = fn(current === undefined ? null : current);
  if (result === undefined) {
    return Promise.resolve({
      committed: false,
      snapshot: new Snapshot(ref.key, current),
    });
  }
  writeNode(ref.path, result);
  notify(ref.path);
  return Promise.resolve({
    committed: true,
    snapshot: new Snapshot(ref.key, result),
  });
}

export function serverTimestampImpl(): number {
  return Date.now();
}

export function __resetFirebaseStore(): void {
  store = {};
  listeners = [];
  pushCounter = 0;
}

export function __dumpFirebaseStore(): Record<string, AnyValue> {
  return store;
}
