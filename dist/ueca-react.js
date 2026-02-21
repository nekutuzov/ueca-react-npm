import * as $ from "react";
import Le from "react";
import * as d from "mobx";
import * as B from "mobx-react";
var L = { exports: {} }, j = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var be;
function We() {
  if (be) return j;
  be = 1;
  var n = Symbol.for("react.transitional.element"), e = Symbol.for("react.fragment");
  function t(i, r, o) {
    var c = null;
    if (o !== void 0 && (c = "" + o), r.key !== void 0 && (c = "" + r.key), "key" in r) {
      o = {};
      for (var a in r)
        a !== "key" && (o[a] = r[a]);
    } else o = r;
    return r = o.ref, {
      $$typeof: n,
      type: i,
      key: c,
      ref: r !== void 0 ? r : null,
      props: o
    };
  }
  return j.Fragment = e, j.jsx = t, j.jsxs = t, j;
}
var S = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var $e;
function Ve() {
  return $e || ($e = 1, process.env.NODE_ENV !== "production" && (function() {
    function n(s) {
      if (s == null) return null;
      if (typeof s == "function")
        return s.$$typeof === De ? null : s.displayName || s.name || null;
      if (typeof s == "string") return s;
      switch (s) {
        case H:
          return "Fragment";
        case ke:
          return "Profiler";
        case Pe:
          return "StrictMode";
        case je:
          return "Suspense";
        case Se:
          return "SuspenseList";
        case xe:
          return "Activity";
      }
      if (typeof s == "object")
        switch (typeof s.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), s.$$typeof) {
          case Oe:
            return "Portal";
          case Ie:
            return (s.displayName || "Context") + ".Provider";
          case Te:
            return (s._context.displayName || "Context") + ".Consumer";
          case Be:
            var l = s.render;
            return s = s.displayName, s || (s = l.displayName || l.name || "", s = s !== "" ? "ForwardRef(" + s + ")" : "ForwardRef"), s;
          case Ae:
            return l = s.displayName || null, l !== null ? l : n(s.type) || "Memo";
          case de:
            l = s._payload, s = s._init;
            try {
              return n(s(l));
            } catch {
            }
        }
      return null;
    }
    function e(s) {
      return "" + s;
    }
    function t(s) {
      try {
        e(s);
        var l = !1;
      } catch {
        l = !0;
      }
      if (l) {
        l = console;
        var _ = l.error, m = typeof Symbol == "function" && Symbol.toStringTag && s[Symbol.toStringTag] || s.constructor.name || "Object";
        return _.call(
          l,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          m
        ), e(s);
      }
    }
    function i(s) {
      if (s === H) return "<>";
      if (typeof s == "object" && s !== null && s.$$typeof === de)
        return "<...>";
      try {
        var l = n(s);
        return l ? "<" + l + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function r() {
      var s = K.A;
      return s === null ? null : s.getOwner();
    }
    function o() {
      return Error("react-stack-top-frame");
    }
    function c(s) {
      if (ue.call(s, "key")) {
        var l = Object.getOwnPropertyDescriptor(s, "key").get;
        if (l && l.isReactWarning) return !1;
      }
      return s.key !== void 0;
    }
    function a(s, l) {
      function _() {
        _e || (_e = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          l
        ));
      }
      _.isReactWarning = !0, Object.defineProperty(s, "key", {
        get: _,
        configurable: !0
      });
    }
    function u() {
      var s = n(this.type);
      return fe[s] || (fe[s] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), s = this.props.ref, s !== void 0 ? s : null;
    }
    function R(s, l, _, m, M, v, Q, ee) {
      return _ = v.ref, s = {
        $$typeof: le,
        type: s,
        key: l,
        props: v,
        _owner: M
      }, (_ !== void 0 ? _ : null) !== null ? Object.defineProperty(s, "ref", {
        enumerable: !1,
        get: u
      }) : Object.defineProperty(s, "ref", { enumerable: !1, value: null }), s._store = {}, Object.defineProperty(s._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(s, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(s, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: Q
      }), Object.defineProperty(s, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: ee
      }), Object.freeze && (Object.freeze(s.props), Object.freeze(s)), s;
    }
    function ce(s, l, _, m, M, v, Q, ee) {
      var g = l.children;
      if (g !== void 0)
        if (m)
          if (Ne(g)) {
            for (m = 0; m < g.length; m++)
              he(g[m]);
            Object.freeze && Object.freeze(g);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else he(g);
      if (ue.call(l, "key")) {
        g = n(s);
        var P = Object.keys(l).filter(function(Fe) {
          return Fe !== "key";
        });
        m = 0 < P.length ? "{key: someKey, " + P.join(": ..., ") + ": ...}" : "{key: someKey}", pe[g + m] || (P = 0 < P.length ? "{" + P.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          m,
          g,
          P,
          g
        ), pe[g + m] = !0);
      }
      if (g = null, _ !== void 0 && (t(_), g = "" + _), c(l) && (t(l.key), g = "" + l.key), "key" in l) {
        _ = {};
        for (var te in l)
          te !== "key" && (_[te] = l[te]);
      } else _ = l;
      return g && a(
        _,
        typeof s == "function" ? s.displayName || s.name || "Unknown" : s
      ), R(
        s,
        g,
        v,
        M,
        r(),
        _,
        Q,
        ee
      );
    }
    function he(s) {
      typeof s == "object" && s !== null && s.$$typeof === le && s._store && (s._store.validated = 1);
    }
    var F = Le, le = Symbol.for("react.transitional.element"), Oe = Symbol.for("react.portal"), H = Symbol.for("react.fragment"), Pe = Symbol.for("react.strict_mode"), ke = Symbol.for("react.profiler"), Te = Symbol.for("react.consumer"), Ie = Symbol.for("react.context"), Be = Symbol.for("react.forward_ref"), je = Symbol.for("react.suspense"), Se = Symbol.for("react.suspense_list"), Ae = Symbol.for("react.memo"), de = Symbol.for("react.lazy"), xe = Symbol.for("react.activity"), De = Symbol.for("react.client.reference"), K = F.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ue = Object.prototype.hasOwnProperty, Ne = Array.isArray, Z = console.createTask ? console.createTask : function() {
      return null;
    };
    F = {
      react_stack_bottom_frame: function(s) {
        return s();
      }
    };
    var _e, fe = {}, me = F.react_stack_bottom_frame.bind(
      F,
      o
    )(), ge = Z(i(o)), pe = {};
    S.Fragment = H, S.jsx = function(s, l, _, m, M) {
      var v = 1e4 > K.recentlyCreatedOwnerStacks++;
      return ce(
        s,
        l,
        _,
        !1,
        m,
        M,
        v ? Error("react-stack-top-frame") : me,
        v ? Z(i(s)) : ge
      );
    }, S.jsxs = function(s, l, _, m, M) {
      var v = 1e4 > K.recentlyCreatedOwnerStacks++;
      return ce(
        s,
        l,
        _,
        !0,
        m,
        M,
        v ? Error("react-stack-top-frame") : me,
        v ? Z(i(s)) : ge
      );
    };
  })()), S;
}
var ve;
function ze() {
  return ve || (ve = 1, process.env.NODE_ENV === "production" ? L.exports = We() : L.exports = Ve()), L.exports;
}
var p = ze();
function lt(n) {
  if (n)
    return JSON.parse(JSON.stringify(n));
}
function b(n) {
  return typeof n > "u";
}
function Ye(n) {
  return n === null;
}
function X(n) {
  return typeof n == "string";
}
function dt(n) {
  return typeof n == "number";
}
function ut(n) {
  return typeof n == "boolean";
}
function T(n) {
  return Array.isArray(n);
}
function f(n) {
  return typeof n == "function";
}
function O(n) {
  return n !== null && typeof n == "object";
}
function Ue(n) {
  return n instanceof Map;
}
function ie(n) {
  return typeof n == "symbol";
}
function ye(n, e) {
  if (n === e)
    return !0;
  if (O(n) && O(e)) {
    const t = Object.keys(n), i = Object.keys(e);
    if (t.length !== i.length)
      return !1;
    for (const r of t)
      if (!i.includes(r) || !ye(n[r], e[r]))
        return !1;
    return !0;
  }
  return !1;
}
function k(n, e) {
  return n.filter((t) => e.includes(t));
}
function _t(n) {
  return n.condition ? /* @__PURE__ */ p.jsx(p.Fragment, { children: oe(n.children) }) : null;
}
function oe(n) {
  if (f(n)) {
    const e = B.observer(n);
    return /* @__PURE__ */ p.jsx(e, {});
  }
  if (N(n)) {
    const e = n;
    return /* @__PURE__ */ p.jsx(e, {});
  }
  return n;
}
const ft = B.observer((n) => n.render === !1 ? null : /* @__PURE__ */ p.jsx(p.Fragment, { children: oe(n.node) }));
function x(n, e = "Invalid condition") {
  if (n)
    throw Error(e);
}
function mt(n, e) {
  if (!n)
    throw Error(e || "Invalid condition");
}
async function gt(n) {
  await new Promise((e) => setTimeout(e, n));
}
function pt(n) {
  return f(n) ? B.observer(n) : d.observable(n);
}
function C(n) {
  return !!(n && O(n) && Object.keys(n).length === 2 && f(n[0]) && (f(n[1]) || b(n[1])));
}
function qe(n) {
  return C(n) && b(n[1]);
}
function D(n) {
  return C(n) && f(n[1]);
}
function Je(n, e) {
  return [
    n ? () => {
      let i;
      try {
        i = n();
      } catch (r) {
        h(r.message, "error");
      }
      return i;
    } : void 0,
    e ? (i) => {
      try {
        e(i);
      } catch (r) {
        h(r.message, "error");
      }
    } : void 0
  ];
}
function Xe(n, e) {
  return [
    () => {
      let i;
      try {
        i = n();
      } catch (r) {
        h(r.message, "error");
      }
      return i || h(`Attempt to get bound property "${e.toString()}" of undefined`, "warn"), i ? i[e] : void 0;
    },
    (i) => {
      let r;
      try {
        r = n();
      } catch (o) {
        h(o.message, "error");
      }
      r ? r[e] = i : h(`Attempt to set bound property "${e.toString()}" of undefined`, "warn");
    }
  ];
}
function we(n, e) {
  if (f(n) && (f(e) || e === void 0))
    return Je(n, e);
  if (f(n) && X(e))
    return Xe(n, e);
  throw new Error("Invalid arguments for bind()");
}
class G {
  _target;
  _name;
  constructor(e, t) {
    this._target = e, this._name = t;
  }
}
const W = { Deep: 0, Shallow: 1, Reference: 2 };
class w extends G {
  _observableKind = W.Deep;
  //@MobX.observable
  _value = void 0;
  //@MobX.observable.shallow
  _valueShallow = void 0;
  //@MobX.observable.ref
  _valueRef = void 0;
  //@MobX.observable.ref
  _forceReactionToggle = void 0;
  _onValueChangeReactionDisposer;
  _structBindingReactionDisposer;
  _paramsBindingReactionDisposer;
  constructor(e, t) {
    super(e, t), d.makeObservable(this, {
      _value: d.observable,
      _valueShallow: d.observable.shallow,
      _valueRef: d.observable.ref,
      _forceReactionToggle: d.observable.ref,
      _forceReaction: d.action
    });
  }
  initBindings() {
    this._setupOnValueChangeReaction(), this._setupStructBindingReaction(), this._setupParamsBindingReaction();
  }
  deinitBindings() {
    this._onValueChangeReactionDisposer?.(), this._onValueChangeReactionDisposer = void 0, this._structBindingReactionDisposer?.(), this._structBindingReactionDisposer = void 0, this._paramsBindingReactionDisposer?.(), this._paramsBindingReactionDisposer = void 0;
  }
  get value() {
    return this._getObservable();
  }
  set value(e) {
    if (C(e))
      throw Error("Attempt to assign binding as a value");
    d.runInAction(() => {
      this._paramsBinding || this._structBinding ? this._modelIsNew() ? this._setValue(e) : (this._structBinding && D(this._structBinding) && (this._structBinding[1]?.(e), e = this._structBinding[0]?.()), this._paramsBinding && D(this._paramsBinding) && this._paramsBinding[1]?.(e)) : this._setValue(e);
    });
  }
  _setValue(e) {
    let t = this._getObservable();
    T(t) && (t = t.slice());
    const i = this._target;
    if (!w._isEqual(e, t)) {
      if (!this._modelIsNew() && !i.changeNotifyDisabled()) {
        const r = this._name;
        this._structOnPropChanging && (e = this._structOnPropChanging(r, e, t), x(e instanceof Promise, "Asynchronous OnPropChanging event is not allowed"));
        let o = this._getStructOnChangingEvent(r);
        if (o && (e = o(e, t), x(e instanceof Promise, "Asynchronous OnChanging<Prop> event is not allowed")), this._customOnPropChanging && (e = this._customOnPropChanging(r, e, t), x(e instanceof Promise, "Asynchronous OnPropChanging event is not allowed")), o = this._getCustomOnChangingEvent(r), o && (e = o(e, t), x(e instanceof Promise, "Asynchronous OnChanging<Prop> event is not allowed")), w._isEqual(e, t)) {
          setTimeout(() => this._forceReaction());
          return;
        }
      }
      this._setObservable(e);
    }
  }
  _setupStructBindingReaction() {
    if (this._structBindingReactionDisposer?.(), this._structBindingReactionDisposer = void 0, !this._structBinding)
      return;
    const e = this._name, t = this._target, i = (r) => {
      try {
        r = this._structBinding[0](), this._paramsBindingReactionDisposer && D(this._paramsBinding) && (this._paramsBinding[1](r), r = this._paramsBinding[0]()), this._setValue(r);
      } catch (o) {
        h(`Struct binding error: ${e}.set(${A(r)}) model=#${t.birthMark()} path=${t.htmlId()}
${o}`, "error");
      }
    };
    this._structBindingReactionDisposer = d.reaction(
      () => {
        let r = this._structBinding[0]();
        return T(r) && (r = r.slice()), [r, this._forceReactionToggle];
      },
      ([r]) => i(r),
      {
        name: `Struct binding model=#${t.birthMark()} path=${t.htmlId()}.${e}`,
        fireImmediately: !0
      }
    );
  }
  _setupParamsBindingReaction() {
    if (this._paramsBindingReactionDisposer?.(), this._paramsBindingReactionDisposer = void 0, !this._paramsBinding)
      return;
    const e = this._name, t = this._target, i = (r) => {
      try {
        this._structBindingReactionDisposer && D(this._structBinding) && (this._structBinding[1](r), r = this._structBinding[0]()), this._setValue(r);
      } catch (o) {
        h(`Param binding error: ${e}.set(${A(r)}) model=#${t.birthMark()} path=${t.htmlId()}${o}`, "error");
      }
    };
    this._paramsBindingReactionDisposer = d.reaction(
      () => {
        let r = this._paramsBinding[0]();
        return T(r) && (r = r.slice()), [r, this._forceReactionToggle];
      },
      ([r]) => i(r),
      {
        name: `Param binding model=#${t.birthMark()} path=${t.htmlId()}.${e}`,
        fireImmediately: !0
      }
    );
  }
  _setupOnValueChangeReaction() {
    this._onValueChangeReactionDisposer?.(), this._onValueChangeReactionDisposer = void 0;
    const e = this._name, t = this._target;
    this._onValueChangeReactionDisposer = d.reaction(
      () => {
        let i = this._getObservable();
        return T(i) && (i = i.slice()), [i, this._forceReactionToggle];
      },
      ([i], [r]) => {
        try {
          if (this._modelIsNew())
            throw Error("???");
          if (w._isEqual(i, r))
            return;
          h(`change prop model=#${t.birthMark()} path=${t.htmlId()}[${e}] ${A(r)}➝${A(i)}`), t.changeNotifyDisabled() || (this._structOnPropChange?.(e, i, r), this._getStructOnChangeEvent(e)?.(i, r), this._customOnPropChange?.(e, i, r), this._getCustomOnChangeEvent(e)?.(i, r));
        } catch (o) {
          h(`Prop change error: ${e}.set(${A(i)}) model=#${t.birthMark()} path=${t.htmlId()}
${o}`, "error");
        }
      },
      { name: `Prop change model=#${t.birthMark()} path=${t.htmlId()}.${e}` }
    );
  }
  get _structBinding() {
    const e = this._name, t = this._target;
    if (C(t.$.__struct.props?.[e]))
      return t.$.__struct.props[e];
  }
  get _paramsBinding() {
    const e = this._name, t = this._target;
    if (C(t.$.__params?.[e]))
      return t.$.__params[e];
  }
  get _structOnPropChanging() {
    return this._target.$.__struct.events?.onPropChanging;
  }
  get _structOnPropChange() {
    return this._target.$.__struct.events?.onPropChange;
  }
  _getStructOnChangingEvent(e) {
    return this._target.$.__struct.events?.[`onChanging${V(e)}`];
  }
  _getStructOnChangeEvent(e) {
    return this._target.$.__struct.events?.[`onChange${V(e)}`];
  }
  get _customOnPropChanging() {
    const e = this._target.onPropChanging;
    if (e instanceof E)
      return e.event;
  }
  get _customOnPropChange() {
    const e = this._target.onPropChange;
    if (e instanceof E)
      return e.event;
  }
  _getCustomOnChangingEvent(e) {
    const t = this._target[`onChanging${V(e)}`];
    if (t instanceof E)
      return t.event;
  }
  _getCustomOnChangeEvent(e) {
    const t = this._target[`onChange${V(e)}`];
    if (t instanceof E)
      return t.event;
  }
  _modelIsNew() {
    return !this._target.$.__status.initPhase;
  }
  // @MobX.action
  _forceReaction() {
    this._forceReactionToggle = !this._forceReactionToggle;
  }
  _getObservable() {
    return [this._value, this._valueShallow, this._valueRef, this._forceReactionToggle][this._observableKind];
  }
  _setObservable(e) {
    this._getObservable(), d.transaction(() => {
      const t = this._prepareValueToObserve(e, this._name);
      t.observable === "ref" ? (this._value = void 0, this._valueShallow = void 0, this._valueRef = t.value, this._observableKind = W.Reference) : t.observable === "shallow" ? (this._value = void 0, this._valueRef = void 0, this._valueShallow = t.value, this._observableKind = W.Shallow) : (this._valueShallow = void 0, this._valueRef = void 0, this._value = t.value, this._observableKind = W.Deep);
    });
  }
  _prepareObjectToObserve(e) {
    if (d.isObservable(e)) return { value: e, observable: "ref" };
    const t = Object.keys(e).reduce((r, o) => {
      if (d.isObservableProp(e, o)) return r;
      const c = this._prepareValueToObserve(e[o], o);
      return e[o] = c.value, c.observable === "ref" ? r[o] = d.observable.ref : c.observable === "shallow" ? r[o] = d.observable.shallow : r[o] = d.observable.deep, r;
    }, {});
    return { value: d.observable(e, t), observable: "ref" };
  }
  _prepareValueToObserve(e, t) {
    if (U(e))
      return { value: e, observable: "ref" };
    if (T(e) || Ue(e))
      return { value: e, observable: "shallow" };
    if (at(e) || Y(e) || N(e))
      return { value: e, observable: "ref" };
    if (f(e)) {
      if (ae(t) && !w._isWrappedView(e)) {
        const i = B.observer(e), r = (o) => /* @__PURE__ */ p.jsx(i, { ...o });
        r.__ueca_ViewFn = e, e = r;
      }
      return { value: e, observable: "ref" };
    } else if (O(e))
      return this._prepareObjectToObserve(e);
    return { value: e, observable: "deep" };
  }
  static _isEqual(e, t) {
    return Y(e) || Y(t) || N(e) || N(t) || U(e) || U(t) ? e === t : f(e) || f(t) ? (w._isWrappedView(e) && (e = e.__ueca_ViewFn), w._isWrappedView(t) && (t = t.__ueca_ViewFn), e === t) : ye(e, t);
  }
  static _isWrappedView(e) {
    return f(e) && Reflect.has(e, "__ueca_ViewFn");
  }
}
class re extends G {
  //@MobX.observable.ref
  child;
  constructor(e, t, i) {
    super(e, t), d.makeObservable(this, {
      child: d.observable.ref
    }), this.child = i;
  }
}
class se extends G {
  method;
  constructor(e, t, i) {
    if (super(e, t), ae(t)) {
      const r = B.observer(i);
      this.method = (o) => /* @__PURE__ */ p.jsx(r, { ...o });
    } else
      this.method = i;
  }
}
class E extends G {
  // @MobX.observable.ref
  _event;
  constructor(e, t) {
    super(e, t), d.makeObservable(this, {
      _event: d.observable.ref
    });
  }
  //@MobX.computed ??? This was not used. TODO: delete it?
  get event() {
    const e = this._target.$.__struct.events?.[this._name];
    return e && !Ce(this._name, this._target.$.__struct) && !Ge(this._name, this._target.$.__struct) ? async (...i) => {
      const r = this._target.$.__status.baseResult;
      try {
        let o = await e(...i);
        return this._event && (this._target.$.__status.baseResult = o, o = await this._event(...i)), o;
      } finally {
        this._target.$.__status.baseResult = r;
      }
    } : this._event;
  }
  // TODO: Why does this code break MobX reactions?
  // public get event() {
  //     const structEvent = (this._target.$.__struct.events as AnyObject)?.[this._name] as AnyMethod;
  //     if (structEvent && !isPropChangingEvent(this._name, this._target.$.__struct)) {
  //         const chainedEvent = async (...args: unknown[]) => {
  //             const baseResult = this._target.$.__status.baseResult;
  //             try {
  //                 let res: unknown;
  //                 await MobX.runInAction(async () => {
  //                     res = await structEvent(...args);
  //                 });
  //                 this._target.$.__status.baseResult = res;
  //                 if (this._event) {
  //                     this._target.$.__status.baseResult = res;
  //                     await MobX.runInAction(async () => {
  //                         res = await this._event(...args);
  //                     });
  //                 }
  //                 return res;
  //             } finally {
  //                 this._target.$.__status.baseResult = baseResult;
  //             }
  //         }
  //         return chainedEvent;
  //     }
  //     return this._event;
  // };
  set event(e) {
    this._event = e;
  }
}
function ae(n) {
  return n?.endsWith("View");
}
function Ce(n, e) {
  if (n === "onPropChanging")
    return !0;
  if (!n.startsWith("onChanging"))
    return !1;
  let t = n.substring(10);
  return t = t[0].toLowerCase() + t.slice(1), !!Reflect.has(e.props, t);
}
function Ge(n, e) {
  if (n === "onPropChange")
    return !0;
  if (!n.startsWith("onChange"))
    return !1;
  let t = n.substring(8);
  return t = t[0].toLowerCase() + t.slice(1), !!Reflect.has(e.props, t);
}
class He {
  _registry;
  name;
  constructor(e) {
    this.name = e, this._registry = /* @__PURE__ */ new Map();
  }
  subscribe(e) {
    const t = e.$.__struct.messages;
    t && Object.keys(t).forEach((i) => {
      let r = this._registry.get(i);
      r || (r = /* @__PURE__ */ new Set(), this._registry.set(i, r)), r.add(e);
    });
  }
  unsubscribe(e) {
    const t = e.$.__struct.messages;
    if (!t)
      return;
    const i = [];
    Object.keys(t).forEach((r) => {
      const o = this._registry.get(r);
      o && (o.delete(e), o.size || i.push(r));
    }), i.forEach((r) => {
      this._registry.delete(r);
    });
  }
  async broadcast(e, t, i) {
    const r = this._registry.get(t);
    if (!r || !r.size)
      return h(`MessageBus (${this.name}): no subscribers for message "${t}"`, "warn"), [];
    const o = [];
    for (const c of r) {
      if (!(b(e) || Ye(e) || e === "")) if (X(e)) {
        if (e && c.fullId() != e)
          continue;
      } else if (e instanceof RegExp) {
        if (!e.test(c.fullId()))
          continue;
      } else
        break;
      const a = c.$.__struct.messages?.[t];
      if (a) {
        const u = a(i);
        o.push(u);
      }
    }
    return await Promise.all(o);
  }
  async castTo(e, t, i) {
    const r = await this.broadcast(e, t, i);
    return r?.length > 1 && h(`MessageBus (${this.name}): Ambiguous unicast by message "${t}"`, "warn"), r ? r[0] : void 0;
  }
  async unicast(e, t) {
    return await this.castTo("", e, t);
  }
  /**      
   * @deprecated Use the `unicast` function instead.
   */
  async getAsync(e, t) {
    return await this.unicast(e, t);
  }
  /**      
   * @deprecated Use the `unicast` function instead.
   */
  async postAsync(e, t) {
    return await this.unicast(e, t);
  }
}
const Ke = "messagebus.post";
function Ze() {
  const n = new He("Default Message Bus");
  return window.addEventListener(Ke, e), n;
  function e(t) {
    n.broadcast(null, t.detail.message, t.detail.params);
  }
}
const Re = Ze(), Qe = $.createContext(Re);
function bt() {
  return Re;
}
function et(n) {
  return tt($.useContext(Qe), n);
}
function tt(n, e) {
  return $.useEffect(
    () => (n.subscribe(e), () => n.unsubscribe(e)),
    // it never changes bus or model
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    []
  ), n;
}
d._getGlobalState().allowStateChanges = !0;
class q {
  // Add index signature to allow dynamic property assignment
  _privateMembers;
  _birthMark;
  _disableOnChangeCount = 0;
  _bus;
  // @MobX.observable
  _renderToggle;
  constructor(e) {
    d.makeObservable(this, {
      _renderToggle: d.observable,
      View: d.computed,
      BaseView: d.computed,
      clearModelCache: d.action,
      invalidateView: d.action,
      _assignParams: d.action,
      _constr: d.action,
      _init: d.action,
      _mount: d.action,
      _unmount: d.action,
      _deinit: d.action,
      _draw: d.action,
      _erase: d.action,
      _deleteMember: d.action
    }), q._checkUniqueNamesInStructSections(e), this._privateMembers = {
      __status: {
        initPhase: void 0,
        mountPhase: void 0,
        cached: !1,
        initCount: 0,
        mountCount: 0,
        baseResult: void 0
      },
      __struct: void 0,
      __params: void 0,
      __owner: void 0,
      __dynamicChildrenIds: [],
      __staticChildrenCache: void 0,
      __proxy: void 0,
      __settersInProgress: [],
      __assignParams: void 0,
      __initializeModel: void 0
    }, e = { ...e }, this._birthMark = Math.round(Math.random() * 1e6).toString(), this.$.__struct = e, this.$.__dynamicChildrenIds = [], this.$.__staticChildrenCache = [], this.$.__settersInProgress = [], this.$.__assignParams = this._assignParams.bind(this), this.$.__initializeModel = this._initializeModel.bind(this);
    for (const t in e.props) {
      if (t.startsWith("__")) {
        this[t] = e.props[t], delete e.props[t];
        continue;
      }
      const i = new w(this, t), r = e.props[t];
      f(r) && (e.props[t] = we(r, void 0)), C(e.props[t]) ? ae(t) ? i.value = z : i.value = void 0 : i.value = e.props[t], this[t] = i;
    }
    for (const t in e.children) {
      const i = new re(this, t, e.children[t]);
      i.child.$.__owner = this, i.child.disableOnChange(), i.child.id = t, i.child.enableOnChange(), this[t] = i;
    }
    for (const t in e.methods) {
      const i = e.methods[t];
      this[t] = new se(this, t, i);
    }
    for (const t in e.events) {
      if (t.startsWith("onChanging") || t.startsWith("onChange") || t === "onPropChanging" || t === "onPropChange")
        return;
      this[t] = new E(this, t);
    }
    this._renderToggle = void 0;
  }
  get $() {
    return this._privateMembers;
  }
  get bus() {
    return this._bus;
  }
  // @MobX.computed
  get View() {
    return this._view();
  }
  // @MobX.computed
  get BaseView() {
    return this._view(!0);
  }
  disableOnChange() {
    this._disableOnChangeCount++;
  }
  enableOnChange() {
    if (this._disableOnChangeCount === 0)
      throw new Error("enableOnChange() requires disableOnChange() pair");
    this._disableOnChangeCount--;
  }
  changeNotifyDisabled() {
    return this._disableOnChangeCount > 0;
  }
  birthMark() {
    return this._birthMark;
  }
  fullId() {
    let e = "";
    return this.$.__owner && (e = this.$.__owner.fullId() + "."), e + (this.id?.value ?? "<empty>");
  }
  //@computed
  htmlId() {
    const e = this.fullId();
    return e === "<empty>" ? void 0 : window.hashHtmlId ? q._getHashCode(e) : e;
  }
  //@computed
  getChildrenModels(e) {
    const t = [];
    if (!e || e === "static")
      for (const i in this.$.__struct.children)
        t.push(this.$.__proxy[i]);
    return (!e || e === "dynamic") && this.$.__dynamicChildrenIds.forEach((i) => t.push(this.$.__proxy[i])), t;
  }
  //@MobX.action
  clearModelCache() {
    for (const e of this.$.__dynamicChildrenIds) {
      const t = this.$.__proxy[e];
      if (t && (h(`uncache dynamic model=#${t.birthMark()} path=${t.htmlId()} cache=#${this.birthMark()}`), this._deleteMember(e), t.$.__status.cached = !1, t.$.__staticChildrenCache.length)) {
        for (const i of t.$.__staticChildrenCache) {
          if (!i) return;
          h(`uncache static model=#${i.birthMark()} path=${i.htmlId()} cache=#${t.birthMark}`), i.$.__status.cached = !1;
        }
        for (const i of t.$.__staticChildrenCache) {
          if (!i) return;
          i.clearModelCache();
        }
        this.$.__staticChildrenCache.splice(0);
      }
    }
    this.$.__dynamicChildrenIds.splice(0);
  }
  //@MobX.action
  invalidateView() {
    this._renderToggle = !this._renderToggle;
  }
  _view(e = !1) {
    const t = B.observer(((i) => {
      const r = !b(this._renderToggle) && (b(i?.render) || i.render), o = r ? this.$.__proxy : void 0;
      r && this.$.__status.mountCount++, $.useEffect(() => (r && b(this.$.__status.mountPhase) && this._mount(), () => {
        r && this.$.__status.mountCount--, this.$.__status.mountCount || this._unmount();
      }));
      const c = (a) => {
        const u = e ? o?.$.__struct.BaseView : o?.$.__struct.View;
        return $.useLayoutEffect(() => {
          if (a && u)
            return this._draw(), () => {
              this._erase();
            };
        }), a && u ? (h(`render view model=#${o?.birthMark()} path=${o?.htmlId()}`), u(i)) : null;
      };
      return r ? /* @__PURE__ */ p.jsx(nt, { componentModel: o, children: /* @__PURE__ */ p.jsx(Me.Provider, { value: ct(o), children: c(!0) }) }) : c(!1);
    }).bind(this));
    return ((i) => /* @__PURE__ */ p.jsx(t, { ...i }));
  }
  //@MobX.action  // TODO: remove the attribute?
  _assignParams(e) {
    e = { ...e }, delete e.cacheable;
    for (const t in this.$.__struct.props)
      if (f(e[t]) && Reflect.has(e, t)) {
        const i = e[t];
        e[t] = we(i, void 0);
      }
    this.$.__params = e;
    for (const t in e)
      t === "constr" || t === "init" || t === "deinit" || t === "mount" || t === "unmount" || t === "draw" || t === "erase" || C(e[t]) || (this.$.__proxy[t] = e[t]);
  }
  _initBindings() {
    for (const e in this.$.__struct.props)
      this[e]?.initBindings();
  }
  _deInitBindings() {
    for (const e in this.$.__struct.props)
      this[e]?.deinitBindings();
  }
  //@MobX.action
  async _constr() {
    this.$.__status.initPhase = "constructing";
    try {
      const e = this.$.__proxy;
      h(`constr model=#${e.birthMark()} path=${e.htmlId()}`), await this.$.__struct.constr?.(this.$.__proxy), await this.$.__params?.constr?.(this.$.__proxy);
    } finally {
      this.$.__status.initPhase = "constructed";
    }
  }
  //@MobX.action
  async _init(e) {
    if (this.$.__status.initPhase || await this._constr(), this._assignParams(e), this.$.__status.initPhase === "constructed") {
      this.$.__status.initPhase = "initializing";
      try {
        const t = this.$.__proxy;
        h(`init model=#${t.birthMark()} path=${t.htmlId()}`), this._initBindings(), await this.$.__struct.init?.(t), await this.$.__params?.init?.(t);
      } finally {
        this.$.__status.initPhase = "initialized";
        try {
          this.$.__status.mountPhase === "init-mount" && await this._mount();
        } finally {
          b(this._renderToggle) && this.invalidateView();
        }
      }
    }
  }
  //@MobX.action
  async _mount() {
    if (this.$.__status.mountPhase === "mounted")
      return;
    if (this.$.__status.initPhase != "initialized") {
      this.$.__status.mountPhase = "init-mount";
      return;
    }
    this.$.__status.mountPhase = "mounting";
    const e = this.$.__proxy;
    h(`mount model=#${e.birthMark()} path=${e.htmlId()}`), await this.$.__struct.mount?.(e), await this.$.__params?.mount?.(e), this.$.__status.mountPhase = "mounted";
  }
  //@MobX.action
  async _unmount() {
    if (this.$.__status.mountPhase == "mounted") {
      this.$.__status.mountPhase = "unmounting";
      try {
        const e = this.$.__proxy;
        h(`unmount model=#${e.birthMark()} path=${e.htmlId()}`), await this.$.__params?.unmount?.(e), await this.$.__struct.unmount?.(e);
      } finally {
        this.$.__status.mountPhase = void 0, this.$.__status.initPhase === "unmount-deinit" && (this.$.__status.initPhase = "initialized", await this._deinit());
      }
    }
  }
  //@MobX.action
  async _deinit() {
    if (this.$.__status.initCount--, !this.$.__status.initCount && this.$.__status.initPhase === "initialized") {
      if (this.$.__status.mountPhase === "mounted" || this.$.__status.mountPhase === "unmounting") {
        this.$.__status.initCount++, this.$.__status.initPhase = "unmount-deinit";
        return;
      }
      this.$.__status.initPhase = "deinitializing";
      try {
        const e = this.$.__proxy;
        h(`deinit model=#${e.birthMark()} path=${e.htmlId()}`), this._renderToggle = void 0, await this.$.__params?.deinit?.(e), await this.$.__struct.deinit?.(e), this._deInitBindings();
      } finally {
        this.$.__status.initPhase = "constructed";
      }
    }
  }
  //@MobX.action
  async _draw() {
    const e = this.$.__proxy;
    await this.$.__struct.draw?.(e), await this.$.__params?.draw?.(e);
  }
  //@MobX.action
  async _erase() {
    const e = this.$.__proxy;
    await this.$.__params?.erase?.(e), await this.$.__struct.erase?.(e);
  }
  //@MobX.action
  _deleteMember(e) {
    let t = !1;
    return Reflect.has(this, e) && (delete this[e], t = !0), Reflect.has(this, e) && (delete this[e], t = !0), t;
  }
  _initializeModel(e) {
    this.$.__status.initCount++, this._bus = et(this), $.useEffect(() => (this._init(e), () => {
      this._deinit();
    }));
  }
  static _getHashCode(e) {
    const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
    let i = "";
    const r = Array.from(e).reduce((o, c) => Math.imul(31, o) + c.charCodeAt(0) | 0, 0);
    for (let o = 0; o < 32; o += 6)
      i += t.charAt(r >>> o & 63);
    return i;
  }
  static _checkUniqueNamesInStructSections(e) {
    const t = k(Object.keys(e.props ?? {}), Object.keys(e.children ?? {}));
    if (t.concat(k(Object.keys(e.props ?? {}), Object.keys(e.methods ?? {}))), t.concat(k(Object.keys(e.props ?? {}), Object.keys(e.events ?? {}))), t.concat(k(Object.keys(e.children ?? {}), Object.keys(e.methods ?? {}))), t.concat(k(Object.keys(e.children ?? {}), Object.keys(e.events ?? {}))), t.concat(k(Object.keys(e.methods ?? {}), Object.keys(e.events ?? {}))), t.length > 0)
      throw new Error(`The component structure${e.props?.id ? " " + e.props.id + " " : ""}contains not unique members: ${t}`);
  }
}
class nt extends $.PureComponent {
  _retryStarted = !1;
  _retriesLeft;
  constructor(e) {
    super(e), this.state = { renderingFailed: !1 }, this._retriesLeft = e.maxRenderRetries, b(this._retriesLeft) && (this._retriesLeft = 1);
  }
  static getDerivedStateFromError(e) {
    return { renderingFailed: !0, error: e };
  }
  componentDidCatch(e) {
    this._retriesLeft === 0 && (this.props.componentModel && h(`JSX Rendering Error model=#${this.props.componentModel.birthMark()} path=${this.props.componentModel.htmlId()}
${e}`, "error"), this.props?.onRenderError?.(e));
  }
  render() {
    if (!this.state.renderingFailed)
      return /* @__PURE__ */ p.jsx(p.Fragment, { children: oe(this.props.children) });
    let e = null;
    if (this._retriesLeft > 0)
      this._retryStarted || (setTimeout(() => {
        this._retriesLeft--, this._retryStarted = !1, this.setState({ renderingFailed: !1 });
      }), this._retryStarted = !0);
    else if (y.traceLog) {
      const t = {
        display: "flex",
        placeContent: "center",
        fontSize: "large",
        minWidth: "fit-content",
        minHeight: "fit-content",
        overflow: "overlay",
        backgroundColor: "red",
        color: "yellow"
      };
      e = /* @__PURE__ */ p.jsx("div", { style: t, title: this._getErrorTitleInfo(), children: "⚠" });
    }
    return e;
  }
  _getErrorTitleInfo() {
    let e = "";
    return this.props.description && (e = `${e}• Description
${this.props.description}

`), this.props.componentModel && (e = `${e}• UECA Component
model: #${this.props.componentModel.birthMark()}
path:  ${this.props.componentModel.htmlId()}

`), this.state.error && (e = `${e}• Error Details
${this.state.error?.message}`), `JSX RENDERING ERROR

${e}`;
  }
}
class J {
  constructor(e) {
    const t = new q(e), i = new Proxy(t, { get: J._get, set: J._set });
    return t.$.__proxy = i, i;
  }
  static _get(e, t) {
    if (ie(t) && t === rt || t === I)
      return e[I];
    let i = e[t];
    return i instanceof w ? i = i.value : i instanceof se ? i = i.method : i instanceof E ? i = i.event : i instanceof re ? i = i.child : f(i) && (i = i.bind(e)), i;
  }
  static _set(e, t, i) {
    if (ie(t) || t === I)
      return !1;
    if (e.$.__settersInProgress.indexOf(t) !== -1)
      return !0;
    e.$.__settersInProgress.push(t);
    try {
      if (e[t] instanceof w)
        e[t].value = i;
      else if (e[t] instanceof E)
        b(i) || f(i) ? e[t].event = i : console.error(`Attempt to assign non-function value to event "${t}"`);
      else if (f(i)) {
        const r = new E(e, t);
        r.event = i, e[t] = r;
      } else {
        if (e[t] instanceof se || e[t] instanceof re)
          return !1;
        e[t] = i;
      }
    } finally {
      e.$.__settersInProgress.pop();
    }
    return !0;
  }
}
function it(n, e) {
  const t = new J(n);
  return t.$.__assignParams(e), t;
}
const I = "$", rt = Symbol(I), z = () => /* @__PURE__ */ p.jsx(p.Fragment, {});
function $t(n, e, t, i) {
  i || (i = st);
  const r = i(ot(n, e, () => r), t);
  return r;
}
function st(n, e) {
  const t = Ee();
  let i = !0;
  const [r] = $.useState(() => (i = !1, o()));
  if (!r)
    throw Error("BUG: Component model is undefined");
  return i && h(`use React cached model=#${r.birthMark()} path=${r.htmlId()} cache=React.useState()`), r.$.__initializeModel(e), r;
  function o() {
    const a = c();
    let u = t?.staticModelsTrap?.getNextCachedModel();
    const R = u === null;
    return u ? t.staticModelsTrap && u != t.staticModelsTrap.owner && (h(`use cached static model=#${u.birthMark()} path=${u.htmlId()} cache=#${t.staticModelsTrap.owner?.birthMark()}`), u.cacheable && h(`remove cached static model=#${u.birthMark()} path=${u.htmlId()} cache=#${t.staticModelsTrap.owner?.birthMark()}`)) : (x(!n.props), n.props.cacheable = a, u = it(n, e ?? {}), h(`create model=#${u.birthMark()} path=${u.htmlId()}`), u.fullId() || h("Set a default id in the struct of the component model hook", "warn"), t?.staticModelsTrap && a && (t.staticModelsTrap.cacheModel(a ? u : null, R), R && h(`recache static model=#${u.birthMark()} path=${u.htmlId()} cache=#${t.staticModelsTrap.owner?.birthMark()}`))), u;
  }
  function c() {
    if (y.modelCacheMode == "no-cache")
      return !1;
    let a;
    return b(e?.cacheable) || (C(e.cacheable) ? h('Bindings are not permitted for the property "cacheable"', "error") : a = e.cacheable), b(a) && !b(n.props?.cacheable) && (C(n.props.cacheable) ? h('Bindings are not permitted for the property "cacheable"', "error") : a = n.props.cacheable), b(a) && y.modelCacheMode == "auto-cache" && (a = !0), !!a;
  }
}
function ot(n, e, t) {
  e || (e = {});
  const i = {
    props: {
      ...n.props,
      ...e.props
    },
    children: {
      ...n.children,
      ...e.children
    },
    // TODO: Chain the methods
    methods: {
      ...n.methods,
      ...e.methods
    },
    // TODO: Chain the events
    events: {
      ...n.events,
      ...e.events
    },
    messages: {
      ...n.messages,
      ...e.messages
    },
    View: e.View && e.View !== z ? e.View : n.View ? n.View : z,
    BaseView: n.View ?? z
  };
  if (n.methods && e.methods)
    for (const r in i.methods)
      Reflect.has(n.methods, r) && Reflect.has(e.methods, r) && (i.methods[r] = async (...o) => {
        const c = t(), a = c.$.__status.baseResult;
        try {
          c.$.__status.baseResult = await n.methods[r](...o), await e.methods[r](...o);
        } finally {
          c.$.__status.baseResult = a;
        }
      });
  if (n.events && e.events) {
    for (const r in i.events)
      if (Reflect.has(n.events, r) && Reflect.has(e.events, r)) {
        let o;
        r === "onPropChanging" ? o = (c, a, u) => (a = n.events[r](c, a, u), a = e.events[r](c, a, u), a) : Ce(r, i) ? o = (c, a) => (c = n.events[r](c, a), c = e.events[r](c, a), c) : o = async (...c) => {
          const a = t(), u = a.$.__status.baseResult;
          try {
            let R = await n.events[r](...c);
            return a.$.__status.baseResult = R, R = await e.events[r](...c), R;
          } finally {
            a.$.__status.baseResult = u;
          }
        }, i.events[r] = o;
      }
  }
  return e?.constr ? i.constr = async () => {
    await n.constr?.(t()), await e.constr?.(t());
  } : i.constr = n.constr, e?.init ? i.init = async () => {
    await n.init?.(t()), await e.init?.(t());
  } : i.init = n.init, e?.deinit ? i.deinit = async () => {
    await e.deinit?.(t()), await n.deinit?.(t());
  } : i.deinit = n.deinit, e?.mount ? i.mount = async () => {
    await n.mount?.(t()), await e.mount?.(t());
  } : i.mount = n.mount, e?.unmount ? i.unmount = async () => {
    await e.unmount?.(t()), await n.unmount?.(t());
  } : i.unmount = n.unmount, e?.draw ? i.draw = async () => {
    await n.draw?.(t()), await e.draw?.(t());
  } : i.draw = n.draw, e?.erase ? i.erase = async () => {
    await e.erase?.(t()), await n.erase?.(t());
  } : i.erase = n.erase, i;
}
function A(n) {
  return U(n) ? `[model #${n.birthMark()}]` : D(n) ? "[binding_rw]" : qe(n) ? "[binding_ro]" : Y(n) ? "[jsx]" : N(n) ? `[()=>jsx${n.displayName ? " " + n.displayName : ""}]` : T(n) ? `[array ${n.length}]` : f(n) ? `[funct${n.name ? " " + n.name : ""}]` : O(n) ? "[object]" : X(n) ? n.length > 32 ? `"${n.substring(0, 31)}... [${n.length}]"` : `"${n}"` : n;
}
function at(n) {
  return n instanceof Element;
}
function Y(n) {
  return $.isValidElement(n);
}
function N(n) {
  return ie(n?.$$typeof) && n.$$typeof.description === "react.memo";
}
function U(n) {
  return O(n) && Reflect.has(n, I) && O(n[I]) && Reflect.has(n, "birthMark") && f(n.birthMark) && Reflect.has(n, "fullId") && f(n.fullId) && Reflect.has(n, "htmlId") && f(n.htmlId);
}
function V(n) {
  return n.replace(/^./, n[0].toUpperCase());
}
function ct(n) {
  const e = {
    owner: n,
    cacheModel: (t) => {
      if (!t.id) {
        h(`Can't cache dynamic model=#${t.birthMark()}, "id" is empty.`, "error");
        return;
      }
      if (t.$.__owner && t.$.__owner !== e.owner) {
        h(`Can't cache dynamic model=#${t.birthMark()} because it belongs to other model=#${t.$.__owner.birthMark()}`, "error");
        return;
      }
      const i = e.getCachedModel(t.id);
      if (i) {
        i != t && h(`Can't cache dynamic model=#${t.birthMark()}. Id "${t.id}" already in cache=#${e.owner.birthMark()}.`, "error");
        return;
      }
      t.$.__owner || (t.$.__owner = e.owner);
      const r = e.owner;
      if (r[t.id])
        r[t.id] !== t && h(`Can't cache dynamic model=#${t.birthMark()}. Id "${t.id}" already exists in cache=#${e.owner.birthMark()}.`, "error");
      else if (t.$.__struct.props.cacheable) {
        if (e.owner.$.__dynamicChildrenIds.indexOf(t.id) != -1)
          throw Error(`Can't cache dynamic model=#${t.birthMark()} in cache=#${t.$.__owner.birthMark()}. Id "${t.id}" already registered.`);
        h(`cache dynamic model=#${t.birthMark()} path=${t.htmlId()} cache=#${e.owner.birthMark()}`), r[t.id] = t, e.owner.$.__dynamicChildrenIds.push(t.id), t.$.__status.cached = !0;
      }
    },
    getCachedModel: (t) => {
      const r = e.owner[t];
      if (r && !r.$.__status.cached)
        throw Error("Dynamic cache corrution");
      return r;
    }
  };
  return e;
}
const Me = $.createContext(void 0);
function Ee() {
  return $.useContext(Me);
}
function ne(n) {
  const e = {
    models: n,
    pointer: -1,
    getNextCachedModel: () => {
      if (e.pointer === e.models.length - 1 || (e.pointer++, !e.models[e.pointer]))
        return;
      const t = e.models[e.pointer];
      if (!t.$.__status.cached)
        throw Error("Static cache corrution");
      return t.cacheable || (e.models[e.pointer] = null, t.$.__status.cached = !1), t;
    },
    cacheModel: (t, i) => {
      if (i) {
        if (e.pointer >= 0 && e.pointer < e.models.length) {
          const r = e.models[e.pointer];
          r && (r.$.__status.cached = !1, r.cacheable = !1), e.models[e.pointer] = t;
        }
      } else
        e.models.push(t), e.pointer++;
      t && (t.$.__status.cached = !0);
    }
  };
  return e;
}
$.createContext(void 0);
function vt(n) {
  return (t) => {
    h(`FC begin hook=${n.name}`);
    const i = Ee();
    let r;
    if (i) {
      if (i.staticModelsTrap)
        throw Error(`Hook "${n.name}" called recursively.`);
      X(t.id) && t.id ? (r = i.getCachedModel(t.id), r ? (i.staticModelsTrap = ne(r.$.__staticChildrenCache), i.staticModelsTrap.owner = r, h(`use cached dynamic model=#${r.birthMark()} path=${r.htmlId()} cache=#${i.owner.birthMark()}`)) : i.staticModelsTrap = ne([])) : (i.staticModelsTrap = ne([]), h('Set property "id" in JSX for caching the model by the parent component.', "warn"));
    }
    const o = n(t);
    let c = !1;
    if (r) {
      if (r != o) throw Error("The cached models don't match");
      c = !0;
    } else
      r = o, !t.id && r.id === n.name && (r.id = void 0), i && r.id && r.id === t.id && (c = i.getCachedModel(r.id) === r, !c && r.cacheable && i.cacheModel(r));
    if (i?.staticModelsTrap) {
      if (r.$.__staticChildrenCache.length && i.staticModelsTrap.models.length && r.$.__staticChildrenCache != i.staticModelsTrap.models)
        throw Error("something's wrong");
      t.id && !c && (r.$.__staticChildrenCache = i.staticModelsTrap.models, y.traceLog && r.$.__staticChildrenCache.forEach((a) => {
        a && (a.$.__owner || (a.$.__owner = r), h(`cache static model=#${a.birthMark()} path=${a.htmlId()} cache=#${r.birthMark()}`));
      })), i.staticModelsTrap = void 0;
    }
    return h(`FC end hook=${n.name}`), r.View();
  };
}
window.addEventListener("unhandledrejection", (n) => {
  y.errorHandler && (n.preventDefault(), y.errorHandler(n.reason));
});
window.addEventListener("error", (n) => {
  y.errorHandler && (n.preventDefault(), y.errorHandler(n.error));
});
const y = {
  traceLog: !1,
  hashHtmlId: !1,
  modelCacheMode: "auto-cache"
};
function h(n, e = "info") {
  if (y.traceLog)
    switch (e) {
      case "warn":
        console.warn(n);
        break;
      case "error":
        console.error(n);
        break;
      default:
        console.debug(n);
    }
}
window.UECA = y;
export {
  rt as $,
  I as $name,
  _t as IF,
  ft as RenderNode,
  we as bind,
  Xe as bindProp,
  lt as clone,
  bt as defaultMessageBus,
  x as errorIf,
  mt as errorIfNot,
  vt as getFC,
  y as globalSettings,
  k as intersection,
  T as isArray,
  ut as isBoolean,
  U as isComponentModel,
  ye as isEqual,
  f as isFunction,
  Ue as isMap,
  Ye as isNull,
  dt as isNumber,
  O as isObject,
  X as isString,
  ie as isSymbol,
  b as isUndefined,
  pt as observe,
  oe as renderNode,
  gt as sleep,
  st as useComponent,
  $t as useExtendedComponent,
  et as useMessaging
};
