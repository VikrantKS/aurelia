"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentAgent = void 0;
const runtime_html_1 = require("@aurelia/runtime-html");
const kernel_1 = require("@aurelia/kernel");
const route_definition_js_1 = require("./route-definition.js");
const instructions_js_1 = require("./instructions.js");
const componentAgentLookup = new WeakMap();
class ComponentAgent {
    constructor(instance, controller, definition, routeNode, ctx) {
        this.instance = instance;
        this.controller = controller;
        this.definition = definition;
        this.routeNode = routeNode;
        this.ctx = ctx;
        this.logger = ctx.get(kernel_1.ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
        const lifecycleHooks = controller.lifecycleHooks;
        this.canLoadHooks = (lifecycleHooks.canLoad ?? []).map(x => x.instance);
        this.loadHooks = (lifecycleHooks.load ?? []).map(x => x.instance);
        this.canUnloadHooks = (lifecycleHooks.canUnload ?? []).map(x => x.instance);
        this.unloadHooks = (lifecycleHooks.unload ?? []).map(x => x.instance);
        this.hasCanLoad = 'canLoad' in instance;
        this.hasLoad = 'load' in instance;
        this.hasCanUnload = 'canUnload' in instance;
        this.hasUnload = 'unload' in instance;
    }
    static for(componentInstance, hostController, routeNode, ctx) {
        let componentAgent = componentAgentLookup.get(componentInstance);
        if (componentAgent === void 0) {
            const definition = route_definition_js_1.RouteDefinition.resolve(componentInstance.constructor);
            const controller = runtime_html_1.Controller.forCustomElement(ctx.get(runtime_html_1.IAppRoot), ctx, componentInstance, hostController.host, null);
            componentAgentLookup.set(componentInstance, componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx));
        }
        return componentAgent;
    }
    activate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`activate() - initial`);
            return this.controller.activate(this.controller, parent, flags);
        }
        this.logger.trace(`activate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.activate(initiator, parent, flags);
    }
    deactivate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`deactivate() - initial`);
            return this.controller.deactivate(this.controller, parent, flags);
        }
        this.logger.trace(`deactivate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.deactivate(initiator, parent, flags);
    }
    dispose() {
        this.logger.trace(`dispose()`);
        this.controller.dispose();
    }
    canUnload(tr, next, b) {
        this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canUnloadHooks) {
            tr.run(() => {
                b.push();
                return hook.canUnload(this.instance, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        if (this.hasCanUnload) {
            tr.run(() => {
                b.push();
                return this.instance.canUnload(next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        b.pop();
    }
    canLoad(tr, next, b) {
        this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canLoadHooks) {
            tr.run(() => {
                b.push();
                return hook.canLoad(this.instance, next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : instructions_js_1.ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        if (this.hasCanLoad) {
            tr.run(() => {
                b.push();
                return this.instance.canLoad(next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : instructions_js_1.ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        b.pop();
    }
    unload(tr, next, b) {
        this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.unloadHooks) {
            tr.run(() => {
                b.push();
                return hook.unload(this.instance, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasUnload) {
            tr.run(() => {
                b.push();
                return this.instance.unload(next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    load(tr, next, b) {
        this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.loadHooks) {
            tr.run(() => {
                b.push();
                return hook.load(this.instance, next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasLoad) {
            tr.run(() => {
                b.push();
                return this.instance.load(next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    toString() {
        return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
    }
}
exports.ComponentAgent = ComponentAgent;
//# sourceMappingURL=component-agent.js.map