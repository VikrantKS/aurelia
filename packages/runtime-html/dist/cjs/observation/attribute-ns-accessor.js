"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeNSAccessor = void 0;
const utilities_html_js_1 = require("../utilities-html.js");
const nsMap = utilities_html_js_1.createLookup();
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
class AttributeNSAccessor {
    constructor(namespace) {
        this.namespace = namespace;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    static forNs(ns) {
        var _a;
        return (_a = nsMap[ns]) !== null && _a !== void 0 ? _a : (nsMap[ns] = new AttributeNSAccessor(ns));
    }
    getValue(obj, propertyKey) {
        return obj.getAttributeNS(this.namespace, propertyKey);
    }
    setValue(newValue, flags, obj, key) {
        if (newValue == void 0) {
            obj.removeAttributeNS(this.namespace, key);
        }
        else {
            obj.setAttributeNS(this.namespace, key, newValue);
        }
    }
}
exports.AttributeNSAccessor = AttributeNSAccessor;
//# sourceMappingURL=attribute-ns-accessor.js.map