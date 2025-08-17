"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
exports.inject = inject;
exports.getDependencies = getDependencies;
exports.injectable = injectable;
const dependencyMetadata = new Map();
function inject(token) {
    return (target, propertyKey, parameterIndex) => {
        const className = target.constructor.name;
        if (!dependencyMetadata.has(className)) {
            dependencyMetadata.set(className, []);
        }
        dependencyMetadata.get(className)[parameterIndex] = token;
    };
}
function getDependencies(className) {
    return dependencyMetadata.get(className) || [];
}
class BindingBuilder {
    constructor(container, key) {
        this.container = container;
        this.key = key;
        this.binding = { provider: () => { throw new Error('Provider not set'); }, scope: 'Singleton' };
    }
    to(constructor) {
        this.binding.provider = () => {
            const dependencies = getDependencies(constructor.name);
            const args = dependencies.map(dep => this.container.get(dep));
            return new constructor(...args);
        };
        this.container._setBinding(this.key, this.binding);
        return this;
    }
    toConstantValue(value) {
        this.binding.provider = () => value;
        this.binding.scope = 'Singleton';
        this.binding.cache = value;
        this.container._setBinding(this.key, this.binding);
    }
    inSingletonScope() {
        this.binding.scope = 'Singleton';
        this.container._setBinding(this.key, this.binding);
    }
    inTransientScope() {
        this.binding.scope = 'Transient';
        this.container._setBinding(this.key, this.binding);
    }
}
class Container {
    constructor() {
        this.bindings = new Map();
    }
    get id() {
        return this.bindings.size;
    }
    bind(key) {
        return new BindingBuilder(this, key);
    }
    rebind(key) {
        this.bindings.delete(key);
        return new BindingBuilder(this, key);
    }
    get(key) {
        const binding = this.bindings.get(key);
        if (!binding) {
            throw new Error(`Service not bound for key: ${String(key)}`);
        }
        if (binding.scope === 'Singleton') {
            if (binding.cache === undefined) {
                binding.cache = binding.provider();
                this.bindings.set(key, binding);
            }
            return binding.cache;
        }
        return binding.provider();
    }
    _setBinding(key, binding) {
        this.bindings.set(key, binding);
    }
}
exports.Container = Container;
function injectable() {
    return (target) => {
        if (!dependencyMetadata.has(target.name)) {
            dependencyMetadata.set(target.name, []);
        }
    };
}
//# sourceMappingURL=ioc.js.map