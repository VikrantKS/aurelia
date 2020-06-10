var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../lifecycle", "../observation/observer-locator", "./connectable"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("../lifecycle");
    const observer_locator_1 = require("../observation/observer-locator");
    const connectable_1 = require("./connectable");
    let LetBinding = class LetBinding {
        constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
            this.sourceExpression = sourceExpression;
            this.targetProperty = targetProperty;
            this.observerLocator = observerLocator;
            this.locator = locator;
            this.toBindingContext = toBindingContext;
            this.interceptor = this;
            this.$state = 0 /* none */;
            this.$scope = void 0;
            this.target = null;
            connectable_1.connectable.assignIdTo(this);
            this.$lifecycle = locator.get(lifecycle_1.ILifecycle);
        }
        handleChange(_newValue, _previousValue, flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            if (flags & 16 /* updateTargetInstance */) {
                const { target, targetProperty } = this;
                const previousValue = target[targetProperty];
                const newValue = this.sourceExpression.evaluate(flags, this.$scope, this.locator, this.part);
                if (newValue !== previousValue) {
                    target[targetProperty] = newValue;
                }
                return;
            }
            throw kernel_1.Reporter.error(15, flags);
        }
        $bind(flags, scope, part) {
            if (this.$state & 4 /* isBound */) {
                if (this.$scope === scope) {
                    return;
                }
                this.interceptor.$unbind(flags | 4096 /* fromBind */);
            }
            // add isBinding flag
            this.$state |= 1 /* isBinding */;
            this.$scope = scope;
            this.part = part;
            this.target = (this.toBindingContext ? scope.bindingContext : scope.overrideContext);
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.bind) {
                sourceExpression.bind(flags, scope, this.interceptor);
            }
            // sourceExpression might have been changed during bind
            this.target[this.targetProperty] = this.sourceExpression.evaluate(flags | 4096 /* fromBind */, scope, this.locator, part);
            this.sourceExpression.connect(flags, scope, this.interceptor, part);
            // add isBound flag and remove isBinding flag
            this.$state |= 4 /* isBound */;
            this.$state &= ~1 /* isBinding */;
        }
        $unbind(flags) {
            if (!(this.$state & 4 /* isBound */)) {
                return;
            }
            // add isUnbinding flag
            this.$state |= 2 /* isUnbinding */;
            const sourceExpression = this.sourceExpression;
            if (sourceExpression.unbind) {
                sourceExpression.unbind(flags, this.$scope, this.interceptor);
            }
            this.$scope = void 0;
            this.interceptor.unobserve(true);
            // remove isBound and isUnbinding flags
            this.$state &= ~(4 /* isBound */ | 2 /* isUnbinding */);
        }
    };
    LetBinding = __decorate([
        connectable_1.connectable(),
        __metadata("design:paramtypes", [Object, String, Object, Object, Boolean])
    ], LetBinding);
    exports.LetBinding = LetBinding;
});
//# sourceMappingURL=let-binding.js.map