/* eslint-disable @typescript-eslint/camelcase */
import { Constructable, Registration, LogLevel, ILogConfig } from '@aurelia/kernel';
import { Aurelia, customElement } from '@aurelia/runtime';
import { RouterConfiguration, IRouter } from '@aurelia/router';
import { TestContext, assert } from '@aurelia/testing';

import { TestRouterConfiguration } from './_shared/configuration';
import { IHIAConfig, IHookInvocationAggregator } from './_shared/hook-invocation-tracker';
import { TestRouteViewModelBase } from './_shared/view-models';
import { hookSpecs } from './_shared/hook-spec';

async function createFixture<T extends Constructable>(
  Component: T,
  deps: Constructable[],
  createConfig: () => IHIAConfig,
  level: LogLevel = LogLevel.warn,
) {
  const config = createConfig();
  const ctx = TestContext.createHTMLTestContext();
  const { container, scheduler } = ctx;

  container.register(Registration.instance(IHIAConfig, config));
  container.register(TestRouterConfiguration.for(ctx, level));
  container.register(RouterConfiguration);
  container.register(...deps);

  const hia = container.get(IHookInvocationAggregator);
  const router = container.get(IRouter);
  const component = container.get(Component);

  const au = new Aurelia(container);
  const host = ctx.createElement('div');

  const logConfig = container.get(ILogConfig);

  au.app({ component, host });

  hia.setPhase('start');

  await au.start().wait();

  return {
    ctx,
    au,
    host,
    hia,
    component,
    scheduler,
    router,
    startTracing() {
      logConfig.level = LogLevel.trace;
    },
    stopTracing() {
      logConfig.level = level;
    },
    async tearDown() {
      assert.isSchedulerEmpty();

      hia.setPhase('stop');

      await au.stop().wait();

      assert.isSchedulerEmpty();
    },
  };
}

function getDefaultHIAConfig(): IHIAConfig {
  return {
    resolveTimeoutMs: 100,
    resolveLabels: [],
  };
}

function vp(count: number): string {
  let template = '';
  for (let i = 0; i < count; ++i) {
    template = `${template}<au-viewport name="$${i}"></au-viewport>`;
  }
  return template;
}

