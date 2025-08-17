export type ServiceIdentifier = symbol | string;
export declare function inject(token: ServiceIdentifier): ParameterDecorator;
export declare function getDependencies(className: string): ServiceIdentifier[];
type Scope = 'Singleton' | 'Transient';
interface Binding<T> {
    provider: () => T;
    scope: Scope;
    cache?: T;
}
interface ScopeBuilder<T> {
    inSingletonScope(): void;
    inTransientScope(): void;
}
declare class BindingBuilder<T> implements ScopeBuilder<T> {
    private readonly container;
    private readonly key;
    private binding;
    constructor(container: Container, key: ServiceIdentifier);
    to(constructor: new (...args: any[]) => T): ScopeBuilder<T>;
    toConstantValue(value: T): void;
    inSingletonScope(): void;
    inTransientScope(): void;
}
export declare class Container {
    private bindings;
    get id(): number;
    bind<T>(key: ServiceIdentifier): BindingBuilder<T>;
    rebind<T>(key: ServiceIdentifier): BindingBuilder<T>;
    get<T>(key: ServiceIdentifier): T;
    _setBinding<T>(key: ServiceIdentifier, binding: Binding<T>): void;
}
export declare function injectable(): ClassDecorator;
export {};
//# sourceMappingURL=ioc.d.ts.map