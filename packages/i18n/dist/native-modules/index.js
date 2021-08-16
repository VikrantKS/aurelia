import { DI as t, IEventAggregator as n, toArray as i, camelCase as s, Registration as e } from "../../../kernel/dist/native-modules/index.js";

import { ValueConverterExpression as r, bindingBehavior as o, Interpolation as a, CustomElement as h, AttrSyntax as l, attributePattern as c, BindingMode as u, IAttrMapper as d, bindingCommand as f, IPlatform as m, renderer as g, valueConverter as p, AppTask as v, AttributePattern as b, BindingCommand as B } from "../../../runtime-html/dist/native-modules/index.js";

import { ValueConverterExpression as T, bindingBehavior as w, ISignaler as C, valueConverter as y, CustomExpression as I, connectable as x, IExpressionParser as P, IObserverLocator as M } from "../../../runtime/dist/native-modules/index.js";

import A from "i18next";

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ function L(t, n, i, s) {
    var e = arguments.length, r = e < 3 ? n : null === s ? s = Object.getOwnPropertyDescriptor(n, i) : s, o;
    if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(t, n, i, s); else for (var a = t.length - 1; a >= 0; a--) if (o = t[a]) r = (e < 3 ? o(r) : e > 3 ? o(n, i, r) : o(n, i)) || r;
    return e > 3 && r && Object.defineProperty(n, i, r), r;
}

function R(t, n) {
    return function(i, s) {
        n(i, s, t);
    };
}

var E;

(function(t) {
    t["I18N_EA_CHANNEL"] = "i18n:locale:changed";
    t["I18N_SIGNAL"] = "aurelia-translation-signal";
    t["RT_SIGNAL"] = "aurelia-relativetime-signal";
})(E || (E = {}));

var k;

(function(t) {
    t["translationValueConverterName"] = "t";
    t["dateFormatValueConverterName"] = "df";
    t["numberFormatValueConverterName"] = "nf";
    t["relativeTimeValueConverterName"] = "rt";
})(k || (k = {}));

function N(t, n) {
    const i = n.sourceExpression.expression;
    if (!(i instanceof T)) {
        const s = new T(i, t, n.sourceExpression.args);
        n.sourceExpression.expression = s;
    }
}

let V = class DateFormatBindingBehavior {
    bind(t, n, i) {
        N("df", i);
    }
};

V = L([ w("df") ], V);

const $ = t.createInterface("I18nInitOptions");

const O = t.createInterface("I18nextWrapper");

class I18nextWrapper {
    constructor() {
        this.i18next = A;
    }
}

var _;

(function(t) {
    t[t["Second"] = 1e3] = "Second";
    t[t["Minute"] = 6e4] = "Minute";
    t[t["Hour"] = 36e5] = "Hour";
    t[t["Day"] = 864e5] = "Day";
    t[t["Week"] = 6048e5] = "Week";
    t[t["Month"] = 2592e6] = "Month";
    t[t["Year"] = 31536e6] = "Year";
})(_ || (_ = {}));

class I18nKeyEvaluationResult {
    constructor(t) {
        this.value = void 0;
        const n = /\[([a-z\-, ]*)\]/gi;
        this.attributes = [];
        const i = n.exec(t);
        if (i) {
            t = t.replace(i[0], "");
            this.attributes = i[1].split(",");
        }
        this.key = t;
    }
}

const D = t.createInterface("I18N");

