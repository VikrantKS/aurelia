import { Constructable, IContainer, ResourceDefinition, IResourceKind, ResourceType, PartialResourceDefinition, IServiceLocator } from '@aurelia/kernel';
import { IBinding, ISubscribable, LifecycleFlags } from './observation';
import { IConnectableBinding } from './binding/connectable';
import { IObserverLocator } from './observation/observer-locator';
import { BindingBehaviorExpression, IBindingBehaviorExpression } from './binding/ast';
import type { Scope } from './observation/binding-context';
export declare type PartialBindingBehaviorDefinition = PartialResourceDefinition<{
    strategy?: BindingBehaviorStrategy;
}>;
export declare type BindingBehaviorInstance<T extends {} = {}> = {
    bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IBinding, ...args: T[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IBinding, ...args: T[]): void;
} & T;
export declare const enum BindingBehaviorStrategy {
    singleton = 1,
    interceptor = 2
}
export declare type BindingBehaviorType<T extends Constructable = Constructable> = ResourceType<T, BindingBehaviorInstance>;
export declare type BindingBehaviorKind = IResourceKind<BindingBehaviorType, BindingBehaviorDefinition> & {
    isType<T>(value: T): value is (T extends Constructable ? BindingBehaviorType<T> : never);
    define<T extends Constructable>(name: string, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(def: PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: T): BindingBehaviorType<T>;
    getDefinition<T extends Constructable>(Type: T): BindingBehaviorDefinition<T>;
    annotate<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K, value: PartialBindingBehaviorDefinition[K]): void;
    getAnnotation<K extends keyof PartialBindingBehaviorDefinition>(Type: Constructable, prop: K): PartialBindingBehaviorDefinition[K];
};
export declare type BindingBehaviorDecorator = <T extends Constructable>(Type: T) => BindingBehaviorType<T>;
export declare function bindingBehavior(definition: PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare function bindingBehavior(name: string): BindingBehaviorDecorator;
export declare function bindingBehavior(nameOrDef: string | PartialBindingBehaviorDefinition): BindingBehaviorDecorator;
export declare class BindingBehaviorDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, BindingBehaviorInstance> {
    readonly Type: BindingBehaviorType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    readonly strategy: BindingBehaviorStrategy;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialBindingBehaviorDefinition, Type: BindingBehaviorType<T>): BindingBehaviorDefinition<T>;
    register(container: IContainer): void;
}
export declare class BindingBehaviorFactory<T extends Constructable = Constructable> {
    private readonly container;
    private readonly Type;
    private readonly deps;
    constructor(container: IContainer, Type: BindingBehaviorType<T>);
    construct(binding: IInterceptableBinding, expr: BindingBehaviorExpression): IInterceptableBinding;
}
export interface IInterceptableBinding extends IBinding {
    id?: number;
    readonly observerLocator?: IObserverLocator;
    updateTarget?(value: unknown, flags: LifecycleFlags): void;
    updateSource?(value: unknown, flags: LifecycleFlags): void;
    callSource?(args: object): unknown;
    handleChange?(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    observeProperty?(flags: LifecycleFlags, obj: object, propertyName: string): void;
    addObserver?(observer: ISubscribable): void;
    unobserve?(all?: boolean): void;
}
export interface BindingInterceptor extends IConnectableBinding {
}
export declare class BindingInterceptor implements IInterceptableBinding {
    readonly binding: IInterceptableBinding;
    readonly expr: IBindingBehaviorExpression;
    interceptor: this;
    get id(): number;
    get observerLocator(): IObserverLocator;
    get locator(): IServiceLocator;
    get $scope(): Scope | undefined;
    get isBound(): boolean;
    constructor(binding: IInterceptableBinding, expr: IBindingBehaviorExpression);
    updateTarget(value: unknown, flags: LifecycleFlags): void;
    updateSource(value: unknown, flags: LifecycleFlags): void;
    callSource(args: object): unknown;
    handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    $bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null): void;
    $unbind(flags: LifecycleFlags): void;
}
export declare const BindingBehavior: BindingBehaviorKind;
//# sourceMappingURL=binding-behavior.d.ts.map