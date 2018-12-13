import { IDisposable, IIndexable } from '@aurelia/kernel';
import { ILifecycle } from './lifecycle';

export enum LifecycleFlags {
  none                      = 0b0_0000_00000000000000_000_00,
  mustEvaluate              = 0b0_0001_00000000000000_000_00,
  mutation                  = 0b0_0000_00000000000000_000_11,
  isCollectionMutation      = 0b0_0000_00000000000000_000_01,
  isInstanceMutation        = 0b0_0000_00000000000000_000_10,
  update                    = 0b0_0000_00000000000000_111_00,
  updateTargetObserver      = 0b0_0000_00000000000000_001_00,
  updateTargetInstance      = 0b0_0000_00000000000000_010_00,
  updateSourceExpression    = 0b0_0000_00000000000000_100_00,
  from                      = 0b0_0000_11111111111111_000_00,
  fromFlush                 = 0b0_0000_00000000000011_000_00,
  fromAsyncFlush            = 0b0_0000_00000000000001_000_00,
  fromSyncFlush             = 0b0_0000_00000000000010_000_00,
  fromStartTask             = 0b0_0000_00000000000100_000_00,
  fromStopTask              = 0b0_0000_00000000001000_000_00,
  fromBind                  = 0b0_0000_00000000010000_000_00,
  fromUnbind                = 0b0_0000_00000000100000_000_00,
  fromAttach                = 0b0_0000_00000001000000_000_00,
  fromDetach                = 0b0_0000_00000010000000_000_00,
  fromCache                 = 0b0_0000_00000100000000_000_00,
  fromCreate                = 0b0_0000_00001000000000_000_00,
  fromDOMEvent              = 0b0_0000_00010000000000_000_00,
  fromObserverSetter        = 0b0_0000_00100000000000_000_00,
  fromBindableHandler       = 0b0_0000_01000000000000_000_00,
  fromLifecycleTask         = 0b0_0000_10000000000000_000_00,
  parentUnmountQueued       = 0b0_0010_00000000000000_000_00,
  // this flag is for the synchronous flush before detach (no point in updating the
  // DOM if it's about to be detached)
  doNotUpdateDOM            = 0b0_0100_00000000000000_000_00,
  isTraversingParentScope   = 0b0_1000_00000000000000_000_00,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags    = 0b1_0000_00000000000000_000_00,
  allowParentScopeTraversal = 0b1_0000_00000000000000_000_00,
}

export function stringifyLifecycleFlags(flags: LifecycleFlags): string {
  const flagNames: string[] = [];

  if (flags & LifecycleFlags.mustEvaluate) { flagNames.push('mustEvaluate'); }
  if (flags & LifecycleFlags.isCollectionMutation) { flagNames.push('isCollectionMutation'); }
  if (flags & LifecycleFlags.isInstanceMutation) { flagNames.push('isInstanceMutation'); }
  if (flags & LifecycleFlags.updateTargetObserver) { flagNames.push('updateTargetObserver'); }
  if (flags & LifecycleFlags.updateTargetInstance) { flagNames.push('updateTargetInstance'); }
  if (flags & LifecycleFlags.updateSourceExpression) { flagNames.push('updateSourceExpression'); }
  if (flags & LifecycleFlags.fromAsyncFlush) { flagNames.push('fromAsyncFlush'); }
  if (flags & LifecycleFlags.fromSyncFlush) { flagNames.push('fromSyncFlush'); }
  if (flags & LifecycleFlags.fromStartTask) { flagNames.push('fromStartTask'); }
  if (flags & LifecycleFlags.fromStopTask) { flagNames.push('fromStopTask'); }
  if (flags & LifecycleFlags.fromBind) { flagNames.push('fromBind'); }
  if (flags & LifecycleFlags.fromUnbind) { flagNames.push('fromUnbind'); }
  if (flags & LifecycleFlags.fromAttach) { flagNames.push('fromAttach'); }
  if (flags & LifecycleFlags.fromDetach) { flagNames.push('fromDetach'); }
  if (flags & LifecycleFlags.fromCache) { flagNames.push('fromCache'); }
  if (flags & LifecycleFlags.fromCreate) { flagNames.push('fromCreate'); }
  if (flags & LifecycleFlags.fromDOMEvent) { flagNames.push('fromDOMEvent'); }
  if (flags & LifecycleFlags.fromObserverSetter) { flagNames.push('fromObserverSetter'); }
  if (flags & LifecycleFlags.fromBindableHandler) { flagNames.push('fromBindableHandler'); }
  if (flags & LifecycleFlags.fromLifecycleTask) { flagNames.push('fromLifecycleTask'); }
  if (flags & LifecycleFlags.parentUnmountQueued) { flagNames.push('parentUnmountQueued'); }
  if (flags & LifecycleFlags.doNotUpdateDOM) { flagNames.push('doNotUpdateDOM'); }
  if (flags & LifecycleFlags.isTraversingParentScope) { flagNames.push('isTraversingParentScope'); }
  if (flags & LifecycleFlags.allowParentScopeTraversal) { flagNames.push('allowParentScopeTraversal'); }

  return flagNames.join('|');
}

