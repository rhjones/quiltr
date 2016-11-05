import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sign-in-form', 'Integration | Component | sign in form', {
  integration: true,
});

test('it renders', function (assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{sign-in-form}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#sign-in-form}}
      template block text
    {{/sign-in-form}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
