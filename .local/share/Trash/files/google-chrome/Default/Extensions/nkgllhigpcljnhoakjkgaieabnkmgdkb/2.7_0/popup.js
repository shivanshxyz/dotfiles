(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const add = document.querySelector('.add');
    const cancel = document.querySelector('.cancel');
    const container = document.querySelector('.container');
    const form = document.querySelector('.form');
    const options = document.querySelector('.options');
    let rules = new DFWP.Rules();

    form.addEventListener('submit', event => {
      event.preventDefault();
      DFWP.storage.set({ rules: rules.serialize() });
      window.close();
    });

    cancel.addEventListener('click', event => {
      window.close();
    });

    options.addEventListener('click', event => {
      DFWP.browser.runtime.openOptionsPage();
    });

    DFWP.storage.get({ rules: [] }, ({ rules: values }) => {
      rules = DFWP.Rules.deserialize(values);

      DFWP.browser.tabs.query({active: true, windowId: DFWP.browser.windows.WINDOW_ID_CURRENT}, ([tab]) => {
        const addHandler = () => {
          const rule = new DFWP.Rule(new URL(tab.url).origin.replace(/\./g, '\\.'));
          rules.add(rule);
          new DFWP.RuleView(rule, rules).render(container, '#new');
        };

        add.addEventListener('click', addHandler);

        const matching = rules.filter(rule => rule.test(tab.url));
        matching.forEach(rule => new DFWP.RuleView(rule, rules).render(container, '#existing'));

        if (!matching.length) {
          addHandler();
        }

        const remove = document.querySelector('.delete');
        if (remove) {
          remove.addEventListener('click', event => {
            DFWP.storage.set({ rules: rules.serialize() });
            window.close();
          });
        }
      });
    });

  });
})();