/** @internal */
export const enum SubscriberFlags {
  None            = 0,
  Subscriber0     = 0b0001,
  Subscriber1     = 0b0010,
  Subscriber2     = 0b0100,
  SubscribersRest = 0b1000,
  Any             = 0b1111,
}

/**
 * Describes a type that tracks changes and can flush those changes in some way
 */
export interface IChangeTracker {
  $nextFlush?: IChangeTracker;
  hasChanges?: boolean;
  flush(flags: LifecycleFlags): void;
}

/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = unknown> {
  getValue(): TValue;
  setValue(newValue: TValue, flags: LifecycleFlags): void;
}

/**
 * Describes a target observer for to-view bindings (in other words, an observer without the observation).
 */
export interface IBindingTargetAccessor<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IDisposable,
          IAccessor<TValue>,
          IPropertyChangeTracker<TObj, TProp> { }

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
          ISubscribable<MutationKind.instance>,
          ISubscriberCollection<MutationKind.instance> {

  bind?(flags: LifecycleFlags): void;
  unbind?(flags: LifecycleFlags): void;
}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;

/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = number[] & {
  deletedItems?: unknown[];
};

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export enum MutationKind {
  instance   = 0b01,
  collection = 0b10
}

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Object, TProp = keyof TObj, TValue = unknown> {
  obj: TObj;
  propertyKey?: TProp;
  currentValue?: TValue;
}

/**
 * Describes a type that specifically tracks changes in a collection (map, set or array)
 */
export interface ICollectionChangeTracker<T extends Collection> extends IChangeTracker {
  collection: T;
  indexMap: IndexMap;
  resetIndexMap(): void;
}

/**
 * Represents a (subscriber) function that can be called by a PropertyChangeNotifier
 */
export type IPropertyChangeHandler<TValue = unknown> = (newValue: TValue, previousValue: TValue, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber<TValue = unknown> { handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void; }

/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export type ICollectionChangeHandler = (origin: string, args: IArguments | null, flags?: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export type IBatchedCollectionChangeHandler = (indexMap: number[]) => void;
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args: IArguments | null, flags: LifecycleFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: number[]): void; }

/**
 * Either a property or collection subscriber
 */
export type Subscriber = ICollectionSubscriber | IPropertySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export type BatchedSubscriber = IBatchedCollectionSubscriber;

/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.collection ? IBatchedCollectionChangeNotifier :
  never;

export interface ISubscribable<T extends MutationKind> {
  subscribe(subscriber: MutationKindToSubscriber<T>): void;
  unsubscribe(subscriber: MutationKindToSubscriber<T>): void;
}

/**
 * A collection of property or collection subscribers
 */
export interface ISubscriberCollection<T extends MutationKind> extends ISubscribable<T> {
  /** @internal */_subscriberFlags?: SubscriberFlags;
  /** @internal */_subscriber0?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber1?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber2?: MutationKindToSubscriber<T>;
  /** @internal */_subscribersRest?: MutationKindToSubscriber<T>[];

