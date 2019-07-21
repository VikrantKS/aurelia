import { I18nConfigurationOptions, I18nService } from '@aurelia/i18n';
import { IDOM } from '@aurelia/runtime';
import { assert, HTMLTestContext, TestContext } from '@aurelia/testing';
import i18next from 'i18next';
import { Spy } from './Spy';

const translation = {
  simple: {
    text: 'simple text',
    attr: 'simple attribute'
  }
};

export function i18nTests() {
  describe('I18N', () => {
    let sut: I18nService, mockContext: Spy, ctx: HTMLTestContext;
    const arrange = async (options: I18nConfigurationOptions = {}) => {
      mockContext = new Spy();
      ctx = TestContext.createHTMLTestContext();
      sut = new I18nService({ i18next: mockContext.getMock(i18next) }, options, ctx as unknown as IDOM<Node>);
      await sut['task'].wait();
    };

    it('initializes i18next with default options on instantiation', async () => {
      await arrange();

      mockContext.methodCalledOnceWith('init', [{
        lng: 'en',
        fallbackLng: ['en'],
        debug: false,
        plugins: [],
        attributes: ['t', 'i18n'],
        skipTranslationOnMissingKey: false,
      }]);
    });

    it('respects user-defined config options', async () => {
      const customization = { lng: 'de', attributes: ['foo'] };
      await arrange(customization);

      mockContext.methodCalledOnceWith('init', [{
        lng: customization.lng,
        fallbackLng: ['en'],
        debug: false,
        plugins: [],
        attributes: customization.attributes,
        skipTranslationOnMissingKey: false,
      }]);
    });

    it('registers external plugins provided by user-defined options', async () => {
      const customization = {
        plugins: [
          {
            type: 'postProcessor',
            name: 'custom1',
            process: function (value) { return value; }
          },
          {
            type: 'postProcessor',
            name: 'custom2',
            process: function (value) { return value; }
          }
        ]
      };
      await arrange(customization);

      mockContext.methodCalledNthTimeWith('use', 1, [customization.plugins[0]]);
      mockContext.methodCalledNthTimeWith('use', 2, [customization.plugins[1]]);
    });

    it('can update textContent of an element given translations', async () => {
      const customization = {
        resources: {
          en: { translation }
        }
      };
      await arrange(customization);

      const span = ctx.createElement('span');
      sut.updateValue(span as any, 'simple.text');
      await sut['task'].wait();

      assert.equal(span.textContent, translation.simple.text);
    });
  });
}