let F = class I18nService {
    constructor(t, n, i, s) {
        this.ea = i;
        this.i = new Set;
        this.i18next = t.i18next;
        this.initPromise = this.h(n);
        this.l = s;
    }
    evaluate(t, n) {
        const i = t.split(";");
        const s = [];
        for (const t of i) {
            const i = new I18nKeyEvaluationResult(t);
            const e = i.key;
            const r = this.tr(e, n);
            if (this.options.skipTranslationOnMissingKey && r === e) console.warn(`Couldn't find translation for key: ${e}`); else {
                i.value = r;
                s.push(i);
            }
        }
        return s;
    }
    tr(t, n) {
        return this.i18next.t(t, n);
    }
    getLocale() {
        return this.i18next.language;
    }
    async setLocale(t) {
        const n = this.getLocale();
        const i = {
            oldLocale: n,
            newLocale: t
        };
        await this.i18next.changeLanguage(t);
        this.ea.publish("i18n:locale:changed", i);
        this.i.forEach((t => t.handleLocaleChange(i)));
        this.l.dispatchSignal("aurelia-translation-signal");
    }
    createNumberFormat(t, n) {
        return Intl.NumberFormat(n || this.getLocale(), t);
    }
    nf(t, n, i) {
        return this.createNumberFormat(n, i).format(t);
    }
    createDateTimeFormat(t, n) {
        return Intl.DateTimeFormat(n || this.getLocale(), t);
    }
    df(t, n, i) {
        return this.createDateTimeFormat(n, i).format(t);
    }
    uf(t, n) {
        const i = this.nf(1e4 / 3, void 0, n);
        let s = i[1];
        const e = i[5];
        if ("." === s) s = "\\.";
        const r = t.replace(new RegExp(s, "g"), "").replace(/[^\d.,-]/g, "").replace(e, ".");
        return Number(r);
    }
    createRelativeTimeFormat(t, n) {
        return new Intl.RelativeTimeFormat(n || this.getLocale(), t);
    }
    rt(t, n, i) {
        let s = t.getTime() - this.now();
        const e = this.options.rtEpsilon * (s > 0 ? 1 : 0);
        const r = this.createRelativeTimeFormat(n, i);
        let o = s / 31536e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "year");
        o = s / 2592e6;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "month");
        o = s / 6048e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "week");
        o = s / 864e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "day");
        o = s / 36e5;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "hour");
        o = s / 6e4;
        if (Math.abs(o + e) >= 1) return r.format(Math.round(o), "minute");
        s = Math.abs(s) < 1e3 ? 1e3 : s;
        o = s / 1e3;
        return r.format(Math.round(o), "second");
    }
    subscribeLocaleChange(t) {
        this.i.add(t);
    }
    now() {
        return (new Date).getTime();
    }
    async h(t) {
        const n = {
            lng: "en",
            fallbackLng: [ "en" ],
            debug: false,
            plugins: [],
            rtEpsilon: .01,
            skipTranslationOnMissingKey: false
        };
        this.options = {
            ...n,
            ...t
        };
        for (const t of this.options.plugins) this.i18next.use(t);
        await this.i18next.init(this.options);
    }
};

F = L([ R(0, O), R(1, $), R(2, n), R(3, C) ], F);

let j = class DateFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n, i) {
        if (!t && 0 !== t || "string" === typeof t && "" === t.trim()) return t;
        if ("string" === typeof t) {
            const n = Number(t);
            const i = new Date(Number.isInteger(n) ? n : t);
            if (isNaN(i.getTime())) return t;
            t = i;
        }
        return this.i18n.df(t, n, i);
    }
};

j = L([ y("df"), R(0, D) ], j);

let K = class NumberFormatBindingBehavior {
    bind(t, n, i) {
        N("nf", i);
    }
};

K = L([ w("nf") ], K);

let S = class NumberFormatValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n, i) {
        if ("number" !== typeof t) return t;
        return this.i18n.nf(t, n, i);
    }
};

S = L([ y("nf"), R(0, D) ], S);

let W = class RelativeTimeBindingBehavior {
    bind(t, n, i) {
        N("rt", i);
    }
};

W = L([ w("rt") ], W);

let z = class RelativeTimeValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal", "aurelia-relativetime-signal" ];
    }
    toView(t, n, i) {
        if (!(t instanceof Date)) return t;
        return this.i18n.rt(t, n, i);
    }
};

z = L([ y("rt"), R(0, D) ], z);

let H = class TranslationBindingBehavior {
    bind(t, n, i) {
        const s = i.sourceExpression.expression;
        if (!(s instanceof r)) {
            const t = new r(s, "t", i.sourceExpression.args);
            i.sourceExpression.expression = t;
        }
    }
};

H = L([ o("t") ], H);

const U = [ "textContent", "innerHTML", "prepend", "append" ];

const G = new Map([ [ "text", "textContent" ], [ "html", "innerHTML" ] ]);

const Y = {
    optional: true
};

const q = {
    reusable: false,
    preempt: true
};