describe('router hooks', function () {
  describe('all synchronous', function () {
    class SyncBase extends TestRouteViewModelBase {
      public constructor(hia: IHookInvocationAggregator) {
        super(
          hia,

          hookSpecs.beforeBind.sync,
          hookSpecs.afterBind.sync,
          hookSpecs.afterAttach.sync,
          hookSpecs.afterAttachChildren.sync,

          hookSpecs.beforeDetach.sync,
          hookSpecs.beforeUnbind.sync,
          hookSpecs.afterUnbind.sync,
          hookSpecs.afterUnbindChildren.sync,

          hookSpecs.canEnter.sync,
          hookSpecs.enter.sync,
          hookSpecs.canLeave.sync,
          hookSpecs.leave.sync,
        );
      }
    }

    describe('simple cases', function () {
      @customElement({ name: 'a01', template: null })
      class A01 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a02', template: null })
      class A02 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a03', template: null })
      class A03 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a04', template: null })
      class A04 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const A0 = [A01, A02, A03, A04];

      @customElement({ name: 'root1', template: vp(1) })
      class Root1 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a11', template: vp(1) })
      class A11 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a12', template: vp(1) })
      class A12 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a13', template: vp(1) })
      class A13 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a14', template: vp(1) })
      class A14 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const A1 = [A11, A12, A13, A14];

      @customElement({ name: 'root2', template: vp(2) })
      class Root2 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a21', template: vp(2) })
      class A21 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }
      @customElement({ name: 'a22', template: vp(2) })
      class A22 extends SyncBase {
        public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
      }

      const A2 = [A21, A22];

      const A = [...A0, ...A1, ...A2];

      for (const [$1, $2, $3, $4] of [
        ['a01', 'a02', 'a01', 'a02'],
        ['a01', 'a02', 'a03', 'a01'],
        ['a01', 'a02', 'a01', 'a04'],
      ]) {
        it(`'${$1}' -> '${$2}' -> '${$3}' -> '${$4}'`, async function () {
          const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

          const t1 = `('' -> '${$1}')#1`;
          const t2 = `('${$1}' -> '${$2}')#2`;
          const t3 = `('${$2}' -> '${$3}')#3`;
          const t4 = `('${$3}' -> '${$4}')#4`;

          hia.setPhase(t1);
          await router.goto($1);

          hia.setPhase(t2);
          await router.goto($2);

          hia.setPhase(t3);
          await router.goto($3);

          hia.setPhase(t4);
          await router.goto($4);

          await tearDown();

          assert.deepStrictEqual(
            hia.notifyHistory,
            [
              `start.root1.beforeBind`,
              `start.root1.afterBind`,
              `start.root1.afterAttach`,
              `start.root1.afterAttachChildren`,

              ...getCalls[`'' -> $x`](t1, $1, true),

              ...getCalls[`$1 -> $2`](t2, $1, $2, true),

              ...getCalls[`$1 -> $2`](t3, $2, $3, true),

              ...getCalls[`$1 -> $2`](t4, $3, $4, true),

              `stop.root1.beforeDetach`,
              `stop.root1.beforeUnbind`,
              `stop.root1.afterUnbind`,

              ...getCalls[`$x -> ''`](`stop`, $4, false),

              `stop.root1.afterUnbindChildren`,
            ],
          );

          hia.dispose();
        });
      }

      for (const [[$1$0, $1$1], [$2$0, $2$1]] of [
        // Only $0 changes with every nav
        [['a01', 'a02'], ['a03', 'a02']],
        [[''   , 'a02'], ['a03', 'a02']],
        [['a01', 'a02'], [''   , 'a02']],

        [['a01', 'a02'], ['a02', 'a02']],
        [[''   , 'a02'], ['a02', 'a02']],
        [['a01', 'a02'], [''   , 'a02']],

        [['a02', 'a02'], ['a01', 'a02']],
        [[''   , 'a02'], ['a01', 'a02']],
        [['a02', 'a02'], [''   , 'a02']],
        // Only $1 changes with every nav
        [['a01', 'a02'], ['a01', 'a03']],
        [['a01', ''   ], ['a01', 'a03']],
        [['a01', 'a02'], ['a01', ''   ]],

        [['a01', 'a02'], ['a01', 'a01']],
        [['a01', ''   ], ['a01', 'a01']],
        [['a01', 'a02'], ['a01', ''   ]],

        [['a01', 'a01'], ['a01', 'a02']],
        [['a01', ''   ], ['a01', 'a02']],
        [['a01', 'a01'], ['a01', ''   ]],
        // Both $0 and $1 change with every nav
        [['a01', 'a02'], ['a03', 'a04']],
        [[''   , 'a02'], ['a03', 'a04']],
        [['a01', ''   ], ['a03', 'a04']],
        [['a01', 'a02'], [''   , 'a04']],
        [['a01', 'a02'], ['a03', ''   ]],

        [['a01', 'a02'], ['a02', 'a01']],
        [[''   , 'a02'], ['a02', 'a01']],
        [['a01', ''   ], ['a02', 'a01']],
        [['a01', 'a02'], [''   , 'a01']],
        [['a01', 'a02'], ['a02', ''   ]],

        [['a01', 'a02'], ['a04', 'a01']],
        [[''   , 'a02'], ['a04', 'a01']],
        [['a01', ''   ], ['a04', 'a01']],
        [['a01', 'a02'], [''   , 'a01']],
        [['a01', 'a02'], ['a04', ''   ]],
      ]) {
        const $1 = join('+', `${$1$0}@$0`, `${$1$1}@$1`);
        const $2 = join('+', `${$2$0}@$0`, `${$2$1}@$1`);
        it(`${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
          const { router, hia, tearDown } = await createFixture(Root2, A, getDefaultHIAConfig);

          const t1 = `('' -> '${$1}')#1`;
          const t2 = `('${$1}' -> '${$2}')#2`;
          const t3 = `('${$2}' -> '${$1}')#3`;
          const t4 = `('${$1}' -> '${$2}')#4`;

          hia.setPhase(t1);
          await router.goto($1);

          hia.setPhase(t2);
          await router.goto($2);

          hia.setPhase(t3);
          await router.goto($1);

          hia.setPhase(t4);
          await router.goto($2);

          await tearDown();

          assert.deepStrictEqual(
            hia.notifyHistory,
            [
              `start.root2.beforeBind`,
              `start.root2.afterBind`,
              `start.root2.afterAttach`,
              `start.root2.afterAttachChildren`,

              ...getCalls[`'' -> $x$0+$x$1`](t1, $1$0, $1$1, true),

              ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t2, $1$0, $1$1, $2$0, $2$1, true),

              ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t3, $2$0, $2$1, $1$0, $1$1, true),

              ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t4, $1$0, $1$1, $2$0, $2$1, true),

              `stop.root2.beforeDetach`,
              `stop.root2.beforeUnbind`,
              `stop.root2.afterUnbind`,

              ...getCalls[`$x$0+$x$1 -> ''`](`stop`, $2$0, $2$1, false),

              `stop.root2.afterUnbindChildren`,
            ],
          );

          hia.dispose();
        });
      }

      for (const [[$1p, $1c], [$2p, $2c]] of [
        // Only parent changes with every nav
        [['a11', 'a12'], ['a13', 'a12']],
        [['a11', 'a12'], ['a12', 'a12']],
        [['a12', 'a12'], ['a11', 'a12']],
        // Only child changes with every nav
        [['a11', 'a01'], ['a11', 'a02']],
        [['a11', ''   ], ['a11', 'a02']],
        [['a11', 'a01'], ['a11', ''   ]],

        [['a11', 'a11'], ['a11', 'a02']],
        [['a11', 'a11'], ['a11', ''   ]],

        [['a11', 'a01'], ['a11', 'a11']],
        [['a11', ''   ], ['a11', 'a11']],
        // Both parent and child change with every nav
        [['a11', 'a01'], ['a12', 'a02']],
        [['a11', ''   ], ['a12', 'a02']],
        [['a11', 'a01'], ['a12', ''   ]],

        [['a11', 'a11'], ['a12', 'a02']],
        [['a11', 'a11'], ['a12', 'a12']],
        [['a11', 'a11'], ['a12', ''   ]],

        [['a12', 'a02'], ['a11', 'a11']],
        [['a12', 'a12'], ['a11', 'a11']],
        [['a12', ''   ], ['a11', 'a11']],

        [['a11', 'a12'], ['a13', 'a14']],
        [['a11', 'a12'], ['a13', 'a11']],

        [['a13', 'a14'], ['a11', 'a12']],
        [['a13', 'a11'], ['a11', 'a12']],
      ]) {
        const $1 = join('/', $1p, $1c);
        const $2 = join('/', $2p, $2c);
        it(`'${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
          const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

          const t1 = `('' -> '${$1}')#1`;
          const t2 = `('${$1}' -> '${$2}')#2`;
          const t3 = `('${$2}' -> '${$1}')#3`;
          const t4 = `('${$1}' -> '${$2}')#4`;

          hia.setPhase(t1);
          await router.goto($1);

          hia.setPhase(t2);
          await router.goto($2);

          hia.setPhase(t3);
          await router.goto($1);

          hia.setPhase(t4);
          await router.goto($2);

          await tearDown();

          assert.deepStrictEqual(
            hia.notifyHistory,
            [
              `start.root1.beforeBind`,
              `start.root1.afterBind`,
              `start.root1.afterAttach`,
              `start.root1.afterAttachChildren`,

              ...getCalls[`'' -> $x$p/$x$c`](t1, $1p, $1c, true),

              ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t2, $1p, $1c, $2p, $2c, true),

              ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t3, $2p, $2c, $1p, $1c, true),

              ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t4, $1p, $1c, $2p, $2c, true),

              `stop.root1.beforeDetach`,
              `stop.root1.beforeUnbind`,
              `stop.root1.afterUnbind`,

              ...getCalls[`$x$p/$x$c -> ''`](`stop`, $2p, $2c, false),

              `stop.root1.afterUnbindChildren`,
            ],
          );

          hia.dispose();
        });
      }
    });

    const getCalls = {
      [`$x -> ''`](
        prefix: string,
        $x: string,
        routerHooks: boolean,
      ): string[] {
        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x}.canLeave`,
            `${prefix}.${$x}.leave`,
          ]),
          `${prefix}.${$x}.beforeDetach`,
          `${prefix}.${$x}.beforeUnbind`,
          `${prefix}.${$x}.afterUnbind`,
          `${prefix}.${$x}.afterUnbindChildren`,
        ];
      },
      [`'' -> $x`](
        prefix: string,
        $x: string,
        routerHooks: boolean,
      ): string[] {
        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x}.canEnter`,
            `${prefix}.${$x}.enter`,
          ]),
          `${prefix}.${$x}.beforeBind`,
          `${prefix}.${$x}.afterBind`,
          `${prefix}.${$x}.afterAttach`,
          `${prefix}.${$x}.afterAttachChildren`,
        ];
      },
      [`$1 -> $2`](
        prefix: string,
        $1: string,
        $2: string,
        routerHooks: boolean,
      ): string[] {
        if ($1 === '') {
          return getCalls[`'' -> $x`](prefix, $2, routerHooks);
        }

        if ($2 === '') {
          return getCalls[`$x -> ''`](prefix, $1, routerHooks);
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$1}.canLeave`,
            `${prefix}.${$2}.canEnter`,
            `${prefix}.${$1}.leave`,
            `${prefix}.${$2}.enter`,
          ]),
          `${prefix}.${$2}.beforeBind`,
          `${prefix}.${$2}.afterBind`,
          `${prefix}.${$2}.afterAttach`,
          `${prefix}.${$2}.afterAttachChildren`,
          `${prefix}.${$1}.beforeDetach`,
          `${prefix}.${$1}.beforeUnbind`,
          `${prefix}.${$1}.afterUnbind`,
          `${prefix}.${$1}.afterUnbindChildren`,
        ];
      },
      [`'' -> $x$0+$x$1`](
        prefix: string,
        $x$0: string,
        $x$1: string,
        routerHooks: boolean,
      ): string[] {
        if ($x$0 === '') {
          return getCalls[`'' -> $x`](prefix, $x$1, routerHooks);
        }

        if ($x$1 === '') {
          return getCalls[`'' -> $x`](prefix, $x$0, routerHooks);
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x$0}.canEnter`,
            `${prefix}.${$x$1}.canEnter`,
            `${prefix}.${$x$0}.enter`,
            `${prefix}.${$x$1}.enter`,
          ]),
          `${prefix}.${$x$0}.beforeBind`,
          `${prefix}.${$x$0}.afterBind`,
          `${prefix}.${$x$0}.afterAttach`,
          `${prefix}.${$x$0}.afterAttachChildren`,
          `${prefix}.${$x$1}.beforeBind`,
          `${prefix}.${$x$1}.afterBind`,
          `${prefix}.${$x$1}.afterAttach`,
          `${prefix}.${$x$1}.afterAttachChildren`,
        ];
      },
      [`$x$0+$x$1 -> ''`](
        prefix: string,
        $x$0: string,
        $x$1: string,
        routerHooks: boolean,
      ): string[] {
        if ($x$0 === '') {
          return getCalls[`$x -> ''`](prefix, $x$1, routerHooks);
        }

        if ($x$1 === '') {
          return getCalls[`$x -> ''`](prefix, $x$0, routerHooks);
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x$0}.canLeave`,
            `${prefix}.${$x$1}.canLeave`,
            `${prefix}.${$x$0}.leave`,
            `${prefix}.${$x$1}.leave`,
          ]),
          ...addIf(routerHooks, [
            `${prefix}.${$x$0}.beforeDetach`,
            `${prefix}.${$x$0}.beforeUnbind`,
            `${prefix}.${$x$0}.afterUnbind`,
            `${prefix}.${$x$0}.afterUnbindChildren`,
            `${prefix}.${$x$1}.beforeDetach`,
            `${prefix}.${$x$1}.beforeUnbind`,
            `${prefix}.${$x$1}.afterUnbind`,
            `${prefix}.${$x$1}.afterUnbindChildren`,
          ], [
            `${prefix}.${$x$0}.beforeDetach`,
            `${prefix}.${$x$0}.beforeUnbind`,
            `${prefix}.${$x$0}.afterUnbind`,
            `${prefix}.${$x$1}.beforeDetach`,
            `${prefix}.${$x$1}.beforeUnbind`,
            `${prefix}.${$x$1}.afterUnbind`,
            `${prefix}.${$x$0}.afterUnbindChildren`,
            `${prefix}.${$x$1}.afterUnbindChildren`,
          ]),
        ];
      },
      [`$1$0+$1$1 -> $2$0+$2$1`](
        prefix: string,
        $1$0: string,
        $1$1: string,
        $2$0: string,
        $2$1: string,
        routerHooks: boolean,
      ): string[] {
        if ($1$0 === $2$0) {
          return getCalls[`$1 -> $2`](prefix, $1$1, $2$1, routerHooks);
        }

        if ($1$1 === $2$1) {
          return getCalls[`$1 -> $2`](prefix, $1$0, $2$0, routerHooks);
        }

        if ($1$0 === '') {
          if ($1$1 === '') {
            return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $2$1, routerHooks);
          }
          if ($2$1 === '') {
            return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $1$1, routerHooks);
          }
          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$1}.canLeave`,
              `${prefix}.${$2$0}.canEnter`,
              `${prefix}.${$2$1}.canEnter`,
              `${prefix}.${$1$1}.leave`,
              `${prefix}.${$2$0}.enter`,
              `${prefix}.${$2$1}.enter`,
            ]),
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
          ];
        }

        if ($1$1 === '') {
          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$0}.canLeave`,
              `${prefix}.${$2$0}.canEnter`,
              `${prefix}.${$2$1}.canEnter`,
              `${prefix}.${$1$0}.leave`,
              `${prefix}.${$2$0}.enter`,
              `${prefix}.${$2$1}.enter`,
            ]),
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
          ];
        }

        if ($2$0 === '') {
          if ($1$1 === '') {
            return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $2$1, routerHooks);
          }
          if ($2$1 === '') {
            return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $1$1, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$0}.canLeave`,
              `${prefix}.${$1$1}.canLeave`,
              `${prefix}.${$2$1}.canEnter`,
              `${prefix}.${$1$0}.leave`,
              `${prefix}.${$1$1}.leave`,
              `${prefix}.${$2$1}.enter`,
            ]),
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
          ];
        }

        if ($2$1 === '') {
          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$0}.canLeave`,
              `${prefix}.${$1$1}.canLeave`,
              `${prefix}.${$2$0}.canEnter`,
              `${prefix}.${$1$0}.leave`,
              `${prefix}.${$1$1}.leave`,
              `${prefix}.${$2$0}.enter`,
            ]),
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
          ];
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$1$0}.canLeave`,
            `${prefix}.${$1$1}.canLeave`,
            `${prefix}.${$2$0}.canEnter`,
            `${prefix}.${$2$1}.canEnter`,
            `${prefix}.${$1$0}.leave`,
            `${prefix}.${$1$1}.leave`,
            `${prefix}.${$2$0}.enter`,
            `${prefix}.${$2$1}.enter`,
          ]),
          `${prefix}.${$2$0}.beforeBind`,
          `${prefix}.${$2$0}.afterBind`,
          `${prefix}.${$2$0}.afterAttach`,
          `${prefix}.${$2$0}.afterAttachChildren`,
          `${prefix}.${$1$0}.beforeDetach`,
          `${prefix}.${$1$0}.beforeUnbind`,
          `${prefix}.${$1$0}.afterUnbind`,
          `${prefix}.${$1$0}.afterUnbindChildren`,
          `${prefix}.${$2$1}.beforeBind`,
          `${prefix}.${$2$1}.afterBind`,
          `${prefix}.${$2$1}.afterAttach`,
          `${prefix}.${$2$1}.afterAttachChildren`,
          `${prefix}.${$1$1}.beforeDetach`,
          `${prefix}.${$1$1}.beforeUnbind`,
          `${prefix}.${$1$1}.afterUnbind`,
          `${prefix}.${$1$1}.afterUnbindChildren`,
        ];
      },
      [`'' -> $x$p/$x$c`](
        prefix: string,
        $x$p: string,
        $x$c: string,
        routerHooks: boolean,
      ): string[] {
        if ($x$c === '') {
          return getCalls[`'' -> $x`](prefix, $x$p, routerHooks);
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x$p}.canEnter`,
            `${prefix}.${$x$p}.enter`,
          ]),
          `${prefix}.${$x$p}.beforeBind`,
          `${prefix}.${$x$p}.afterBind`,
          `${prefix}.${$x$p}.afterAttach`,
          `${prefix}.${$x$p}.afterAttachChildren`,
          ...addIf(routerHooks, [
            `${prefix}.${$x$c}.canEnter`,
            `${prefix}.${$x$c}.enter`,
          ]),
          `${prefix}.${$x$c}.beforeBind`,
          `${prefix}.${$x$c}.afterBind`,
          `${prefix}.${$x$c}.afterAttach`,
          `${prefix}.${$x$c}.afterAttachChildren`,
        ];
      },
      [`$x$p/$x$c -> ''`](
        prefix: string,
        $x$p: string,
        $x$c: string,
        routerHooks: boolean,
      ): string[] {
        if ($x$c === '') {
          return getCalls[`$x -> ''`](prefix, $x$p, routerHooks);
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$x$p}.canLeave`,
            `${prefix}.${$x$c}.canLeave`,
            `${prefix}.${$x$p}.leave`,
            `${prefix}.${$x$c}.leave`,
          ]),
          `${prefix}.${$x$p}.beforeDetach`,
          `${prefix}.${$x$p}.beforeUnbind`,
          `${prefix}.${$x$p}.afterUnbind`,
          `${prefix}.${$x$c}.beforeDetach`,
          `${prefix}.${$x$c}.beforeUnbind`,
          `${prefix}.${$x$c}.afterUnbind`,
          `${prefix}.${$x$c}.afterUnbindChildren`,
          `${prefix}.${$x$p}.afterUnbindChildren`,
        ];
      },
      [`$1$p/$1$c -> $2$p/$2$c`](
        prefix: string,
        $1$p: string,
        $1$c: string,
        $2$p: string,
        $2$c: string,
        routerHooks: boolean,
      ): string[] {
        if ($1$p === $2$p) {
          return getCalls[`$1 -> $2`](prefix, $1$c, $2$c, routerHooks);
        }

        if ($1$c === '') {
          if ($2$c === '') {
            return getCalls[`$1 -> $2`](prefix, $1$p, $2$p, routerHooks);
          }

          if ($1$p === '') {
            return getCalls[`'' -> $x$p/$x$c`](prefix, $2$p, $2$c, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$p}.canLeave`,
              `${prefix}.${$2$p}.canEnter`,
              `${prefix}.${$1$p}.leave`,
              `${prefix}.${$2$p}.enter`,
            ]),
            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            ...addIf(routerHooks, [
              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,
            ]),
            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
          ];
        }

        if ($2$c === '') {
          if ($2$p === '') {
            return getCalls[`$x$p/$x$c -> ''`](prefix, $1$p, $1$c, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$p}.canLeave`,
              `${prefix}.${$1$c}.canLeave`,
              `${prefix}.${$2$p}.canEnter`,
              `${prefix}.${$1$p}.leave`,
              `${prefix}.${$1$c}.leave`,
              `${prefix}.${$2$p}.enter`,
            ]),
            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$c}.beforeDetach`,
            `${prefix}.${$1$c}.beforeUnbind`,
            `${prefix}.${$1$c}.afterUnbind`,
            `${prefix}.${$1$c}.afterUnbindChildren`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
          ];
        }

        return [
          ...addIf(routerHooks, [
            `${prefix}.${$1$p}.canLeave`,
            `${prefix}.${$1$c}.canLeave`,
            `${prefix}.${$2$p}.canEnter`,
            `${prefix}.${$1$p}.leave`,
            `${prefix}.${$1$c}.leave`,
            `${prefix}.${$2$p}.enter`,
          ]),
          `${prefix}.${$2$p}.beforeBind`,
          `${prefix}.${$2$p}.afterBind`,
          `${prefix}.${$2$p}.afterAttach`,
          `${prefix}.${$2$p}.afterAttachChildren`,
          `${prefix}.${$1$p}.beforeDetach`,
          `${prefix}.${$1$p}.beforeUnbind`,
          `${prefix}.${$1$p}.afterUnbind`,
          `${prefix}.${$1$c}.beforeDetach`,
          `${prefix}.${$1$c}.beforeUnbind`,
          `${prefix}.${$1$c}.afterUnbind`,
          `${prefix}.${$1$c}.afterUnbindChildren`,
          `${prefix}.${$1$p}.afterUnbindChildren`,
          ...addIf(routerHooks, [
            `${prefix}.${$2$c}.canEnter`,
            `${prefix}.${$2$c}.enter`,
          ]),
          `${prefix}.${$2$c}.beforeBind`,
          `${prefix}.${$2$c}.afterBind`,
          `${prefix}.${$2$c}.afterAttach`,
          `${prefix}.${$2$c}.afterAttachChildren`,
        ];
      },
    };
  });

  const asyncTimingKeys = [
    'async',
    'setTimeout_0',

    'yieldDelayedMicroTask_1',
    'yieldAsyncMicroTask_1',
  ] as const;

  for (const asyncTimingKey of asyncTimingKeys) {
    describe(`all ${asyncTimingKey}`, function () {
      describe('simple cases', function () {
        class AsyncBase extends TestRouteViewModelBase {
          public constructor(hia: IHookInvocationAggregator) {
            super(
              hia,

              hookSpecs.beforeBind[asyncTimingKey],
              hookSpecs.afterBind[asyncTimingKey],
              hookSpecs.afterAttach[asyncTimingKey],
              hookSpecs.afterAttachChildren[asyncTimingKey],

              hookSpecs.beforeDetach[asyncTimingKey],
              hookSpecs.beforeUnbind[asyncTimingKey],
              hookSpecs.afterUnbind[asyncTimingKey],
              hookSpecs.afterUnbindChildren[asyncTimingKey],

              hookSpecs.canEnter[asyncTimingKey],
              hookSpecs.enter[asyncTimingKey],
              hookSpecs.canLeave[asyncTimingKey],
              hookSpecs.leave[asyncTimingKey],
            );
          }
        }

        @customElement({ name: 'a01', template: null })
        class A01 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a02', template: null })
        class A02 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a03', template: null })
        class A03 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a04', template: null })
        class A04 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }

        const A0 = [A01, A02, A03, A04];

        @customElement({ name: 'root1', template: vp(1) })
        class Root1 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a11', template: vp(1) })
        class A11 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a12', template: vp(1) })
        class A12 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a13', template: vp(1) })
        class A13 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a14', template: vp(1) })
        class A14 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }

        const A1 = [A11, A12, A13, A14];

        @customElement({ name: 'root2', template: vp(2) })
        class Root2 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a21', template: vp(2) })
        class A21 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }
        @customElement({ name: 'a22', template: vp(2) })
        class A22 extends AsyncBase {
          public constructor(@IHookInvocationAggregator hia: IHookInvocationAggregator) { super(hia); }
        }

        const A2 = [A21, A22];

        const A = [...A0, ...A1, ...A2];

        for (const [$1, $2, $3, $4] of [
          ['a01', 'a02', 'a01', 'a02'],
          ['a01', 'a02', 'a03', 'a01'],
          ['a01', 'a02', 'a01', 'a04'],
        ]) {
          it(`'${$1}' -> '${$2}' -> '${$3}' -> '${$4}'`, async function () {
            const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

            const t1 = `('' -> '${$1}')#1`;
            const t2 = `('${$1}' -> '${$2}')#2`;
            const t3 = `('${$2}' -> '${$3}')#3`;
            const t4 = `('${$3}' -> '${$4}')#4`;

            hia.setPhase(t1);
            await router.goto($1);

            hia.setPhase(t2);
            await router.goto($2);

            hia.setPhase(t3);
            await router.goto($3);

            hia.setPhase(t4);
            await router.goto($4);

            await tearDown();

            assert.deepStrictEqual(
              hia.notifyHistory,
              [
                `start.root1.beforeBind`,
                `start.root1.afterBind`,
                `start.root1.afterAttach`,
                `start.root1.afterAttachChildren`,

                ...getCalls[`'' -> $x`](t1, $1, true),

                ...getCalls[`$1 -> $2`](t2, $1, $2, true),

                ...getCalls[`$1 -> $2`](t3, $2, $3, true),

                ...getCalls[`$1 -> $2`](t4, $3, $4, true),

                `stop.root1.beforeDetach`,
                `stop.root1.beforeUnbind`,
                `stop.root1.afterUnbind`,

                ...getCalls[`$x -> ''`](`stop`, $4, false),

                `stop.root1.afterUnbindChildren`,
              ],
            );

            hia.dispose();
          });
        }

        for (const [[$1$0, $1$1], [$2$0, $2$1]] of [
          // Only $0 changes with every nav
          [['a01', 'a02'], ['a03', 'a02']],
          [[''   , 'a02'], ['a03', 'a02']],
          [['a01', 'a02'], [''   , 'a02']],

          [['a01', 'a02'], ['a02', 'a02']],
          [[''   , 'a02'], ['a02', 'a02']],
          [['a01', 'a02'], [''   , 'a02']],

          [['a02', 'a02'], ['a01', 'a02']],
          [[''   , 'a02'], ['a01', 'a02']],
          [['a02', 'a02'], [''   , 'a02']],
          // Only $1 changes with every nav
          [['a01', 'a02'], ['a01', 'a03']],
          [['a01', ''   ], ['a01', 'a03']],
          [['a01', 'a02'], ['a01', ''   ]],

          [['a01', 'a02'], ['a01', 'a01']],
          [['a01', ''   ], ['a01', 'a01']],
          [['a01', 'a02'], ['a01', ''   ]],

          [['a01', 'a01'], ['a01', 'a02']],
          [['a01', ''   ], ['a01', 'a02']],
          [['a01', 'a01'], ['a01', ''   ]],
          // Both $0 and $1 change with every nav
          [['a01', 'a02'], ['a03', 'a04']],
          [[''   , 'a02'], ['a03', 'a04']],
          [['a01', ''   ], ['a03', 'a04']],
          [['a01', 'a02'], [''   , 'a04']],
          [['a01', 'a02'], ['a03', ''   ]],

          [['a01', 'a02'], ['a02', 'a01']],
          [[''   , 'a02'], ['a02', 'a01']],
          [['a01', ''   ], ['a02', 'a01']],
          [['a01', 'a02'], [''   , 'a01']],
          [['a01', 'a02'], ['a02', ''   ]],

          [['a01', 'a02'], ['a04', 'a01']],
          [[''   , 'a02'], ['a04', 'a01']],
          [['a01', ''   ], ['a04', 'a01']],
          [['a01', 'a02'], [''   , 'a01']],
          [['a01', 'a02'], ['a04', ''   ]],
        ]) {
          const $1 = join('+', `${$1$0}@$0`, `${$1$1}@$1`);
          const $2 = join('+', `${$2$0}@$0`, `${$2$1}@$1`);
          it(`${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
            const { router, hia, tearDown } = await createFixture(Root2, A, getDefaultHIAConfig);

            const t1 = `('' -> '${$1}')#1`;
            const t2 = `('${$1}' -> '${$2}')#2`;
            const t3 = `('${$2}' -> '${$1}')#3`;
            const t4 = `('${$1}' -> '${$2}')#4`;

            hia.setPhase(t1);
            await router.goto($1);

            hia.setPhase(t2);
            await router.goto($2);

            hia.setPhase(t3);
            await router.goto($1);

            hia.setPhase(t4);
            await router.goto($2);

            await tearDown();

            assert.deepStrictEqual(
              hia.notifyHistory,
              [
                `start.root2.beforeBind`,
                `start.root2.afterBind`,
                `start.root2.afterAttach`,
                `start.root2.afterAttachChildren`,

                ...getCalls[`'' -> $x$0+$x$1`](t1, $1$0, $1$1, true),

                ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t2, $1$0, $1$1, $2$0, $2$1, true),

                ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t3, $2$0, $2$1, $1$0, $1$1, true),

                ...getCalls[`$1$0+$1$1 -> $2$0+$2$1`](t4, $1$0, $1$1, $2$0, $2$1, true),

                `stop.root2.beforeDetach`,
                `stop.root2.beforeUnbind`,
                `stop.root2.afterUnbind`,

                ...getCalls[`$x$0+$x$1 -> ''`](`stop`, $2$0, $2$1, false),

                `stop.root2.afterUnbindChildren`,
              ],
            );

            hia.dispose();
          });
        }

        for (const [[$1p, $1c], [$2p, $2c]] of [
          // Only parent changes with every nav
          [['a11', 'a12'], ['a13', 'a12']],
          [['a11', 'a12'], ['a12', 'a12']],
          [['a12', 'a12'], ['a11', 'a12']],
          // Only child changes with every nav
          [['a11', 'a01'], ['a11', 'a02']],
          [['a11', ''   ], ['a11', 'a02']],
          [['a11', 'a01'], ['a11', ''   ]],

          [['a11', 'a11'], ['a11', 'a02']],
          [['a11', 'a11'], ['a11', ''   ]],

          [['a11', 'a01'], ['a11', 'a11']],
          [['a11', ''   ], ['a11', 'a11']],
          // Both parent and child change with every nav
          [['a11', 'a01'], ['a12', 'a02']],
          [['a11', ''   ], ['a12', 'a02']],
          [['a11', 'a01'], ['a12', ''   ]],

          [['a11', 'a11'], ['a12', 'a02']],
          [['a11', 'a11'], ['a12', 'a12']],
          [['a11', 'a11'], ['a12', ''   ]],

          [['a12', 'a02'], ['a11', 'a11']],
          [['a12', 'a12'], ['a11', 'a11']],
          [['a12', ''   ], ['a11', 'a11']],

          [['a11', 'a12'], ['a13', 'a14']],
          [['a11', 'a12'], ['a13', 'a11']],

          [['a13', 'a14'], ['a11', 'a12']],
          [['a13', 'a11'], ['a11', 'a12']],
        ]) {
          const $1 = join('/', $1p, $1c);
          const $2 = join('/', $2p, $2c);
          it(`'${$1}' -> '${$2}' -> '${$1}' -> '${$2}'`, async function () {
            const { router, hia, tearDown } = await createFixture(Root1, A, getDefaultHIAConfig);

            const t1 = `('' -> '${$1}')#1`;
            const t2 = `('${$1}' -> '${$2}')#2`;
            const t3 = `('${$2}' -> '${$1}')#3`;
            const t4 = `('${$1}' -> '${$2}')#4`;

            hia.setPhase(t1);
            await router.goto($1);

            hia.setPhase(t2);
            await router.goto($2);

            hia.setPhase(t3);
            await router.goto($1);

            hia.setPhase(t4);
            await router.goto($2);

            await tearDown();

            assert.deepStrictEqual(
              hia.notifyHistory,
              [
                `start.root1.beforeBind`,
                `start.root1.afterBind`,
                `start.root1.afterAttach`,
                `start.root1.afterAttachChildren`,

                ...getCalls[`'' -> $x$p/$x$c`](t1, $1p, $1c, true),

                ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t2, $1p, $1c, $2p, $2c, true),

                ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t3, $2p, $2c, $1p, $1c, true),

                ...getCalls[`$1$p/$1$c -> $2$p/$2$c`](t4, $1p, $1c, $2p, $2c, true),

                `stop.root1.beforeDetach`,
                `stop.root1.beforeUnbind`,
                `stop.root1.afterUnbind`,

                ...getCalls[`$x$p/$x$c -> ''`](`stop`, $2p, $2c, false),

                `stop.root1.afterUnbindChildren`,
              ],
            );

            hia.dispose();
          });
        }
      });

      const getCalls = {
        [`$x -> ''`](
          prefix: string,
          $x: string,
          routerHooks: boolean,
        ): string[] {
          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x}.canLeave`,
              `${prefix}.${$x}.leave`,
            ]),
            `${prefix}.${$x}.beforeDetach`,
            `${prefix}.${$x}.beforeUnbind`,
            `${prefix}.${$x}.afterUnbind`,
            `${prefix}.${$x}.afterUnbindChildren`,
          ];
        },
        [`'' -> $x`](
          prefix: string,
          $x: string,
          routerHooks: boolean,
        ): string[] {
          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x}.canEnter`,
              `${prefix}.${$x}.enter`,
            ]),
            `${prefix}.${$x}.beforeBind`,
            `${prefix}.${$x}.afterBind`,
            `${prefix}.${$x}.afterAttach`,
            `${prefix}.${$x}.afterAttachChildren`,
          ];
        },
        [`$1 -> $2`](
          prefix: string,
          $1: string,
          $2: string,
          routerHooks: boolean,
        ): string[] {
          if ($1 === '') {
            return getCalls[`'' -> $x`](prefix, $2, routerHooks);
          }

          if ($2 === '') {
            return getCalls[`$x -> ''`](prefix, $1, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1}.canLeave`,
              `${prefix}.${$2}.canEnter`,
              `${prefix}.${$1}.leave`,
              `${prefix}.${$2}.enter`,
            ]),
            `${prefix}.${$2}.beforeBind`,
            `${prefix}.${$2}.afterBind`,
            `${prefix}.${$2}.afterAttach`,
            `${prefix}.${$2}.afterAttachChildren`,
            `${prefix}.${$1}.beforeDetach`,
            `${prefix}.${$1}.beforeUnbind`,
            `${prefix}.${$1}.afterUnbind`,
            `${prefix}.${$1}.afterUnbindChildren`,
          ];
        },
        [`'' -> $x$0+$x$1`](
          prefix: string,
          $x$0: string,
          $x$1: string,
          routerHooks: boolean,
        ): string[] {
          if ($x$0 === '') {
            return getCalls[`'' -> $x`](prefix, $x$1, routerHooks);
          }

          if ($x$1 === '') {
            return getCalls[`'' -> $x`](prefix, $x$0, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x$0}.canEnter`,
              `${prefix}.${$x$1}.canEnter`,
              `${prefix}.${$x$0}.enter`,
              `${prefix}.${$x$1}.enter`,
            ]),
            `${prefix}.${$x$0}.beforeBind`,
            `${prefix}.${$x$1}.beforeBind`,
            `${prefix}.${$x$0}.afterBind`,
            `${prefix}.${$x$1}.afterBind`,
            `${prefix}.${$x$0}.afterAttach`,
            `${prefix}.${$x$1}.afterAttach`,
            `${prefix}.${$x$0}.afterAttachChildren`,
            `${prefix}.${$x$1}.afterAttachChildren`,
          ];
        },
        [`$x$0+$x$1 -> ''`](
          prefix: string,
          $x$0: string,
          $x$1: string,
          routerHooks: boolean,
        ): string[] {
          if ($x$0 === '') {
            return getCalls[`$x -> ''`](prefix, $x$1, routerHooks);
          }

          if ($x$1 === '') {
            return getCalls[`$x -> ''`](prefix, $x$0, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x$0}.canLeave`,
              `${prefix}.${$x$1}.canLeave`,
              `${prefix}.${$x$0}.leave`,
              `${prefix}.${$x$1}.leave`,
            ]),
            ...addIf(routerHooks, [
              `${prefix}.${$x$0}.beforeDetach`,
              `${prefix}.${$x$0}.beforeUnbind`,
              `${prefix}.${$x$0}.afterUnbind`,
              `${prefix}.${$x$0}.afterUnbindChildren`,
              `${prefix}.${$x$1}.beforeDetach`,
              `${prefix}.${$x$1}.beforeUnbind`,
              `${prefix}.${$x$1}.afterUnbind`,
              `${prefix}.${$x$1}.afterUnbindChildren`,
            ], [
              `${prefix}.${$x$0}.beforeDetach`,
              `${prefix}.${$x$1}.beforeDetach`,
              `${prefix}.${$x$0}.beforeUnbind`,
              `${prefix}.${$x$1}.beforeUnbind`,
              `${prefix}.${$x$0}.afterUnbind`,
              `${prefix}.${$x$1}.afterUnbind`,
              `${prefix}.${$x$0}.afterUnbindChildren`,
              `${prefix}.${$x$1}.afterUnbindChildren`,
            ]),
          ];
        },
        [`$1$0+$1$1 -> $2$0+$2$1`](
          prefix: string,
          $1$0: string,
          $1$1: string,
          $2$0: string,
          $2$1: string,
          routerHooks: boolean,
        ): string[] {
          if ($1$0 === $2$0) {
            return getCalls[`$1 -> $2`](prefix, $1$1, $2$1, routerHooks);
          }

          if ($1$1 === $2$1) {
            return getCalls[`$1 -> $2`](prefix, $1$0, $2$0, routerHooks);
          }

          if ($1$0 === '') {
            if ($1$1 === '') {
              return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $2$1, routerHooks);
            }
            if ($2$1 === '') {
              return getCalls[`'' -> $x$0+$x$1`](prefix, $2$0, $1$1, routerHooks);
            }
            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$1}.canLeave`,
                `${prefix}.${$2$0}.canEnter`,
                `${prefix}.${$2$1}.canEnter`,
                `${prefix}.${$1$1}.leave`,
                `${prefix}.${$2$0}.enter`,
                `${prefix}.${$2$1}.enter`,
              ]),
              `${prefix}.${$2$1}.beforeBind`, // TODO: fix this in router ($2$1 and $2$0 should be other way around)
              `${prefix}.${$2$0}.beforeBind`,
              `${prefix}.${$2$1}.afterBind`, // TODO: fix this in router ($2$1 and $2$0 should be other way around)
              `${prefix}.${$2$0}.afterBind`,
              `${prefix}.${$2$1}.afterAttach`, // TODO: fix this in router ($2$1 and $2$0 should be other way around)
              `${prefix}.${$2$0}.afterAttach`,
              `${prefix}.${$2$1}.afterAttachChildren`, // TODO: fix this in router ($2$1 and $2$0 should be other way around)
              `${prefix}.${$2$0}.afterAttachChildren`,
              `${prefix}.${$1$1}.beforeDetach`,
              `${prefix}.${$1$1}.beforeUnbind`,
              `${prefix}.${$1$1}.afterUnbind`,
              `${prefix}.${$1$1}.afterUnbindChildren`,
            ];
          }

          if ($1$1 === '') {
            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$0}.canLeave`,
                `${prefix}.${$2$0}.canEnter`,
                `${prefix}.${$2$1}.canEnter`,
                `${prefix}.${$1$0}.leave`,
                `${prefix}.${$2$0}.enter`,
                `${prefix}.${$2$1}.enter`,
              ]),
              `${prefix}.${$2$0}.beforeBind`,
              `${prefix}.${$2$1}.beforeBind`,
              `${prefix}.${$2$0}.afterBind`,
              `${prefix}.${$2$1}.afterBind`,
              `${prefix}.${$2$0}.afterAttach`,
              `${prefix}.${$2$1}.afterAttach`,
              `${prefix}.${$2$0}.afterAttachChildren`,
              `${prefix}.${$2$1}.afterAttachChildren`,
              `${prefix}.${$1$0}.beforeDetach`,
              `${prefix}.${$1$0}.beforeUnbind`,
              `${prefix}.${$1$0}.afterUnbind`,
              `${prefix}.${$1$0}.afterUnbindChildren`,
            ];
          }

          if ($2$0 === '') {
            if ($1$1 === '') {
              return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $2$1, routerHooks);
            }
            if ($2$1 === '') {
              return getCalls[`$x$0+$x$1 -> ''`](prefix, $1$0, $1$1, routerHooks);
            }

            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$0}.canLeave`,
                `${prefix}.${$1$1}.canLeave`,
                `${prefix}.${$2$1}.canEnter`,
                `${prefix}.${$1$0}.leave`,
                `${prefix}.${$1$1}.leave`,
                `${prefix}.${$2$1}.enter`,
              ]),
              `${prefix}.${$1$0}.beforeDetach`,
              `${prefix}.${$2$1}.beforeBind`,
              `${prefix}.${$1$0}.beforeUnbind`,
              `${prefix}.${$2$1}.afterBind`,
              `${prefix}.${$1$0}.afterUnbind`,
              `${prefix}.${$2$1}.afterAttach`,
              `${prefix}.${$1$0}.afterUnbindChildren`,
              `${prefix}.${$2$1}.afterAttachChildren`,
              `${prefix}.${$1$1}.beforeDetach`,
              `${prefix}.${$1$1}.beforeUnbind`,
              `${prefix}.${$1$1}.afterUnbind`,
              `${prefix}.${$1$1}.afterUnbindChildren`,
            ];
          }

          if ($2$1 === '') {
            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$0}.canLeave`,
                `${prefix}.${$1$1}.canLeave`,
                `${prefix}.${$2$0}.canEnter`,
                `${prefix}.${$1$0}.leave`,
                `${prefix}.${$1$1}.leave`,
                `${prefix}.${$2$0}.enter`,
              ]),
              `${prefix}.${$2$0}.beforeBind`,
              `${prefix}.${$1$1}.beforeDetach`,
              `${prefix}.${$2$0}.afterBind`,
              `${prefix}.${$1$1}.beforeUnbind`,
              `${prefix}.${$2$0}.afterAttach`,
              `${prefix}.${$1$1}.afterUnbind`,
              `${prefix}.${$2$0}.afterAttachChildren`,
              `${prefix}.${$1$1}.afterUnbindChildren`,
              `${prefix}.${$1$0}.beforeDetach`,
              `${prefix}.${$1$0}.beforeUnbind`,
              `${prefix}.${$1$0}.afterUnbind`,
              `${prefix}.${$1$0}.afterUnbindChildren`,
            ];
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$0}.canLeave`,
              `${prefix}.${$1$1}.canLeave`,
              `${prefix}.${$2$0}.canEnter`,
              `${prefix}.${$2$1}.canEnter`,
              `${prefix}.${$1$0}.leave`,
              `${prefix}.${$1$1}.leave`,
              `${prefix}.${$2$0}.enter`,
              `${prefix}.${$2$1}.enter`,
            ]),
            `${prefix}.${$2$0}.beforeBind`,
            `${prefix}.${$2$1}.beforeBind`,
            `${prefix}.${$2$0}.afterBind`,
            `${prefix}.${$2$1}.afterBind`,
            `${prefix}.${$2$0}.afterAttach`,
            `${prefix}.${$2$1}.afterAttach`,
            `${prefix}.${$2$0}.afterAttachChildren`,
            `${prefix}.${$2$1}.afterAttachChildren`,
            `${prefix}.${$1$0}.beforeDetach`,
            `${prefix}.${$1$1}.beforeDetach`,
            `${prefix}.${$1$0}.beforeUnbind`,
            `${prefix}.${$1$1}.beforeUnbind`,
            `${prefix}.${$1$0}.afterUnbind`,
            `${prefix}.${$1$1}.afterUnbind`,
            `${prefix}.${$1$0}.afterUnbindChildren`,
            `${prefix}.${$1$1}.afterUnbindChildren`,
          ];
        },
        [`'' -> $x$p/$x$c`](
          prefix: string,
          $x$p: string,
          $x$c: string,
          routerHooks: boolean,
        ): string[] {
          if ($x$c === '') {
            return getCalls[`'' -> $x`](prefix, $x$p, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x$p}.canEnter`,
              `${prefix}.${$x$p}.enter`,
            ]),
            `${prefix}.${$x$p}.beforeBind`,
            `${prefix}.${$x$p}.afterBind`,
            `${prefix}.${$x$p}.afterAttach`,
            `${prefix}.${$x$p}.afterAttachChildren`,
            ...addIf(routerHooks, [
              `${prefix}.${$x$c}.canEnter`,
              `${prefix}.${$x$c}.enter`,
            ]),
            `${prefix}.${$x$c}.beforeBind`,
            `${prefix}.${$x$c}.afterBind`,
            `${prefix}.${$x$c}.afterAttach`,
            `${prefix}.${$x$c}.afterAttachChildren`,
          ];
        },
        [`$x$p/$x$c -> ''`](
          prefix: string,
          $x$p: string,
          $x$c: string,
          routerHooks: boolean,
        ): string[] {
          if ($x$c === '') {
            return getCalls[`$x -> ''`](prefix, $x$p, routerHooks);
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$x$p}.canLeave`,
              `${prefix}.${$x$c}.canLeave`,
              `${prefix}.${$x$p}.leave`,
              `${prefix}.${$x$c}.leave`,
            ]),
            `${prefix}.${$x$p}.beforeDetach`,
            `${prefix}.${$x$p}.beforeUnbind`,
            `${prefix}.${$x$p}.afterUnbind`,
            `${prefix}.${$x$c}.beforeDetach`,
            `${prefix}.${$x$c}.beforeUnbind`,
            `${prefix}.${$x$c}.afterUnbind`,
            `${prefix}.${$x$c}.afterUnbindChildren`,
            `${prefix}.${$x$p}.afterUnbindChildren`,
          ];
        },
        [`$1$p/$1$c -> $2$p/$2$c`](
          prefix: string,
          $1$p: string,
          $1$c: string,
          $2$p: string,
          $2$c: string,
          routerHooks: boolean,
        ): string[] {
          if ($1$p === $2$p) {
            return getCalls[`$1 -> $2`](prefix, $1$c, $2$c, routerHooks);
          }

          if ($1$c === '') {
            if ($2$c === '') {
              return getCalls[`$1 -> $2`](prefix, $1$p, $2$p, routerHooks);
            }

            if ($1$p === '') {
              return getCalls[`'' -> $x$p/$x$c`](prefix, $2$p, $2$c, routerHooks);
            }

            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$p}.canLeave`,
                `${prefix}.${$2$p}.canEnter`,
                `${prefix}.${$1$p}.leave`,
                `${prefix}.${$2$p}.enter`,
              ]),
              `${prefix}.${$2$p}.beforeBind`,
              `${prefix}.${$2$p}.afterBind`,
              `${prefix}.${$2$p}.afterAttach`,
              `${prefix}.${$2$p}.afterAttachChildren`,
              `${prefix}.${$1$p}.beforeDetach`,
              `${prefix}.${$1$p}.beforeUnbind`,
              `${prefix}.${$1$p}.afterUnbind`,
              `${prefix}.${$1$p}.afterUnbindChildren`,
              ...addIf(routerHooks, [
                `${prefix}.${$2$c}.canEnter`,
                `${prefix}.${$2$c}.enter`,
              ]),
              `${prefix}.${$2$c}.beforeBind`,
              `${prefix}.${$2$c}.afterBind`,
              `${prefix}.${$2$c}.afterAttach`,
              `${prefix}.${$2$c}.afterAttachChildren`,
            ];
          }

          if ($2$c === '') {
            if ($2$p === '') {
              return getCalls[`$x$p/$x$c -> ''`](prefix, $1$p, $1$c, routerHooks);
            }

            return [
              ...addIf(routerHooks, [
                `${prefix}.${$1$p}.canLeave`,
                `${prefix}.${$1$c}.canLeave`,
                `${prefix}.${$2$p}.canEnter`,
                `${prefix}.${$1$p}.leave`,
                `${prefix}.${$1$c}.leave`,
                `${prefix}.${$2$p}.enter`,
              ]),
              `${prefix}.${$2$p}.beforeBind`,
              `${prefix}.${$2$p}.afterBind`,
              `${prefix}.${$2$p}.afterAttach`,
              `${prefix}.${$2$p}.afterAttachChildren`,
              `${prefix}.${$1$p}.beforeDetach`,
              `${prefix}.${$1$p}.beforeUnbind`,
              `${prefix}.${$1$p}.afterUnbind`,
              `${prefix}.${$1$c}.beforeDetach`,
              `${prefix}.${$1$c}.beforeUnbind`,
              `${prefix}.${$1$c}.afterUnbind`,
              `${prefix}.${$1$c}.afterUnbindChildren`,
              `${prefix}.${$1$p}.afterUnbindChildren`,
            ];
          }

          return [
            ...addIf(routerHooks, [
              `${prefix}.${$1$p}.canLeave`,
              `${prefix}.${$1$c}.canLeave`,
              `${prefix}.${$2$p}.canEnter`,
              `${prefix}.${$1$p}.leave`,
              `${prefix}.${$1$c}.leave`,
              `${prefix}.${$2$p}.enter`,
            ]),
            `${prefix}.${$2$p}.beforeBind`,
            `${prefix}.${$2$p}.afterBind`,
            `${prefix}.${$2$p}.afterAttach`,
            `${prefix}.${$2$p}.afterAttachChildren`,
            `${prefix}.${$1$p}.beforeDetach`,
            `${prefix}.${$1$p}.beforeUnbind`,
            `${prefix}.${$1$p}.afterUnbind`,
            `${prefix}.${$1$c}.beforeDetach`,
            `${prefix}.${$1$c}.beforeUnbind`,
            `${prefix}.${$1$c}.afterUnbind`,
            `${prefix}.${$1$c}.afterUnbindChildren`,
            `${prefix}.${$1$p}.afterUnbindChildren`,
            ...addIf(routerHooks, [
              `${prefix}.${$2$c}.canEnter`,
              `${prefix}.${$2$c}.enter`,
            ]),
            `${prefix}.${$2$c}.beforeBind`,
            `${prefix}.${$2$c}.afterBind`,
            `${prefix}.${$2$c}.afterAttach`,
            `${prefix}.${$2$c}.afterAttachChildren`,
          ];
        },
      };
    });
  }
});

function addIf(
  condition: boolean,
  itemsIfTrue: string[] = [],
  itemsIfFalse: string[] = [],
): string[] {
  return condition ? itemsIfTrue : itemsIfFalse;
}

function join(sep: string, ...parts: string[]): string {
  return parts.filter(function (x) {
    return x.length > 0 && x.split('@')[0].length > 0;
  }).join(sep);
}
