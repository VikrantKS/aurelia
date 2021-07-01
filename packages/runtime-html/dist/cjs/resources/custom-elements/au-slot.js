"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuSlotsInfo = exports.IAuSlotsInfo = exports.AuSlot = exports.IProjections = void 0;
const kernel_1 = require("@aurelia/kernel");
const dom_js_1 = require("../../dom.js");
const custom_element_js_1 = require("../custom-element.js");
const renderer_js_1 = require("../../renderer.js");
const controller_js_1 = require("../../templating/controller.js");
const render_context_js_1 = require("../../templating/render-context.js");
exports.IProjections = kernel_1.DI.createInterface("IProjections");
class AuSlot {
    constructor(location, instruction, hdrContext) {
        var _a, _b;
        this.hdrContext = hdrContext;
        this.hostScope = null;
        this.outerScope = null;
        this.hasProjection = false;
        let factory;
        const slotInfo = instruction.auSlot;
        const projection = (_b = (_a = hdrContext.instruction) === null || _a === void 0 ? void 0 : _a.projections) === null || _b === void 0 ? void 0 : _b[slotInfo.name];
        if (projection == null) {
            factory = render_context_js_1.getRenderContext(slotInfo.fallback, hdrContext.controller.context.container).getViewFactory();
        }
        else {
            factory = render_context_js_1.getRenderContext(projection, hdrContext.parent.controller.context.container).getViewFactory();
            this.hasProjection = true;
        }
        this.view = factory.create().setLocation(location);
    }
    /** @internal */
    static get inject() { return [dom_js_1.IRenderLocation, renderer_js_1.IInstruction, controller_js_1.IHydrationContext]; }
    binding(_initiator, _parent, _flags) {
        var _a;
        this.hostScope = this.$controller.scope.parentScope;
        this.outerScope = this.hasProjection
            ? (_a = this.hdrContext.controller.scope.parentScope) !== null && _a !== void 0 ? _a : null : this.hostScope;
    }
    attaching(initiator, parent, flags) {
        var _a;
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
exports.AuSlot = AuSlot;
custom_element_js_1.customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
exports.IAuSlotsInfo = kernel_1.DI.createInterface('AuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}
exports.AuSlotsInfo = AuSlotsInfo;
//# sourceMappingURL=au-slot.js.map