class TranslationBinding {
    constructor(t, n, i, s) {
        this.locator = i;
        this.interceptor = this;
        this.isBound = false;
        this.u = U;
        this.task = null;
        this.parameter = null;
        this.target = t;
        this.i18n = this.locator.get(D);
        this.platform = s;
        this.B = new Set;
        this.oL = n;
        this.i18n.subscribeLocaleChange(this);
    }
    static create({parser: t, observerLocator: n, context: i, controller: s, target: e, instruction: r, platform: o, isParameterContext: a}) {
        const h = this.getBinding({
            observerLocator: n,
            context: i,
            controller: s,
            target: e,
            platform: o
        });
        const l = "string" === typeof r.from ? t.parse(r.from, 8) : r.from;
        if (a) h.useParameter(l); else {
            const n = l instanceof I ? t.parse(l.value, 1) : void 0;
            h.expr = n || l;
        }
    }
    static getBinding({observerLocator: t, context: n, controller: i, target: s, platform: e}) {
        let r = i.bindings && i.bindings.find((t => t instanceof TranslationBinding && t.target === s));
        if (!r) {
            r = new TranslationBinding(s, t, n, e);
            i.addBinding(r);
        }
        return r;
    }
    $bind(t, n) {
        var i;
        if (!this.expr) throw new Error("key expression is missing");
        this.scope = n;
        this.T = this.expr instanceof a;
        this.C = this.expr.evaluate(t, n, this.locator, this);
        this.I();
        null === (i = this.parameter) || void 0 === i ? void 0 : i.$bind(t, n);
        this.P(t);
        this.isBound = true;
    }
    $unbind(t) {
        var n;
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        null === (n = this.parameter) || void 0 === n ? void 0 : n.$unbind(t);
        this.B.clear();
        if (null !== this.task) {
            this.task.cancel();
            this.task = null;
        }
        this.scope = void 0;
        this.obs.clearAll();
    }
    handleChange(t, n, i) {
        this.obs.version++;
        this.C = this.T ? this.expr.evaluate(i, this.scope, this.locator, this) : t;
        this.obs.clear();
        this.I();
        this.P(i);
    }
    handleLocaleChange() {
        this.P(0);
    }
    useParameter(t) {
        if (null != this.parameter) throw new Error("This translation parameter has already been specified.");
        this.parameter = new ParameterBinding(this, t, (t => this.P(t)));
    }
    P(t) {
        var n;
        const i = this.i18n.evaluate(this.C, null === (n = this.parameter) || void 0 === n ? void 0 : n.value);
        const s = Object.create(null);
        const e = [];
        const r = this.task;
        this.B.clear();
        for (const n of i) {
            const i = n.value;
            const r = this.M(n.attributes);
            for (const n of r) if (this.A(n)) s[n] = i; else {
                const s = h.for(this.target, Y);
                const r = s && s.viewModel ? this.oL.getAccessor(s.viewModel, n) : this.oL.getAccessor(this.target, n);
                const o = 0 === (2 & t) && (4 & r.type) > 0;
                if (o) e.push(new AccessorUpdateTask(r, i, t, this.target, n)); else r.setValue(i, t, this.target, n);
                this.B.add(r);
            }
        }
        let o = false;
        if (Object.keys(s).length > 0) {
            o = 0 === (2 & t);
            if (!o) this.L(s, t);
        }
        if (e.length > 0 || o) this.task = this.platform.domWriteQueue.queueTask((() => {
            this.task = null;
            for (const t of e) t.run();
            if (o) this.L(s, t);
        }), q);
        null === r || void 0 === r ? void 0 : r.cancel();
    }
    M(t) {
        if (0 === t.length) t = "IMG" === this.target.tagName ? [ "src" ] : [ "textContent" ];
        for (const [n, i] of G) {
            const s = t.findIndex((t => t === n));
            if (s > -1) t.splice(s, 1, i);
        }
        return t;
    }
    A(t) {
        return this.u.includes(t);
    }
    L(t, n) {
        const s = i(this.target.childNodes);
        const e = [];
        const r = "au-i18n";
        for (const t of s) if (!Reflect.get(t, r)) e.push(t);
        const o = this.R(t, r, e);
        this.target.innerHTML = "";
        for (const t of i(o.content.childNodes)) this.target.appendChild(t);
    }
    R(t, n, i) {
        var s;
        const e = this.platform.document.createElement("template");
        this.N(e, t.prepend, n);
        if (!this.N(e, null !== (s = t.innerHTML) && void 0 !== s ? s : t.textContent, n)) for (const t of i) e.content.append(t);
        this.N(e, t.append, n);
        return e;
    }
    N(t, n, s) {
        if (void 0 !== n && null !== n) {
            const e = this.platform.document.createElement("div");
            e.innerHTML = n;
            for (const n of i(e.childNodes)) {
                Reflect.set(n, s, true);
                t.content.append(n);
            }
            return true;
        }
        return false;
    }
    I() {
        var t;
        const n = null !== (t = this.C) && void 0 !== t ? t : this.C = "";
        const i = typeof n;
        if ("string" !== i) throw new Error(`Expected the i18n key to be a string, but got ${n} of type ${i}`);
    }
}

