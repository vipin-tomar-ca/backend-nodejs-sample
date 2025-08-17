export type ServiceIdentifier = symbol | string;

// Metadata storage for dependency injection
const dependencyMetadata = new Map<string, any[]>();

// Store constructor parameter metadata
export function inject(token: ServiceIdentifier): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const className = target.constructor.name;
    if (!dependencyMetadata.has(className)) {
      dependencyMetadata.set(className, []);
    }
    dependencyMetadata.get(className)![parameterIndex] = token;
  };
}

// Get dependencies for a class
export function getDependencies(className: string): ServiceIdentifier[] {
  return dependencyMetadata.get(className) || [];
}

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

class BindingBuilder<T> implements ScopeBuilder<T> {
  private binding: Binding<T>;

  constructor(private readonly container: Container, private readonly key: ServiceIdentifier) {
    this.binding = { provider: () => { throw new Error('Provider not set'); }, scope: 'Singleton' };
  }

  public to(constructor: new (...args: any[]) => T): ScopeBuilder<T> {
    this.binding.provider = () => {
      const dependencies = getDependencies(constructor.name);
      const args = dependencies.map(dep => this.container.get(dep));
      return new constructor(...args);
    };
    this.container._setBinding(this.key, this.binding);
    return this;
  }

  public toConstantValue(value: T): void {
    this.binding.provider = () => value;
    this.binding.scope = 'Singleton';
    this.binding.cache = value;
    this.container._setBinding(this.key, this.binding);
  }

  public inSingletonScope(): void {
    this.binding.scope = 'Singleton';
    this.container._setBinding(this.key, this.binding);
  }

  public inTransientScope(): void {
    this.binding.scope = 'Transient';
    this.container._setBinding(this.key, this.binding);
  }
}

export class Container {
  private bindings: Map<ServiceIdentifier, Binding<unknown>> = new Map();

  // Expose a number so existing logs like `${container.id} services registered` still work
  public get id(): number {
    return this.bindings.size;
  }

  public bind<T>(key: ServiceIdentifier): BindingBuilder<T> {
    return new BindingBuilder<T>(this, key);
  }

  public rebind<T>(key: ServiceIdentifier): BindingBuilder<T> {
    this.bindings.delete(key);
    return new BindingBuilder<T>(this, key);
  }

  public get<T>(key: ServiceIdentifier): T {
    const binding = this.bindings.get(key) as Binding<T> | undefined;
    if (!binding) {
      throw new Error(`Service not bound for key: ${String(key)}`);
    }

    if (binding.scope === 'Singleton') {
      if (binding.cache === undefined) {
        binding.cache = binding.provider();
        this.bindings.set(key, binding);
      }
      return binding.cache as T;
    }

    return binding.provider();
  }

  // Internal: used by BindingBuilder to store bindings
  public _setBinding<T>(key: ServiceIdentifier, binding: Binding<T>): void {
    this.bindings.set(key, binding as Binding<unknown>);
  }
}

// Mark class as injectable and store metadata
export function injectable(): ClassDecorator {
  return (target: any) => {
    // Store the class name for dependency resolution
    if (!dependencyMetadata.has(target.name)) {
      dependencyMetadata.set(target.name, []);
    }
  };
}