  callSubscribers: MutationKindToNotifier<T>;
  hasSubscribers(): boolean;
  hasSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  removeSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  addSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
}

/**
 * A collection of batched property or collection subscribers
 */
export interface IBatchedSubscriberCollection<T extends MutationKind> extends IBatchedSubscribable<T> {
  /** @internal */_batchedSubscriberFlags?: SubscriberFlags;
  /** @internal */_batchedSubscriber0?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber1?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber2?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscribersRest?: MutationKindToBatchedSubscriber<T>[];

  /** @internal */lifecycle?: ILifecycle;
  callBatchedSubscribers: MutationKindToBatchedNotifier<T>;

  /** @internal */flush(flags: LifecycleFlags): void;
  hasBatchedSubscribers(): boolean;
  hasBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  removeBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  addBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
}

export interface IBatchedSubscribable<T extends MutationKind> {
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<TObj[TProp]>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance> {
  /** @internal */observing: boolean;
}

/**
 * An any-typed property observer
 */
export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

/**
 * A collection (array, set or map)
 */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
interface IObservedCollection {
  $observer?: CollectionObserver;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection, Array<T> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection, Set<T> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection, Map<K, V> { }
/**
 * A collection that is being observed for mutations
 */
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export type LengthPropertyName<T> =
  T extends unknown[] ? 'length' :
  T extends Set<unknown> ? 'size' :
  T extends Map<unknown, unknown> ? 'size' :
  never;

export type CollectionTypeToKind<T> =
  T extends unknown[] ? CollectionKind.array | CollectionKind.indexed :
  T extends Set<unknown> ? CollectionKind.set | CollectionKind.keyed :
  T extends Map<unknown, unknown> ? CollectionKind.map | CollectionKind.keyed :
  never;

export type CollectionKindToType<T> =
  T extends CollectionKind.array ? unknown[] :
  T extends CollectionKind.indexed ? unknown[] :
  T extends CollectionKind.map ? Map<unknown, unknown> :
  T extends CollectionKind.set ? Set<unknown> :
  T extends CollectionKind.keyed ? Set<unknown> | Map<unknown, unknown> :
  never;

export type ObservedCollectionKindToType<T> =
  T extends CollectionKind.array ? IObservedArray :
  T extends CollectionKind.indexed ? IObservedArray :
  T extends CollectionKind.map ? IObservedMap :
  T extends CollectionKind.set ? IObservedSet :
  T extends CollectionKind.keyed ? IObservedSet | IObservedMap :
  never;

// TODO: organize this (for now it's a quick fix for length observer, but we may actually want this
// in every observer for alternative change tracking mechanisms)
export interface IPatch {
  patch(flags: LifecycleFlags): void;
}

/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends
  IDisposable,
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ISubscriberCollection<MutationKind.collection>,
  IBatchedSubscriberCollection<MutationKind.collection> {
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
    lengthObserver: IBindingTargetObserver & IPatch;
    getLengthObserver(): IBindingTargetObserver;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

export interface IBindingContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  getObservers?(): ObserversLookup<IOverrideContext>;
}

export interface IOverrideContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  readonly bindingContext: IBindingContext;
  readonly parentOverrideContext: IOverrideContext | null;
  getObservers(): ObserversLookup<IOverrideContext>;
}

export interface IScope {
  readonly bindingContext: IBindingContext;
  readonly overrideContext: IOverrideContext;
  // parentScope is strictly internal API and mainly for replaceable template controller.
  // NOT intended for regular scope traversal!
  /** @internal */readonly parentScope: IScope | null;
}

// TODO: currently unused, still need to fix the observersLookup type
export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> { }

export type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> =
  { [P in TKey]: PropertyObserver; } & { getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver };

export type IObservable = IIndexable & {
  readonly $synthetic?: false;
  $observers?: Record<string, AccessorOrObserver>;
};
