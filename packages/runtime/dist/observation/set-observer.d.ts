import { CollectionKind, AccessorType, LifecycleFlags } from '../observation.js';
import { CollectionSizeObserver } from './collection-size-observer.js';
import type { ICollectionObserver, ICollectionIndexObserver, ILifecycle } from '../observation.js';
export declare function enableSetObservation(): void;
export declare function disableSetObservation(): void;
export interface SetObserver extends ICollectionObserver<CollectionKind.set> {
}
export declare class SetObserver {
    inBatch: boolean;
    type: AccessorType;
    constructor(observedSet: Set<unknown>);
    notify(): void;
    getLengthObserver(): CollectionSizeObserver;
    getIndexObserver(index: number): ICollectionIndexObserver;
    flushBatch(flags: LifecycleFlags): void;
}
export declare function getSetObserver(observedSet: Set<unknown>, lifecycle: ILifecycle | null): SetObserver;
//# sourceMappingURL=set-observer.d.ts.map