class AccessorUpdateTask {
    constructor(t, n, i, s, e) {
        this.accessor = t;
        this.v = n;
        this.f = i;
        this.el = s;
        this.attr = e;
    }
    run() {
        this.accessor.setValue(this.v, this.f, this.el, this.attr);
    }
}

class ParameterBinding {
    constructor(t, n, i) {
        this.owner = t;
        this.expr = n;
        this.updater = i;
        this.interceptor = this;
        this.isBound = false;
        this.oL = t.oL;
        this.locator = t.locator;
    }
    handleChange(t, n, i) {
        this.obs.version++;
        this.value = this.expr.evaluate(i, this.scope, this.locator, this);
        this.obs.clear();
        this.updater(i);
    }
    $bind(t, n) {
        if (this.isBound) return;
        this.scope = n;
        if (this.expr.hasBind) this.expr.bind(t, n, this);
        this.value = this.expr.evaluate(t, n, this.locator, this);
        this.isBound = true;
    }
    $unbind(t) {
        if (!this.isBound) return;
        if (this.expr.hasUnbind) this.expr.unbind(t, this.scope, this);
        this.scope = void 0;
        this.obs.clearAll();
    }
}

x(TranslationBinding);

x(ParameterBinding);

const J = "tpt";

const Q = "t-params.bind";

let X = class TranslationParametersAttributePattern {
    [Q](t, n, i) {
        return new l(t, n, "", Q);
    }
};

X = L([ c({
    pattern: Q,
    symbols: ""
}) ], X);

class TranslationParametersBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = J;
        this.mode = u.toView;
    }
}

let Z = class TranslationParametersBindingCommand {
    constructor(t, n) {
        this.type = 0;
        this.m = t;
        this.ep = n;
    }
    get name() {
        return Q;
    }
    build(t) {
        var n;
        const i = t.attr;
        let e = i.target;
        if (null == t.bindable) e = null !== (n = this.m.map(t.node, e)) && void 0 !== n ? n : s(e); else e = t.bindable.property;
        return new TranslationParametersBindingInstruction(this.ep.parse(i.rawValue, 8), e);
    }
};

Z.inject = [ d, P ];

Z = L([ f(Q) ], Z);

let tt = class TranslationParametersBindingRenderer {
    constructor(t, n, i) {
        this.ep = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i) {
        TranslationBinding.create({
            parser: this.ep,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: n,
            instruction: i,
            isParameterContext: true,
            platform: this.p
        });
    }
};

tt.inject = [ P, M, m ];

tt = L([ g(J) ], tt);

const nt = "tt";

class TranslationAttributePattern {
    static registerAlias(t) {
        this.prototype[t] = function(n, i, s) {
            return new l(n, i, "", t);
        };
    }
}

class TranslationBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = nt;
        this.mode = u.toView;
    }
}

class TranslationBindingCommand {
    constructor(t) {
        this.type = 0;
        this.m = t;
    }
    get name() {
        return "t";
    }
    build(t) {
        var n;
        let i;
        if (null == t.bindable) i = null !== (n = this.m.map(t.node, t.attr.target)) && void 0 !== n ? n : s(t.attr.target); else i = t.bindable.property;
        return new TranslationBindingInstruction(new I(t.attr.rawValue), i);
    }
}

TranslationBindingCommand.inject = [ d ];

let it = class TranslationBindingRenderer {
    constructor(t, n, i) {
        this.ep = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i) {
        TranslationBinding.create({
            parser: this.ep,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: n,
            instruction: i,
            platform: this.p
        });
    }
};

it.inject = [ P, M, m ];

it = L([ g(nt) ], it);

const st = "tbt";

class TranslationBindAttributePattern {
    static registerAlias(t) {
        const n = `${t}.bind`;
        this.prototype[n] = function(t, i, s) {
            return new l(t, i, s[1], n);
        };
    }
}

class TranslationBindBindingInstruction {
    constructor(t, n) {
        this.from = t;
        this.to = n;
        this.type = st;
        this.mode = u.toView;
    }
}

class TranslationBindBindingCommand {
    constructor(t, n) {
        this.type = 0;
        this.m = t;
        this.ep = n;
    }
    get name() {
        return "t-bind";
    }
    build(t) {
        var n;
        let i;
        if (null == t.bindable) i = null !== (n = this.m.map(t.node, t.attr.target)) && void 0 !== n ? n : s(t.attr.target); else i = t.bindable.property;
        return new TranslationBindBindingInstruction(this.ep.parse(t.attr.rawValue, 8), i);
    }
}

TranslationBindBindingCommand.inject = [ d, P ];

let et = class TranslationBindBindingRenderer {
    constructor(t, n, i) {
        this.parser = t;
        this.oL = n;
        this.p = i;
    }
    render(t, n, i) {
        TranslationBinding.create({
            parser: this.parser,
            observerLocator: this.oL,
            context: t.container,
            controller: t,
            target: n,
            instruction: i,
            platform: this.p
        });
    }
};

et = L([ g(st), R(0, P), R(1, M), R(2, m) ], et);

let rt = class TranslationValueConverter {
    constructor(t) {
        this.i18n = t;
        this.signals = [ "aurelia-translation-signal" ];
    }
    toView(t, n) {
        return this.i18n.tr(t, n);
    }
};

rt = L([ p("t"), R(0, D) ], rt);

const ot = [ rt, H ];

function at(t) {
    const n = t.translationAttributeAliases;
    const i = Array.isArray(n) ? n : [ "t" ];
    const s = [];
    const r = [];
    const o = [];
    const a = [];
    for (const t of i) {
        const n = `${t}.bind`;
        s.push({
            pattern: t,
            symbols: ""
        });
        TranslationAttributePattern.registerAlias(t);
        r.push({
            pattern: n,
            symbols: "."
        });
        TranslationBindAttributePattern.registerAlias(t);
        if ("t" !== t) {
            o.push(t);
            a.push(n);
        }
    }
    const h = [ b.define(s, TranslationAttributePattern), B.define({
        name: "t",
        aliases: o
    }, TranslationBindingCommand), it, b.define(r, TranslationBindAttributePattern), B.define({
        name: "t.bind",
        aliases: a
    }, TranslationBindBindingCommand), et, X, Z, tt ];
    return {
        register(n) {
            return n.register(e.callback($, (() => t.initOptions)), v.beforeActivate(D, (t => t.initPromise)), e.singleton(O, I18nextWrapper), e.singleton(D, F), ...h, ...ot);
        }
    };
}

const ht = [ j, V ];

const lt = [ S, K ];

const ct = [ z, W ];

function ut(t) {
    return {
        optionsProvider: t,
        register(n) {
            const i = {
                initOptions: Object.create(null)
            };
            t(i);
            return n.register(at(i), ...ht, ...lt, ...ct);
        },
        customize(n) {
            return ut(n || t);
        }
    };
}

const dt = ut((() => {}));

export { V as DateFormatBindingBehavior, j as DateFormatValueConverter, D as I18N, dt as I18nConfiguration, $ as I18nInitOptions, I18nKeyEvaluationResult, F as I18nService, K as NumberFormatBindingBehavior, S as NumberFormatValueConverter, W as RelativeTimeBindingBehavior, z as RelativeTimeValueConverter, E as Signals, TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingInstruction, et as TranslationBindBindingRenderer, st as TranslationBindInstructionType, TranslationBinding, H as TranslationBindingBehavior, TranslationBindingCommand, TranslationBindingInstruction, it as TranslationBindingRenderer, nt as TranslationInstructionType, X as TranslationParametersAttributePattern, Z as TranslationParametersBindingCommand, TranslationParametersBindingInstruction, tt as TranslationParametersBindingRenderer, J as TranslationParametersInstructionType, rt as TranslationValueConverter };
//# sourceMappingURL=index.js.map
