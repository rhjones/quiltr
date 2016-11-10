"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('quiltr/ajax/service', ['exports', 'ember', 'ember-ajax/services/ajax', 'quiltr/config/environment'], function (exports, _ember, _emberAjaxServicesAjax, _quiltrConfigEnvironment) {
  exports['default'] = _emberAjaxServicesAjax['default'].extend({
    host: _quiltrConfigEnvironment['default'].apiHost,

    auth: _ember['default'].inject.service(),
    headers: _ember['default'].computed('auth.credentials.token', {
      get: function get() {
        var headers = {};
        var token = this.get('auth.credentials.token');
        if (token) {
          headers.Authorization = 'Token token=' + token;
        }

        return headers;
      }
    })
  });
});
define('quiltr/app', ['exports', 'ember', 'quiltr/resolver', 'ember-load-initializers', 'quiltr/config/environment'], function (exports, _ember, _quiltrResolver, _emberLoadInitializers, _quiltrConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _quiltrConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _quiltrConfigEnvironment['default'].podModulePrefix,
    Resolver: _quiltrResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _quiltrConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('quiltr/application/adapter', ['exports', 'quiltr/config/environment', 'active-model-adapter', 'ember'], function (exports, _quiltrConfigEnvironment, _activeModelAdapter, _ember) {
  exports['default'] = _activeModelAdapter['default'].extend({
    host: _quiltrConfigEnvironment['default'].apiHost,

    auth: _ember['default'].inject.service(),

    headers: _ember['default'].computed('auth.credentials.token', {
      get: function get() {
        var headers = {};
        var token = this.get('auth.credentials.token');
        if (token) {
          headers.Authorization = 'Token token=' + token;
        }

        return headers;
      }
    })
  });
});
define('quiltr/application/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    actions: {
      signOut: function signOut() {
        var _this = this;

        this.get('auth').signOut().then(function () {
          return _this.transitionTo('sign-in');
        }).then(function () {
          _this.get('flashMessages').warning('You have been signed out.');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Are you sure you\'re signed-in?');
        });
        this.store.unloadAll();
      },

      error: function error(reason) {
        var unauthorized = reason.errors.some(function (error) {
          return error.status === '401';
        });

        if (unauthorized) {
          this.get('flashMessages').danger('You must be authenticated to access this page.');
          this.transitionTo('/sign-in');
        } else {
          this.get('flashMessages').danger('There was a problem. Please try again.');
        }

        return false;
      }
    }
  });
});
define('quiltr/application/serializer', ['exports', 'active-model-adapter'], function (exports, _activeModelAdapter) {
  exports['default'] = _activeModelAdapter.ActiveModelSerializer.extend({});
});
define("quiltr/application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 36
          }
        },
        "moduleName": "quiltr/application/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["inline", "my-application", [], ["signOut", "signOut"], ["loc", [null, [1, 0], [1, 36]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/auth/service', ['exports', 'ember', 'ember-local-storage'], function (exports, _ember, _emberLocalStorage) {
  exports['default'] = _ember['default'].Service.extend({
    ajax: _ember['default'].inject.service(),
    credentials: (0, _emberLocalStorage.storageFor)('auth'),
    isAuthenticated: _ember['default'].computed.bool('credentials.token'),

    signUp: function signUp(credentials) {
      return this.get('ajax').post('/sign-up', {
        data: {
          credentials: {
            email: credentials.email,
            username: credentials.username,
            password: credentials.password,
            password_confirmation: credentials.passwordConfirmation
          }
        }
      });
    },

    signIn: function signIn(credentials) {
      var _this = this;

      return this.get('ajax').post('/sign-in', {
        data: {
          credentials: {
            email: credentials.email,
            password: credentials.password
          }
        }
      }).then(function (result) {
        _this.get('credentials').set('id', result.user.id);
        _this.get('credentials').set('username', result.user.username);
        _this.get('credentials').set('email', result.user.email);
        _this.get('credentials').set('token', result.user.token);
      });
    },

    changePassword: function changePassword(passwords) {
      return this.get('ajax').patch('/change-password/' + this.get('credentials.id'), {
        data: {
          passwords: {
            old: passwords.previous,
            'new': passwords.next
          }
        }
      });
    },

    signOut: function signOut() {
      var _this2 = this;

      return this.get('ajax').del('/sign-out/' + this.get('credentials.id'))['finally'](function () {
        return _this2.get('credentials').reset();
      });
    }
  });
});
define('quiltr/auth/storage', ['exports', 'ember-local-storage/local/object'], function (exports, _emberLocalStorageLocalObject) {
  exports['default'] = _emberLocalStorageLocalObject['default'].extend({});
});
define('quiltr/change-password/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      var _this = this;

      if (!this.get('auth.credentials.token')) {
        this.transitionTo('sign-in').then(function () {
          _this.get('flashMessages').warning('You must sign in to access that page.');
        });
      }
    },
    actions: {
      changePassword: function changePassword(passwords) {
        var _this2 = this;

        this.get('auth').changePassword(passwords).then(function () {
          return _this2.get('auth').signOut();
        }).then(function () {
          return _this2.transitionTo('sign-in');
        }).then(function () {
          _this2.get('flashMessages').success('Successfully changed your password!');
        }).then(function () {
          _this2.get('flashMessages').warning('You have been signed out.');
        })['catch'](function () {
          _this2.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("quiltr/change-password/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/change-password/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "auth-form pwd-form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Change Password");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        return morphs;
      },
      statements: [["inline", "change-password-form", [], ["submit", "changePassword"], ["loc", [null, [4, 2], [4, 50]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/app-version', ['exports', 'ember-cli-app-version/components/app-version', 'quiltr/config/environment'], function (exports, _emberCliAppVersionComponentsAppVersion, _quiltrConfigEnvironment) {

  var name = _quiltrConfigEnvironment['default'].APP.name;
  var version = _quiltrConfigEnvironment['default'].APP.version;

  exports['default'] = _emberCliAppVersionComponentsAppVersion['default'].extend({
    version: version,
    name: name
  });
});
define('quiltr/components/change-password-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',

    passwords: {},

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('passwords'));
      },

      reset: function reset() {
        this.set('passwords', {});
      }
    }
  });
});
define("quiltr/components/change-password-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 26,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/change-password-form/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "form-group");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("label");
        dom.setAttribute(el2, "for", "previous");
        var el3 = dom.createTextNode("Old Password");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "form-group");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("label");
        dom.setAttribute(el2, "for", "next");
        var el3 = dom.createTextNode("New Password");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1, "type", "submit");
        dom.setAttribute(el1, "class", "btn");
        var el2 = dom.createTextNode("\n  Change Password\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1, "class", "btn");
        var el2 = dom.createTextNode("\n  Cancel\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4]);
        var element1 = dom.childAt(fragment, [6]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]), 3, 3);
        morphs[2] = dom.createElementMorph(element0);
        morphs[3] = dom.createElementMorph(element1);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "password", "class", "form-control", "id", "previous", "placeholder", "Old password", "value", ["subexpr", "@mut", [["get", "passwords.previous", ["loc", [null, [7, 16], [7, 34]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [3, 2], [7, 36]]], 0, 0], ["inline", "input", [], ["type", "password", "class", "form-control", "id", "next", "placeholder", "New password", "value", ["subexpr", "@mut", [["get", "passwords.next", ["loc", [null, [16, 16], [16, 30]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [12, 2], [16, 32]]], 0, 0], ["element", "action", ["submit"], [], ["loc", [null, [19, 34], [19, 53]]], 0, 0], ["element", "action", ["reset"], [], ["loc", [null, [23, 20], [23, 38]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/custom-flash/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['alert']
  });
});
define("quiltr/components/custom-flash/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/custom-flash/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["content", "flash.message", ["loc", [null, [1, 0], [1, 17]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/email-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("quiltr/components/email-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/email-input/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("label");
        dom.setAttribute(el1, "for", "email");
        var el2 = dom.createTextNode("Email");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "email", "id", "email", "placeholder", "Email", "value", ["subexpr", "@mut", [["get", "email", ["loc", [null, [5, 14], [5, 19]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [5, 21]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/favorite-button/component', ['exports', 'ember'], function (exports, _ember) {

  // favorite-button <-- pattern
  // favorite-button <-- pattern-card <-- gallery (patterns)
  // favorite-button <-- pattern-card <-- favorites

  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    auth: _ember['default'].inject.service(),
    store: _ember['default'].inject.service(),
    classNameBindings: ['isFavorite'],
    isFavorite: _ember['default'].computed.bool('pattern.currentUserFavorite'),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated'),
    actions: {
      toggleFavorite: function toggleFavorite() {
        var _this = this;

        var favorite = this.get('favorite');
        if (favorite) {
          favorite.destroyRecord()['catch'](function () {
            _this.get('flashMessages').danger('There was an error. Please try again.');
          });
        } else {
          var _favorite = this.get('store').createRecord('favorite', {
            pattern: this.get('pattern')
          });
          _favorite.save()['catch'](function () {
            _this.get('flashMessages').danger('There was an error. Please try again.');
          });
        }
      }
    }

  });
});
define("quiltr/components/favorite-button/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 4,
                "column": 2
              }
            },
            "moduleName": "quiltr/components/favorite-button/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "title", "Favorite this pattern");
            dom.setAttribute(el1, "class", "fa fa-heart");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element1 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element1);
            return morphs;
          },
          statements: [["element", "action", ["toggleFavorite"], [], ["loc", [null, [3, 76], [3, 104]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 2
              },
              "end": {
                "line": 6,
                "column": 2
              }
            },
            "moduleName": "quiltr/components/favorite-button/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "title", "Favorite this pattern");
            dom.setAttribute(el1, "class", "fa fa-heart-o");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(1);
            morphs[0] = dom.createElementMorph(element0);
            return morphs;
          },
          statements: [["element", "action", ["toggleFavorite"], [], ["loc", [null, [5, 78], [5, 106]]], 0, 0]],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 7,
              "column": 0
            }
          },
          "moduleName": "quiltr/components/favorite-button/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "if", [["get", "favorite", ["loc", [null, [2, 8], [2, 16]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [2, 2], [6, 9]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 7
          }
        },
        "moduleName": "quiltr/components/favorite-button/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "isAuthenticated", ["loc", [null, [1, 6], [1, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [7, 7]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, _emberCliFlashComponentsFlashMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashComponentsFlashMessage['default'];
    }
  });
});
define('quiltr/components/hamburger-menu/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'button',
    classNames: ['navbar-toggle', 'collapsed'],
    attributeBindings: ['toggle:data-toggle', 'target:data-target', 'expanded:aria-expanded'],
    toggle: 'collapse',
    target: '#navigation',
    expanded: false
  });
});
define("quiltr/components/hamburger-menu/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/hamburger-menu/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1, "class", "sr-only");
        var el2 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1, "class", "icon-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1, "class", "icon-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n  ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("span");
        dom.setAttribute(el1, "class", "icon-bar");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes() {
        return [];
      },
      statements: [],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/home-view/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    didInsertElement: function didInsertElement() {
      this.$().parents('.main').addClass('welcome');
    },

    willDestroyElement: function willDestroyElement() {
      _ember['default'].$('.main').removeClass('welcome');
    }
  });
});
define("quiltr/components/home-view/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 10
            },
            "end": {
              "line": 6,
              "column": 97
            }
          },
          "moduleName": "quiltr/components/home-view/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("img");
          dom.setAttribute(el1, "src", "assets/img/create-pattern.png");
          dom.setAttribute(el1, "alt", "Create a pattern");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 10
            },
            "end": {
              "line": 14,
              "column": 101
            }
          },
          "moduleName": "quiltr/components/home-view/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("img");
          dom.setAttribute(el1, "src", "assets/img/project.png");
          dom.setAttribute(el1, "alt", "Explore the project gallery");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 21,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/home-view/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "container-fluid");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row home-page-row");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 home-page");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "create-pattern home-prompt");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "home-prompt-img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Create a pattern");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "col-md-6 home-page");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "explore-gallery home-prompt");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5, "class", "home-prompt-img");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createComment("");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("Explore projects");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 1]);
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1, 1, 1]), 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [3, 1, 1]), 1, 1);
        return morphs;
      },
      statements: [["block", "link-to", ["generate"], [], 0, null, ["loc", [null, [6, 10], [6, 109]]]], ["block", "link-to", ["projects"], [], 1, null, ["loc", [null, [14, 10], [14, 113]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define('quiltr/components/make-button/component', ['exports', 'ember'], function (exports, _ember) {

  // make-button <-- pattern-card <-- gallery (patterns)
  // make-button <-- pattern-card <-- project
  // make-button <-- pattern-card <-- favorites
  // make-button <-- pattern

  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    auth: _ember['default'].inject.service(),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated')
  });
});
define("quiltr/components/make-button/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 2
              },
              "end": {
                "line": 4,
                "column": 2
              }
            },
            "moduleName": "quiltr/components/make-button/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "title", "Make this project");
            dom.setAttribute(el1, "class", "fa fa-scissors");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "quiltr/components/make-button/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
          dom.insertBoundary(fragment, 0);
          dom.insertBoundary(fragment, null);
          return morphs;
        },
        statements: [["block", "link-to", ["newproject", ["get", "pattern", ["loc", [null, [2, 26], [2, 33]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 2], [4, 14]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 7
          }
        },
        "moduleName": "quiltr/components/make-button/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "isAuthenticated", ["loc", [null, [1, 6], [1, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [5, 7]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/my-application/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),

    currentUserEmail: _ember['default'].computed.alias('auth.credentials.email'),
    currentUsername: _ember['default'].computed.alias('auth.credentials.username'),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated'),

    actions: {
      signOut: function signOut() {
        this.sendAction('signOut');
      }
    }
  });
});
define("quiltr/components/my-application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 6
            },
            "end": {
              "line": 8,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/my-application/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "custom-flash", [], ["flash", ["subexpr", "@mut", [["get", "flash", ["loc", [null, [7, 29], [7, 34]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [7, 8], [7, 36]]], 0, 0]],
        locals: ["flash"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 16,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/my-application/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "id", "app-wrapper");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "container-fluid main");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3, "class", "alerts");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element1, [1]), 1, 1);
        morphs[2] = dom.createMorphAt(element1, 3, 3);
        return morphs;
      },
      statements: [["inline", "nav-bar", [], ["signOut", "signOut"], ["loc", [null, [2, 2], [2, 31]]], 0, 0], ["block", "each", [["get", "flashMessages.queue", ["loc", [null, [6, 14], [6, 33]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [6, 6], [8, 15]]]], ["content", "outlet", ["loc", [null, [11, 4], [11, 14]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/nav-bar/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    auth: _ember['default'].inject.service(),

    currentUserEmail: _ember['default'].computed.alias('auth.credentials.email'),
    currentUsername: _ember['default'].computed.alias('auth.credentials.username'),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated'),
    actions: {
      signOut: function signOut() {
        this.sendAction('signOut');
      }
    }
  });
});
define("quiltr/components/nav-bar/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 10
            },
            "end": {
              "line": 6,
              "column": 41
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Patterns");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 10
            },
            "end": {
              "line": 7,
              "column": 41
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Projects");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 10
            },
            "end": {
              "line": 8,
              "column": 49
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Create A Pattern");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 9,
              "column": 10
            },
            "end": {
              "line": 9,
              "column": 31
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("FAQ");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child4 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 14,
                "column": 10
              },
              "end": {
                "line": 16,
                "column": 10
              }
            },
            "moduleName": "quiltr/components/nav-bar/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-scissors");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 19,
                "column": 10
              },
              "end": {
                "line": 21,
                "column": 10
              }
            },
            "moduleName": "quiltr/components/nav-bar/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-heart");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child2 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 30,
                "column": 16
              },
              "end": {
                "line": 30,
                "column": 61
              }
            },
            "moduleName": "quiltr/components/nav-bar/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Change Password");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 12,
              "column": 6
            },
            "end": {
              "line": 35,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1, "class", "dropdown");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2, "class", "dropdown-toggle");
          dom.setAttribute(el2, "data-toggle", "dropdown");
          dom.setAttribute(el2, "href", "#");
          dom.setAttribute(el2, "role", "button");
          dom.setAttribute(el2, "aria-haspopup", "true");
          dom.setAttribute(el2, "aria-expanded", "false");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-user");
          dom.setAttribute(el3, "aria-hidden", "true");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3, "class", "caret");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2, "class", "dropdown-menu");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3, "class", "username");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createComment("");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createElement("a");
          dom.setAttribute(el4, "href", "#");
          var el5 = dom.createTextNode("Sign Out");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n       \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [5, 3]);
          var element1 = dom.childAt(element0, [5, 0]);
          var morphs = new Array(5);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 1, 1);
          morphs[2] = dom.createMorphAt(dom.childAt(element0, [1]), 0, 0);
          morphs[3] = dom.createMorphAt(dom.childAt(element0, [3]), 0, 0);
          morphs[4] = dom.createElementMorph(element1);
          return morphs;
        },
        statements: [["block", "link-to", ["my-projects"], [], 0, null, ["loc", [null, [14, 10], [16, 22]]]], ["block", "link-to", ["favorites"], [], 1, null, ["loc", [null, [19, 10], [21, 22]]]], ["content", "currentUsername", ["loc", [null, [29, 33], [29, 52]]], 0, 0, 0, 0], ["block", "link-to", ["change-password"], [], 2, null, ["loc", [null, [30, 16], [30, 73]]]], ["element", "action", ["signOut"], [], ["loc", [null, [31, 28], [31, 48]]], 0, 0]],
        locals: [],
        templates: [child0, child1, child2]
      };
    })();
    var child5 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 36,
                "column": 12
              },
              "end": {
                "line": 36,
                "column": 41
              }
            },
            "moduleName": "quiltr/components/nav-bar/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Sign Up");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 37,
                "column": 12
              },
              "end": {
                "line": 37,
                "column": 41
              }
            },
            "moduleName": "quiltr/components/nav-bar/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Sign In");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 35,
              "column": 6
            },
            "end": {
              "line": 38,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/nav-bar/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          morphs[1] = dom.createMorphAt(dom.childAt(fragment, [3]), 0, 0);
          return morphs;
        },
        statements: [["block", "link-to", ["sign-up"], [], 0, null, ["loc", [null, [36, 12], [36, 53]]]], ["block", "link-to", ["sign-in"], [], 1, null, ["loc", [null, [37, 12], [37, 53]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 41,
            "column": 6
          }
        },
        "moduleName": "quiltr/components/nav-bar/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "collapse navbar-collapse");
        dom.setAttribute(el2, "id", "navigation");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3, "class", "nav navbar-nav");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        var el5 = dom.createComment("");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3, "class", "nav navbar-nav navbar-right");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element3, [1]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(element2, 1, 1);
        morphs[1] = dom.createMorphAt(dom.childAt(element4, [1]), 0, 0);
        morphs[2] = dom.createMorphAt(dom.childAt(element4, [3]), 0, 0);
        morphs[3] = dom.createMorphAt(dom.childAt(element4, [5]), 0, 0);
        morphs[4] = dom.createMorphAt(dom.childAt(element4, [7]), 0, 0);
        morphs[5] = dom.createMorphAt(dom.childAt(element3, [3]), 1, 1);
        return morphs;
      },
      statements: [["content", "navbar-header", ["loc", [null, [2, 2], [2, 19]]], 0, 0, 0, 0], ["block", "link-to", ["patterns"], [], 0, null, ["loc", [null, [6, 10], [6, 53]]]], ["block", "link-to", ["projects"], [], 1, null, ["loc", [null, [7, 10], [7, 53]]]], ["block", "link-to", ["generate"], [], 2, null, ["loc", [null, [8, 10], [8, 61]]]], ["block", "link-to", ["faq"], [], 3, null, ["loc", [null, [9, 10], [9, 43]]]], ["block", "if", [["get", "isAuthenticated", ["loc", [null, [12, 12], [12, 27]]], 0, 0, 0, 0]], [], 4, 5, ["loc", [null, [12, 6], [38, 13]]]]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5]
    };
  })());
});
define('quiltr/components/navbar-header/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['navbar-header']
  });
});
define("quiltr/components/navbar-header/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "quiltr/components/navbar-header/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-scissors fa-rotate-90");
          dom.setAttribute(el1, "aria-hidden", "true");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("Quiltr\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/navbar-header/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "hamburger-menu", ["loc", [null, [1, 0], [1, 18]]], 0, 0, 0, 0], ["block", "link-to", ["application"], ["class", "navbar-brand"], 0, null, ["loc", [null, [2, 0], [5, 12]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/password-confirmation-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("quiltr/components/password-confirmation-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/password-confirmation-input/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("label");
        dom.setAttribute(el1, "for", "password-confirmation");
        var el2 = dom.createTextNode("Password Confirmation");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "password", "id", "password-confirmation", "placeholder", "Password Confirmation", "value", ["subexpr", "@mut", [["get", "password", ["loc", [null, [5, 14], [5, 22]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [5, 24]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/password-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("quiltr/components/password-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/password-input/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("label");
        dom.setAttribute(el1, "for", "kind");
        var el2 = dom.createTextNode("Password");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "password", "id", "password", "placeholder", "Password", "value", ["subexpr", "@mut", [["get", "password", ["loc", [null, [5, 14], [5, 22]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [5, 24]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/pattern-canvas/component', ['exports', 'ember'], function (exports, _ember) {

  // pattern-canvas <-- generate
  // pattern-canvas <-- pattern
  // pattern-canvas <-- pattern-card <-- gallery (patterns)

  exports['default'] = _ember['default'].Component.extend({
    classNames: ['canvas-container']
  });
});
define("quiltr/components/pattern-canvas/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/pattern-canvas/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("canvas");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(1);
        morphs[0] = dom.createAttrMorph(element0, 'id');
        return morphs;
      },
      statements: [["attribute", "id", ["concat", ["canvas", ["get", "pattern.id", ["loc", [null, [1, 20], [1, 30]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/pattern-card/component', ['exports', 'ember'], function (exports, _ember) {

  // pattern-card <-- patterns (gallery)
  // pattern-card <-- favorites
  // pattern-card <-- project

  // pattern-card --> make-button
  // pattern-card --> favorite-button
  // pattern-card --> pattern-canvas
  // pattern-card --> pattern-metadata

  exports['default'] = _ember['default'].Component.extend({});
});
define("quiltr/components/pattern-card/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 8,
              "column": 2
            }
          },
          "moduleName": "quiltr/components/pattern-card/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "pattern-card-svg");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("div");
          dom.setAttribute(el2, "class", "pattern-svg");
          var el3 = dom.createTextNode("\n        ");
          dom.appendChild(el2, el3);
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n      ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createUnsafeMorphAt(dom.childAt(fragment, [1, 1]), 1, 1);
          return morphs;
        },
        statements: [["content", "pattern.svg", ["loc", [null, [5, 8], [5, 25]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 25,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/pattern-card/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "pattern-card");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "card-caption");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3, "class", "pattern-card-buttons");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" \n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3]);
        var element2 = dom.childAt(element1, [3]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(element1, 1, 1);
        morphs[2] = dom.createMorphAt(element2, 1, 1);
        morphs[3] = dom.createMorphAt(element2, 3, 3);
        return morphs;
      },
      statements: [["block", "link-to", ["pattern", ["get", "pattern", ["loc", [null, [2, 23], [2, 30]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 2], [8, 14]]]], ["inline", "pattern-metadata", [], ["pattern", ["subexpr", "@mut", [["get", "pattern", ["loc", [null, [10, 31], [10, 38]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [10, 4], [10, 40]]], 0, 0], ["inline", "favorite-button", [], ["pattern", ["subexpr", "@mut", [["get", "pattern", ["loc", [null, [13, 32], [13, 39]]], 0, 0, 0, 0]], [], [], 0, 0], "favorite", ["subexpr", "@mut", [["get", "pattern.currentUserFavorite", ["loc", [null, [13, 49], [13, 76]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [13, 6], [13, 78]]], 0, 0], ["inline", "make-button", [], ["pattern", ["subexpr", "@mut", [["get", "pattern", ["loc", [null, [15, 28], [15, 35]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [15, 6], [15, 37]]], 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/pattern-metadata/component', ['exports', 'ember'], function (exports, _ember) {

  // pattern-metadata <-- pattern
  // pattern-metadata <-- pattern-card <-- patterns | favorites | projects

  exports['default'] = _ember['default'].Component.extend({
    tagName: 'p',
    plural: _ember['default'].computed('pattern.colors', function () {
      return this.get('pattern.colors') > 1 ? 's' : '';
    })
  });
});
define("quiltr/components/pattern-metadata/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 4
          }
        },
        "moduleName": "quiltr/components/pattern-metadata/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("p");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" | \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" color");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" | \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\" blocks\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(element0, 3, 3);
        morphs[2] = dom.createMorphAt(element0, 5, 5);
        morphs[3] = dom.createMorphAt(element0, 7, 7);
        return morphs;
      },
      statements: [["content", "pattern.quiltSize", ["loc", [null, [2, 2], [2, 23]]], 0, 0, 0, 0], ["content", "pattern.colors", ["loc", [null, [3, 2], [3, 20]]], 0, 0, 0, 0], ["content", "plural", ["loc", [null, [3, 26], [3, 36]]], 0, 0, 0, 0], ["content", "pattern.blockSize", ["loc", [null, [4, 2], [4, 23]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/project-card/component', ['exports', 'ember'], function (exports, _ember) {

  // project-card <-- pattern
  // project-card <-- projects
  // project-card <-- my-projects
  exports['default'] = _ember['default'].Component.extend({});
});
define("quiltr/components/project-card/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 4,
                "column": 6
              },
              "end": {
                "line": 6,
                "column": 6
              }
            },
            "moduleName": "quiltr/components/project-card/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("img");
            dom.setAttribute(el1, "class", "project-card-photo");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
            var element0 = dom.childAt(fragment, [1]);
            var morphs = new Array(2);
            morphs[0] = dom.createAttrMorph(element0, 'src');
            morphs[1] = dom.createAttrMorph(element0, 'alt');
            return morphs;
          },
          statements: [["attribute", "src", ["concat", [["get", "project.projectUploads.firstObject.photoUrl", ["loc", [null, [5, 20], [5, 63]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "alt", ["concat", [["get", "project.name", ["loc", [null, [5, 74], [5, 86]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0]],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 6,
                "column": 6
              },
              "end": {
                "line": 8,
                "column": 6
              }
            },
            "moduleName": "quiltr/components/project-card/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("i");
            dom.setAttribute(el1, "class", "fa fa-picture-o card-missing-image");
            dom.setAttribute(el1, "aria-hidden", "true");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 10,
              "column": 2
            }
          },
          "moduleName": "quiltr/components/project-card/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "card-square-image");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["block", "if", [["get", "project.projectUploads", ["loc", [null, [4, 12], [4, 34]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [4, 6], [8, 13]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 14,
              "column": 6
            },
            "end": {
              "line": 16,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/project-card/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["content", "project.name", ["loc", [null, [15, 8], [15, 24]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 26,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/project-card/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "project-card");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "card-caption");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      by ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [3, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element1, 1, 1);
        morphs[1] = dom.createMorphAt(element2, 1, 1);
        morphs[2] = dom.createMorphAt(element2, 3, 3);
        return morphs;
      },
      statements: [["block", "link-to", ["project", ["get", "project", ["loc", [null, [2, 23], [2, 30]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 2], [10, 14]]]], ["block", "link-to", ["project", ["get", "project", ["loc", [null, [14, 27], [14, 34]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [14, 6], [16, 18]]]], ["content", "project.user.username", ["loc", [null, [17, 9], [17, 34]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define('quiltr/components/project-delete-button/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    classNames: ['delete-button'],
    actions: {
      deleteProject: function deleteProject() {
        this.sendAction('deleteProject', this.get('project'));
      }
    }
  });
});
define("quiltr/components/project-delete-button/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 2,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/project-delete-button/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("i");
        dom.setAttribute(el1, "class", "fa fa-trash-o");
        dom.setAttribute(el1, "aria-hidden", "true");
        dom.setAttribute(el1, "title", "Delete project");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(1);
        morphs[0] = dom.createElementMorph(element0);
        return morphs;
      },
      statements: [["element", "action", ["deleteProject"], [], ["loc", [null, [1, 44], [1, 70]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/project-edit-button/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span'
  });
});
define("quiltr/components/project-edit-button/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 1,
              "column": 103
            }
          },
          "moduleName": "quiltr/components/project-edit-button/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-pencil");
          dom.setAttribute(el1, "aria-hidden", "true");
          dom.setAttribute(el1, "title", "Edit project");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 3,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/project-edit-button/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["block", "link-to", ["project.edit", ["get", "project", ["loc", [null, [1, 26], [1, 33]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [1, 115]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/project-form/component', ['exports', 'ember'], function (exports, _ember) {

  // project-form <-- newproject
  // project-form <-- project/edit

  exports['default'] = _ember['default'].Component.extend({
    project: {
      name: null,
      notes: null
    },
    classNames: ['project-form'],
    // didInsertElement() {
    //   // use jQuery UI datepicker in browsers that don't handle HTML5 date inputs
    //   let testInput = document.createElement('input');
    //   testInput.setAttribute('type', 'date');
    //   if ( testInput.type === 'text' ) {
    //      this.$('#startDate').datepicker();
    //      this.$('#finishDate').datepicker();
    //   }
    // },
    actions: {
      saveProject: function saveProject() {
        var start = this.$('#startDate').val();
        var finish = this.$('#finishDate').val();
        var startDate = start ? new Date(start) : '';
        var finishDate = finish ? new Date(finish) : '';
        if (this.get('project.id')) {
          this.get('project').set('startDate', startDate);
          this.get('project').set('finishDate', finishDate);
          this.get('project').set('finished', this.$('#finished').val());
          this.sendAction('updateProject', this.get('project'));
        } else {
          var newProject = {

            name: this.get('project.name'),
            startDate: startDate,
            finishDate: finishDate,
            finished: this.$('#finished').val(),
            notes: this.get('project.notes'),
            pattern: this.get('pattern')
          };
          this.sendAction('storeNewProject', newProject);
        }
      }
    }
  });
});
define("quiltr/components/project-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 21,
              "column": 6
            },
            "end": {
              "line": 23,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/project-form/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("option");
          dom.setAttribute(el1, "value", "true");
          dom.setAttribute(el1, "selected", "");
          var el2 = dom.createTextNode("Completed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 23,
              "column": 6
            },
            "end": {
              "line": 25,
              "column": 6
            }
          },
          "moduleName": "quiltr/components/project-form/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("option");
          dom.setAttribute(el1, "value", "true");
          var el2 = dom.createTextNode("Completed");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 33,
            "column": 7
          }
        },
        "moduleName": "quiltr/components/project-form/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "name");
        var el4 = dom.createTextNode("Project Name*");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "startDate");
        var el4 = dom.createTextNode("Date Started");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "date");
        dom.setAttribute(el3, "id", "startDate");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  \n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "finishDate");
        var el4 = dom.createTextNode("Date Completed");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("input");
        dom.setAttribute(el3, "type", "date");
        dom.setAttribute(el3, "id", "finishDate");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "finished");
        var el4 = dom.createTextNode("Project Status");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("select");
        dom.setAttribute(el3, "id", "finished");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("option");
        dom.setAttribute(el4, "value", "false");
        var el5 = dom.createTextNode("In progress");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("label");
        dom.setAttribute(el2, "for", "notes");
        var el3 = dom.createTextNode("Project Notes");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2, "class", "btn btn-default");
        dom.setAttribute(el2, "type", "submit");
        dom.setAttribute(el2, "id", "submit");
        dom.setAttribute(el2, "value", "Submit");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3, 3]);
        var element2 = dom.childAt(element0, [5, 3]);
        var morphs = new Array(6);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createMorphAt(dom.childAt(element0, [1]), 3, 3);
        morphs[2] = dom.createAttrMorph(element1, 'value');
        morphs[3] = dom.createAttrMorph(element2, 'value');
        morphs[4] = dom.createMorphAt(dom.childAt(element0, [7, 3]), 3, 3);
        morphs[5] = dom.createMorphAt(element0, 11, 11);
        return morphs;
      },
      statements: [["element", "action", ["saveProject"], ["on", "submit"], ["loc", [null, [1, 6], [1, 42]]], 0, 0], ["inline", "input", [], ["type", ["subexpr", "@mut", [["get", "text", ["loc", [null, [4, 17], [4, 21]]], 0, 0, 0, 0]], [], [], 0, 0], "id", "name", "value", ["subexpr", "@mut", [["get", "project.name", ["loc", [null, [4, 38], [4, 50]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 4], [4, 52]]], 0, 0], ["attribute", "value", ["subexpr", "formatDateForForms", [["get", "project.startDate", ["loc", [null, [9, 65], [9, 82]]], 0, 0, 0, 0]], [], ["loc", [null, [null, null], [9, 84]]], 0, 0], 0, 0, 0, 0], ["attribute", "value", ["subexpr", "formatDateForForms", [["get", "project.finishDate", ["loc", [null, [14, 66], [14, 84]]], 0, 0, 0, 0]], [], ["loc", [null, [null, null], [14, 86]]], 0, 0], 0, 0, 0, 0], ["block", "if", [["get", "project.finished", ["loc", [null, [21, 12], [21, 28]]], 0, 0, 0, 0]], [], 0, 1, ["loc", [null, [21, 6], [25, 13]]]], ["inline", "textarea", [], ["value", ["subexpr", "@mut", [["get", "project.notes", ["loc", [null, [30, 19], [30, 32]]], 0, 0, 0, 0]], [], [], 0, 0], "cols", "80", "rows", "6"], ["loc", [null, [30, 2], [30, 53]]], 0, 0]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define('quiltr/components/project-photo/component', ['exports', 'ember'], function (exports, _ember) {

  // project-photo --> project
  exports['default'] = _ember['default'].Component.extend({
    actions: {
      removePhoto: function removePhoto() {
        this.sendAction('removePhoto', this.get('photo'));
      }
    }
  });
});
define("quiltr/components/project-photo/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 2
            },
            "end": {
              "line": 8,
              "column": 2
            }
          },
          "moduleName": "quiltr/components/project-photo/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1, "class", "fa fa-trash-o delete-button photo-delete-button");
          dom.setAttribute(el1, "aria-hidden", "true");
          dom.setAttribute(el1, "title", "Delete photo");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["removePhoto"], [], ["loc", [null, [7, 82], [7, 106]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/project-photo/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "project-photo-card");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "project-photo-card-thumbnail");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element1 = dom.childAt(fragment, [0]);
        var element2 = dom.childAt(element1, [1, 1]);
        var morphs = new Array(3);
        morphs[0] = dom.createAttrMorph(element2, 'src');
        morphs[1] = dom.createAttrMorph(element2, 'alt');
        morphs[2] = dom.createMorphAt(element1, 3, 3);
        return morphs;
      },
      statements: [["attribute", "src", ["concat", [["get", "photo.photoUrl", ["loc", [null, [3, 16], [3, 30]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["attribute", "alt", ["concat", [["get", "project.name", ["loc", [null, [3, 41], [3, 53]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0], ["block", "if", [["subexpr", "currentUser", [["get", "project.user.id", ["loc", [null, [6, 21], [6, 36]]], 0, 0, 0, 0]], [], ["loc", [null, [6, 8], [6, 37]]], 0, 0]], [], 0, null, ["loc", [null, [6, 2], [8, 9]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/project-upload-form/component', ['exports', 'ember'], function (exports, _ember) {

  // project-upload <-- project
  exports['default'] = _ember['default'].Component.extend({
    classNames: ['meta', 'photo-upload-meta'],
    actions: {
      uploadPhoto: function uploadPhoto() {
        var data = new FormData(document.getElementById('project-upload-form'));
        this.sendAction('uploadPhoto', data);
      }
    }
  });
});
define("quiltr/components/project-upload-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 7,
            "column": 7
          }
        },
        "moduleName": "quiltr/components/project-upload-form/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode("Upload photo");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        dom.setAttribute(el1, "enctype", "multipart/form-data");
        dom.setAttribute(el1, "id", "project-upload-form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("label");
        var el3 = dom.createTextNode("Photo Upload");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2, "type", "file");
        dom.setAttribute(el2, "name", "project_upload[photo]");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2, "type", "hidden");
        dom.setAttribute(el2, "name", "project_upload[project_id]");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2, "type", "submit");
        dom.setAttribute(el2, "name", "submit");
        dom.setAttribute(el2, "value", "Upload");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [5]);
        var morphs = new Array(2);
        morphs[0] = dom.createElementMorph(element0);
        morphs[1] = dom.createAttrMorph(element1, 'value');
        return morphs;
      },
      statements: [["element", "action", ["uploadPhoto"], ["on", "submit"], ["loc", [null, [2, 61], [2, 99]]], 0, 0], ["attribute", "value", ["concat", [["get", "project.id", ["loc", [null, [5, 66], [5, 76]]], 0, 0, 0, 0]], 0, 0, 0, 0, 0], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/sign-in-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',

    credentials: {},

    didInsertElement: function didInsertElement() {
      this.$().parents('.main').addClass('welcome');
    },

    willDestroyElement: function willDestroyElement() {
      _ember['default'].$('.main').removeClass('welcome');
    },

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('credentials'));
      },

      reset: function reset() {
        this.set('credentials', {});
      }
    }
  });
});
define("quiltr/components/sign-in-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/sign-in-form/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1, "type", "submit");
        var el2 = dom.createTextNode("\n  Sign In\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        var el2 = dom.createTextNode("\n  Cancel\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [4]);
        var element1 = dom.childAt(fragment, [6]);
        var morphs = new Array(4);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createElementMorph(element0);
        morphs[3] = dom.createElementMorph(element1);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "email-input", [], ["email", ["subexpr", "@mut", [["get", "credentials.email", ["loc", [null, [1, 20], [1, 37]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [1, 39]]], 0, 0], ["inline", "password-input", [], ["password", ["subexpr", "@mut", [["get", "credentials.password", ["loc", [null, [2, 26], [2, 46]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [2, 48]]], 0, 0], ["element", "action", ["submit"], [], ["loc", [null, [4, 22], [4, 41]]], 0, 0], ["element", "action", ["reset"], [], ["loc", [null, [8, 8], [8, 26]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/sign-in-prompt/component', ['exports', 'ember'], function (exports, _ember) {

  // sign-in-prompt <-- generate
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    auth: _ember['default'].inject.service(),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated')
  });
});
define("quiltr/components/sign-in-prompt/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 2,
                "column": 59
              },
              "end": {
                "line": 2,
                "column": 89
              }
            },
            "moduleName": "quiltr/components/sign-in-prompt/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("Sign in.");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 3,
              "column": 0
            }
          },
          "moduleName": "quiltr/components/sign-in-prompt/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "meta");
          var el2 = dom.createTextNode("Want to save patterns or share quilts? ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["block", "link-to", ["sign-in"], [], 0, null, ["loc", [null, [2, 59], [2, 101]]]]],
        locals: [],
        templates: [child0]
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 4,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/sign-in-prompt/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "unless", [["get", "isAuthenticated", ["loc", [null, [1, 10], [1, 25]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [3, 11]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/sign-up-form/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'form',

    credentials: {},

    didInsertElement: function didInsertElement() {
      this.$().parents('.main').addClass('welcome');
    },

    willDestroyElement: function willDestroyElement() {
      _ember['default'].$('.main').removeClass('welcome');
    },

    actions: {
      submit: function submit() {
        this.sendAction('submit', this.get('credentials'));
      },

      reset: function reset() {
        this.set('credentials', {});
      }
    }
  });
});
define("quiltr/components/sign-up-form/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 13,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/sign-up-form/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        dom.setAttribute(el1, "type", "submit");
        var el2 = dom.createTextNode("\n  Sign Up\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("button");
        var el2 = dom.createTextNode("\n  Cancel\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [8]);
        var element1 = dom.childAt(fragment, [10]);
        var morphs = new Array(6);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[2] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        morphs[3] = dom.createMorphAt(fragment, 6, 6, contextualElement);
        morphs[4] = dom.createElementMorph(element0);
        morphs[5] = dom.createElementMorph(element1);
        dom.insertBoundary(fragment, 0);
        return morphs;
      },
      statements: [["inline", "email-input", [], ["email", ["subexpr", "@mut", [["get", "credentials.email", ["loc", [null, [1, 20], [1, 37]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [1, 0], [1, 39]]], 0, 0], ["inline", "username-input", [], ["username", ["subexpr", "@mut", [["get", "credentials.username", ["loc", [null, [2, 26], [2, 46]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [2, 48]]], 0, 0], ["inline", "password-input", [], ["password", ["subexpr", "@mut", [["get", "credentials.password", ["loc", [null, [3, 26], [3, 46]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [3, 0], [3, 48]]], 0, 0], ["inline", "password-confirmation-input", [], ["password", ["subexpr", "@mut", [["get", "credentials.passwordConfirmation", ["loc", [null, [4, 39], [4, 71]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 0], [4, 73]]], 0, 0], ["element", "action", ["submit"], [], ["loc", [null, [6, 22], [6, 41]]], 0, 0], ["element", "action", ["reset"], [], ["loc", [null, [10, 8], [10, 26]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/components/store-pattern/component', ['exports', 'ember'], function (exports, _ember) {

  // store-pattern <-- generate

  exports['default'] = _ember['default'].Component.extend({
    tagName: 'span',
    auth: _ember['default'].inject.service(),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated'),
    quiltrFabric: _ember['default'].inject.service(),
    actions: {
      storeAndFavoritePattern: function storeAndFavoritePattern() {
        var patternData = this.get('quiltrFabric').patternData;
        this.sendAction('storeAndFavoritePattern', patternData);
      }
    }
  });
});
define("quiltr/components/store-pattern/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 1,
              "column": 0
            },
            "end": {
              "line": 6,
              "column": 0
            }
          },
          "moduleName": "quiltr/components/store-pattern/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "meta store-pattern");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createTextNode("Like this pattern? Go ahead and show it some love.");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("p");
          var el3 = dom.createElement("i");
          dom.setAttribute(el3, "class", "fa fa-heart-o");
          dom.setAttribute(el3, "aria-hidden", "true");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [1, 3, 0]);
          var morphs = new Array(1);
          morphs[0] = dom.createElementMorph(element0);
          return morphs;
        },
        statements: [["element", "action", ["storeAndFavoritePattern"], [], ["loc", [null, [4, 51], [4, 88]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 7
          }
        },
        "moduleName": "quiltr/components/store-pattern/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "if", [["get", "isAuthenticated", ["loc", [null, [1, 6], [1, 21]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [1, 0], [6, 7]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/components/username-input/component', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    tagName: 'div',
    classNames: ['form-group']
  });
});
define("quiltr/components/username-input/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 6,
            "column": 0
          }
        },
        "moduleName": "quiltr/components/username-input/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("label");
        dom.setAttribute(el1, "for", "username");
        var el2 = dom.createTextNode("Username");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        return morphs;
      },
      statements: [["inline", "input", [], ["type", "text", "id", "username", "placeholder", "Username", "value", ["subexpr", "@mut", [["get", "username", ["loc", [null, [5, 14], [5, 22]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [2, 0], [5, 24]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/controllers/array', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('quiltr/controllers/object', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller;
});
define('quiltr/faq/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("quiltr/faq/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 4,
              "column": 43
            }
          },
          "moduleName": "quiltr/faq/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Create patterns.");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 39
            }
          },
          "moduleName": "quiltr/faq/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Make quilts.");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 39
            }
          },
          "moduleName": "quiltr/faq/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Be inspired.");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 29,
            "column": 0
          }
        },
        "moduleName": "quiltr/faq/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "faq");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("FAQ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Quilt Sizes");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Lap: 36\" x 36\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Baby: 36\" x 60\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Twin: 72\" x 96\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Double/Full: 84\" x 96\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("Queen: 96\" x 96\" ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("King: 108\" x 96\"");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Piecing Instructions");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "text-left");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("All of the quilt patterns in Quiltr are made up of square and half square triangle (HST) blocks.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Finished block sizes are specified in the pattern. Blocks should be cut 1/2\" larger to allow for 1/4\" seams. To make HSTs, cut squares 1\" larger than the final block size, then follow the second method in ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "href", "https://www.connectingthreads.com/tutorials/Intro_to_Half_Square_Triangles__D4.html");
        var el5 = dom.createTextNode("these instructions");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" to assemble.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("New to quilting? Check out the Sew Delicious ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4, "href", "http://sewdelicious.com.au/2012/09/quilting-for-beginners.html");
        var el5 = dom.createTextNode("quilting tutorial for beginners");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(".");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0, 3]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(element0, 1, 1);
        morphs[1] = dom.createMorphAt(element0, 3, 3);
        morphs[2] = dom.createMorphAt(element0, 5, 5);
        return morphs;
      },
      statements: [["block", "link-to", ["generate"], [], 0, null, ["loc", [null, [4, 4], [4, 55]]]], ["block", "link-to", ["projects"], [], 1, null, ["loc", [null, [5, 4], [5, 51]]]], ["block", "link-to", ["patterns"], [], 2, null, ["loc", [null, [6, 4], [6, 51]]]]],
      locals: [],
      templates: [child0, child1, child2]
    };
  })());
});
define('quiltr/favorite/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    user: _emberData['default'].belongsTo('user'),
    pattern: _emberData['default'].belongsTo('pattern'),
    belongsToCurrentUser: _emberData['default'].attr('boolean')
  });
});
define('quiltr/favorites/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      var _this = this;

      if (!this.get('auth.credentials.token')) {
        this.transitionTo('sign-in').then(function () {
          _this.get('flashMessages').warning('You must sign in to access that page.');
        });
      }
    },
    model: function model() {
      return this.get('store').query('favorite', {
        user: this.get('auth.credentials.id')
      });
    }
  });
});
define("quiltr/favorites/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 33
              },
              "end": {
                "line": 5,
                "column": 63
              }
            },
            "moduleName": "quiltr/favorites/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("gallery");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 100
              },
              "end": {
                "line": 5,
                "column": 140
              }
            },
            "moduleName": "quiltr/favorites/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("pattern generator");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 6,
              "column": 0
            }
          },
          "moduleName": "quiltr/favorites/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Looks like you haven't saved any patterns as favorites yet.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Why don't you check out the ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" or take a spin with the ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("?");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [3]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["block", "link-to", ["patterns"], [], 0, null, ["loc", [null, [5, 33], [5, 75]]]], ["block", "link-to", ["generate"], [], 1, null, ["loc", [null, [5, 100], [5, 152]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 7,
              "column": 0
            },
            "end": {
              "line": 9,
              "column": 0
            }
          },
          "moduleName": "quiltr/favorites/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "pattern-card", [], ["pattern", ["subexpr", "@mut", [["get", "favorite.pattern", ["loc", [null, [8, 25], [8, 41]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "col-sm-4 col-md-3"], ["loc", [null, [8, 2], [8, 69]]], 0, 0]],
        locals: ["favorite"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 9,
            "column": 9
          }
        },
        "moduleName": "quiltr/favorites/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("My Favorites");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "unless", [["get", "model", ["loc", [null, [3, 10], [3, 15]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [3, 0], [6, 11]]]], ["block", "each", [["get", "model", ["loc", [null, [7, 8], [7, 13]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [7, 0], [9, 9]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define('quiltr/flash/object', ['exports', 'ember-cli-flash/flash/object'], function (exports, _emberCliFlashFlashObject) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashFlashObject['default'];
    }
  });
});
define('quiltr/generate/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    quiltrFabric: _ember['default'].inject.service(),
    actions: {
      generatePattern: function generatePattern() {
        this.get('quiltrFabric').generatePattern();
        _ember['default'].$('.store-pattern').show();
      },
      storeAndFavoritePattern: function storeAndFavoritePattern(patternData) {
        // creating a new pattern automatically creates a favorite in Rails
        var newPattern = this.get('store').createRecord('pattern', patternData);
        var savedPattern = newPattern.save();
        this.transitionTo('pattern', savedPattern);
      }
    }

  });
});
define("quiltr/generate/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 77
            },
            "end": {
              "line": 6,
              "column": 98
            }
          },
          "moduleName": "quiltr/generate/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("FAQ");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 85,
            "column": 0
          }
        },
        "moduleName": "quiltr/generate/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("Create a Pattern");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("form");
        dom.setAttribute(el2, "class", "generate-form");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "quiltsize");
        var el4 = dom.createTextNode("Quilt Size");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("How big do you want your quilt to be? For precise dimensions, see the ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(".");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "btn-group green");
        dom.setAttribute(el4, "role", "group");
        dom.setAttribute(el4, "data-toggle", "buttons");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn active");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "lap");
        dom.setAttribute(el6, "checked", "");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          Lap\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn ");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "baby");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          Baby\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn ");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "twin");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          Twin\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "full");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          Full\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "queen");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          Queen\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "quiltSize");
        dom.setAttribute(el6, "value", "king");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n          King\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "colors");
        var el4 = dom.createTextNode("Colors");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("How many colors would you like? All quilts have a white background color by default.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "btn-group yellow");
        dom.setAttribute(el4, "role", "group");
        dom.setAttribute(el4, "data-toggle", "buttons");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "colors");
        dom.setAttribute(el6, "value", "1");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" One\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "colors");
        dom.setAttribute(el6, "value", "2");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Two\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn active");
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "colors");
        dom.setAttribute(el6, "value", "3");
        dom.setAttribute(el6, "checked", "");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Three\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "colors");
        dom.setAttribute(el6, "value", "4");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Four\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n            ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "colors");
        dom.setAttribute(el6, "value", "5");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Five\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3, "for", "blockSize");
        var el4 = dom.createTextNode("Block Size");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("How big would you like each individual block to be?");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4, "class", "btn-group papaya");
        dom.setAttribute(el4, "role", "group");
        dom.setAttribute(el4, "data-toggle", "buttons");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "blockSize");
        dom.setAttribute(el6, "value", "6");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" 6\"\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5, "class", "btn btn-default quiltr-btn active");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("input");
        dom.setAttribute(el6, "type", "radio");
        dom.setAttribute(el6, "name", "blockSize");
        dom.setAttribute(el6, "value", "12");
        dom.setAttribute(el6, "checked", "");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" 12\"\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("input");
        dom.setAttribute(el4, "class", "btn btn-default quiltr-btn");
        dom.setAttribute(el4, "type", "submit");
        dom.setAttribute(el4, "id", "submit");
        dom.setAttribute(el4, "value", "MAKE SOME MAGIC");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6 pattern-canvas-container-div-test");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5]);
        if (this.cachedFragment) {
          dom.repairClonedNode(dom.childAt(element1, [5, 1, 1, 1]), [], true);
        }
        if (this.cachedFragment) {
          dom.repairClonedNode(dom.childAt(element1, [11, 1, 5, 1]), [], true);
        }
        if (this.cachedFragment) {
          dom.repairClonedNode(dom.childAt(element1, [17, 1, 3, 1]), [], true);
        }
        var element2 = dom.childAt(fragment, [2]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(element0, 3, 3);
        morphs[1] = dom.createElementMorph(element1);
        morphs[2] = dom.createMorphAt(dom.childAt(element1, [3]), 1, 1);
        morphs[3] = dom.createMorphAt(element2, 1, 1);
        morphs[4] = dom.createMorphAt(element2, 3, 3);
        return morphs;
      },
      statements: [["content", "sign-in-prompt", ["loc", [null, [3, 4], [3, 22]]], 0, 0, 0, 0], ["element", "action", ["generatePattern"], ["on", "submit"], ["loc", [null, [4, 30], [4, 71]]], 0, 0], ["block", "link-to", ["faq"], [], 0, null, ["loc", [null, [6, 77], [6, 110]]]], ["inline", "store-pattern", [], ["storeAndFavoritePattern", "storeAndFavoritePattern"], ["loc", [null, [80, 2], [80, 69]]], 0, 0], ["content", "pattern-canvas", ["loc", [null, [82, 2], [82, 20]]], 0, 0, 0, 0]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/helpers/current-user', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Helper.extend({
    auth: _ember['default'].inject.service(),
    compute: function compute(params) {
      // expects a user id as the only param
      var auth = this.get('auth');
      return parseInt(auth.get('credentials.id'), 10) === parseInt(params[0], 10);
    }
  });
});
define('quiltr/helpers/format-date-for-forms', ['exports', 'ember'], function (exports, _ember) {
  exports.formatDateForForms = formatDateForForms;

  /* global moment */

  function formatDateForForms(params /*, hash*/) {
    if (params[0]) {
      var date = new Date(params[0]);
      var wrapper = moment(date);
      return wrapper.format('YYYY-MM-DD');
    }
    return '';
  }

  exports['default'] = _ember['default'].Helper.helper(formatDateForForms);
});
define('quiltr/helpers/format-date', ['exports', 'ember'], function (exports, _ember) {
  exports.formatDate = formatDate;

  /* global moment */

  function formatDate(params) {
    var date = new Date(params[0]);
    var wrapper = moment(date);
    return wrapper.format('MMMM D, YYYY');
  }

  exports['default'] = _ember['default'].Helper.helper(formatDate);
});
define('quiltr/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('quiltr/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('quiltr/index/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define("quiltr/index/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 1,
            "column": 13
          }
        },
        "moduleName": "quiltr/index/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 0, 0, contextualElement);
        dom.insertBoundary(fragment, 0);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["content", "home-view", ["loc", [null, [1, 0], [1, 13]]], 0, 0, 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define("quiltr/initializers/active-model-adapter", ["exports", "active-model-adapter", "active-model-adapter/active-model-serializer"], function (exports, _activeModelAdapter, _activeModelAdapterActiveModelSerializer) {
  exports["default"] = {
    name: 'active-model-adapter',
    initialize: function initialize() {
      var application = arguments[1] || arguments[0];
      application.register('adapter:-active-model', _activeModelAdapter["default"]);
      application.register('serializer:-active-model', _activeModelAdapterActiveModelSerializer["default"]);
    }
  };
});
define('quiltr/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'quiltr/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _quiltrConfigEnvironment) {
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(_quiltrConfigEnvironment['default'].APP.name, _quiltrConfigEnvironment['default'].APP.version)
  };
});
define('quiltr/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('quiltr/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('quiltr/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('quiltr/initializers/export-application-global', ['exports', 'ember', 'quiltr/config/environment'], function (exports, _ember, _quiltrConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_quiltrConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _quiltrConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_quiltrConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('quiltr/initializers/flash-messages', ['exports', 'ember', 'quiltr/config/environment'], function (exports, _ember, _quiltrConfigEnvironment) {
  exports.initialize = initialize;
  var merge = _ember['default'].merge;
  var deprecate = _ember['default'].deprecate;

  var INJECTION_FACTORIES_DEPRECATION_MESSAGE = '[ember-cli-flash] Future versions of ember-cli-flash will no longer inject the service automatically. Instead, you should explicitly inject it into your Route, Controller or Component with `Ember.inject.service`.';
  var addonDefaults = {
    timeout: 3000,
    extendedTimeout: 0,
    priority: 100,
    sticky: false,
    showProgress: false,
    type: 'info',
    types: ['success', 'info', 'warning', 'danger', 'alert', 'secondary'],
    injectionFactories: ['route', 'controller', 'view', 'component'],
    preventDuplicates: false
  };

  function initialize() {
    var application = arguments[1] || arguments[0];

    var _ref = _quiltrConfigEnvironment['default'] || {};

    var flashMessageDefaults = _ref.flashMessageDefaults;

    var _ref2 = flashMessageDefaults || [];

    var injectionFactories = _ref2.injectionFactories;

    var options = merge(addonDefaults, flashMessageDefaults);
    var shouldShowDeprecation = !(injectionFactories && injectionFactories.length);

    application.register('config:flash-messages', options, { instantiate: false });
    application.inject('service:flash-messages', 'flashMessageDefaults', 'config:flash-messages');

    deprecate(INJECTION_FACTORIES_DEPRECATION_MESSAGE, shouldShowDeprecation, {
      id: 'ember-cli-flash.deprecate-injection-factories',
      until: '2.0.0'
    });

    options.injectionFactories.forEach(function (factory) {
      application.inject(factory, 'flashMessages', 'service:flash-messages');
    });
  }

  exports['default'] = {
    name: 'flash-messages',
    initialize: initialize
  };
});
define('quiltr/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define('quiltr/initializers/local-storage-adapter', ['exports', 'ember-local-storage/initializers/local-storage-adapter'], function (exports, _emberLocalStorageInitializersLocalStorageAdapter) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberLocalStorageInitializersLocalStorageAdapter['default'];
    }
  });
  Object.defineProperty(exports, 'initialize', {
    enumerable: true,
    get: function get() {
      return _emberLocalStorageInitializersLocalStorageAdapter.initialize;
    }
  });
});
define('quiltr/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: _ember['default'].K
  };
});
define('quiltr/initializers/text-field', ['exports', 'ember'], function (exports, _ember) {
  exports.initialize = initialize;

  function initialize() {
    _ember['default'].TextField.reopen({
      classNames: ['form-control']
    });
  }

  exports['default'] = {
    name: 'text-field',
    initialize: initialize
  };
});
define('quiltr/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: _ember['default'].K
  };
});
define("quiltr/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('quiltr/my-projects/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      var _this = this;

      if (!this.get('auth.credentials.token')) {
        this.transitionTo('sign-in').then(function () {
          _this.get('flashMessages').warning('You must sign in to access that page.');
        });
      }
    },
    model: function model() {
      return this.get('store').query('project', {
        user: this.get('auth.credentials.id')
      });
    }
  });
});
define("quiltr/my-projects/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      var child0 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 44
              },
              "end": {
                "line": 5,
                "column": 82
              }
            },
            "moduleName": "quiltr/my-projects/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("pattern gallery");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      var child1 = (function () {
        return {
          meta: {
            "revision": "Ember@2.8.3",
            "loc": {
              "source": null,
              "start": {
                "line": 5,
                "column": 110
              },
              "end": {
                "line": 5,
                "column": 160
              }
            },
            "moduleName": "quiltr/my-projects/template.hbs"
          },
          isEmpty: false,
          arity: 0,
          cachedFragment: null,
          hasRendered: false,
          buildFragment: function buildFragment(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("projects others have shared");
            dom.appendChild(el0, el1);
            return el0;
          },
          buildRenderNodes: function buildRenderNodes() {
            return [];
          },
          statements: [],
          locals: [],
          templates: []
        };
      })();
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 6,
              "column": 0
            }
          },
          "moduleName": "quiltr/my-projects/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Looks like you haven't shared any projects yet.");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Looking for inspiration? Check out the ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" or explore the ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(".");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var element0 = dom.childAt(fragment, [3]);
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(element0, 1, 1);
          morphs[1] = dom.createMorphAt(element0, 3, 3);
          return morphs;
        },
        statements: [["block", "link-to", ["patterns"], [], 0, null, ["loc", [null, [5, 44], [5, 94]]]], ["block", "link-to", ["projects"], [], 1, null, ["loc", [null, [5, 110], [5, 172]]]]],
        locals: [],
        templates: [child0, child1]
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 8,
              "column": 0
            },
            "end": {
              "line": 10,
              "column": 0
            }
          },
          "moduleName": "quiltr/my-projects/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["inline", "project-card", [], ["project", ["subexpr", "@mut", [["get", "project", ["loc", [null, [9, 28], [9, 35]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "col-sm-4 col-md-3"], ["loc", [null, [9, 5], [9, 63]]], 0, 0]],
        locals: ["project"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "quiltr/my-projects/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("My Projects");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        morphs[1] = dom.createMorphAt(fragment, 4, 4, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "unless", [["get", "model", ["loc", [null, [3, 10], [3, 15]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [3, 0], [6, 11]]]], ["block", "each", [["get", "model", ["loc", [null, [8, 8], [8, 13]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [8, 0], [10, 9]]]]],
      locals: [],
      templates: [child0, child1]
    };
  })());
});
define('quiltr/newproject/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      var _this = this;

      if (!this.get('auth.credentials.token')) {
        this.transitionTo('sign-in').then(function () {
          _this.get('flashMessages').warning('You must sign in to access that page.');
        });
      }
    },
    actions: {
      storeNewProject: function storeNewProject(newProject) {
        var _this2 = this;

        var project = this.get('store').createRecord('project', newProject);
        project.save().then(function (project) {
          _this2.transitionTo('project', project);
        });
      }
    }
  });
});
define("quiltr/newproject/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 11,
            "column": 0
          }
        },
        "moduleName": "quiltr/newproject/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-9");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("New project");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Pattern");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(2);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        morphs[1] = dom.createMorphAt(dom.childAt(fragment, [2]), 3, 3);
        return morphs;
      },
      statements: [["inline", "project-form", [], ["storeNewProject", "storeNewProject", "pattern", ["subexpr", "@mut", [["get", "model", ["loc", [null, [4, 59], [4, 64]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 2], [4, 66]]], 0, 0], ["inline", "pattern-card", [], ["pattern", ["subexpr", "@mut", [["get", "model", ["loc", [null, [9, 25], [9, 30]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [9, 2], [9, 32]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/pattern/model', ['exports', 'ember', 'ember-data'], function (exports, _ember, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    svg: _emberData['default'].attr('string'),
    colors: _emberData['default'].attr('number'),
    quiltSize: _emberData['default'].attr('string'),
    blockSize: _emberData['default'].attr('number'),
    colorScheme: _emberData['default'].attr('string'),
    projects: _emberData['default'].hasMany('project'),
    favorites: _emberData['default'].hasMany('favorite'),
    currentUserFavorite: _ember['default'].computed('favorites.@each.belongsToCurrentUser', function () {
      // shortcut to the specific favorite attached to this pattern that belongs to the current user
      // used to toggle favorite throughout app
      return this.get('favorites').filterBy('belongsToCurrentUser', true).objectAt(0);
    })
  });
});
define('quiltr/pattern/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model(params) {
      return this.get('store').findRecord('pattern', params.pattern_id);
    },
    auth: _ember['default'].inject.service(),
    isAuthenticated: _ember['default'].computed.alias('auth.isAuthenticated')
  });
});
define("quiltr/pattern/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 19,
              "column": 4
            },
            "end": {
              "line": 21,
              "column": 4
            }
          },
          "moduleName": "quiltr/pattern/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "project-card", [], ["project", ["subexpr", "@mut", [["get", "project", ["loc", [null, [20, 29], [20, 36]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "col-xs-12 col-sm-6"], ["loc", [null, [20, 6], [20, 65]]], 0, 0]],
        locals: ["project"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 30,
            "column": 0
          }
        },
        "moduleName": "quiltr/pattern/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6 single-pattern");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "meta");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "pattern-svg");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-6");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("Projects based on this pattern");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var morphs = new Array(5);
        morphs[0] = dom.createMorphAt(element1, 1, 1);
        morphs[1] = dom.createMorphAt(element1, 3, 3);
        morphs[2] = dom.createMorphAt(element1, 5, 5);
        morphs[3] = dom.createUnsafeMorphAt(dom.childAt(element0, [3]), 1, 1);
        morphs[4] = dom.createMorphAt(dom.childAt(fragment, [2, 3]), 1, 1);
        return morphs;
      },
      statements: [["inline", "pattern-metadata", [], ["pattern", ["subexpr", "@mut", [["get", "model", ["loc", [null, [4, 31], [4, 36]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 4], [4, 38]]], 0, 0], ["inline", "favorite-button", [], ["pattern", ["subexpr", "@mut", [["get", "model", ["loc", [null, [6, 30], [6, 35]]], 0, 0, 0, 0]], [], [], 0, 0], "favorite", ["subexpr", "@mut", [["get", "model.currentUserFavorite", ["loc", [null, [6, 45], [6, 70]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [6, 4], [6, 72]]], 0, 0], ["inline", "make-button", [], ["pattern", ["subexpr", "@mut", [["get", "model", ["loc", [null, [7, 26], [7, 31]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [7, 4], [7, 33]]], 0, 0], ["content", "model.svg", ["loc", [null, [11, 4], [11, 19]]], 0, 0, 0, 0], ["block", "each", [["get", "model.projects", ["loc", [null, [19, 12], [19, 26]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [19, 4], [21, 13]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/patterns/route', ['exports', 'ember'], function (exports, _ember) {

  // patterns --> pattern-card --> pattern-canvas
  // patterns --> pattern-card --> favorite-button
  // patterns --> pattern-card --> make-button

  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.get('store').findAll('pattern');
    }
  });
});
define("quiltr/patterns/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 3,
              "column": 0
            },
            "end": {
              "line": 5,
              "column": 0
            }
          },
          "moduleName": "quiltr/patterns/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "pattern-card", [], ["pattern", ["subexpr", "@mut", [["get", "pattern", ["loc", [null, [4, 25], [4, 32]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "col-sm-4 col-md-3"], ["loc", [null, [4, 2], [4, 60]]], 0, 0]],
        locals: ["pattern"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 9
          }
        },
        "moduleName": "quiltr/patterns/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Pattern Gallery");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [3, 8], [3, 13]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [3, 0], [5, 9]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/project-upload/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    photoUrl: _emberData['default'].attr('string'),
    project: _emberData['default'].belongsTo('project')
  });
});
define('quiltr/project/edit/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      var _this = this;

      if (!this.get('auth.credentials.token')) {
        this.transitionTo('sign-in').then(function () {
          _this.get('flashMessages').warning('You must sign in to access that page.');
        });
      }
    },
    model: function model(params) {
      return this.get('store').findRecord('project', params.project_id);
    },
    afterModel: function afterModel(model) {
      var _this2 = this;

      if (parseInt(this.get('auth.credentials.id'), 10) !== parseInt(model.get('user.id'), 10)) {
        this.transitionTo('projects').then(function () {
          _this2.get('flashMessages').warning('You can only edit projects you created.');
        });
      }
      return _ember['default'].RSVP.hash({
        projectUploads: model.get('projectUploads'),
        pattern: model.get('pattern')
      });
    },
    actions: {
      updateProject: function updateProject(project) {
        var _this3 = this;

        project.save().then(function (project) {
          _this3.transitionTo('project', project);
        });
      }
    }
  });
});
define("quiltr/project/edit/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 12,
            "column": 0
          }
        },
        "moduleName": "quiltr/project/edit/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-9");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Editing ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Original Pattern");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var morphs = new Array(3);
        morphs[0] = dom.createMorphAt(dom.childAt(element0, [1]), 1, 1);
        morphs[1] = dom.createMorphAt(element0, 3, 3);
        morphs[2] = dom.createMorphAt(dom.childAt(fragment, [2]), 3, 3);
        return morphs;
      },
      statements: [["content", "model.name", ["loc", [null, [2, 14], [2, 28]]], 0, 0, 0, 0], ["inline", "project-form", [], ["updateProject", "updateProject", "pattern", ["subexpr", "@mut", [["get", "model.pattern", ["loc", [null, [4, 55], [4, 68]]], 0, 0, 0, 0]], [], [], 0, 0], "project", ["subexpr", "@mut", [["get", "model", ["loc", [null, [4, 77], [4, 82]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [4, 2], [4, 84]]], 0, 0], ["inline", "pattern-card", [], ["pattern", ["subexpr", "@mut", [["get", "model.pattern", ["loc", [null, [9, 25], [9, 38]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [9, 2], [9, 40]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/project/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    name: _emberData['default'].attr('string'),
    notes: _emberData['default'].attr('string'),
    startDate: _emberData['default'].attr('date'),
    finishDate: _emberData['default'].attr('date'),
    finished: _emberData['default'].attr('boolean'),
    pattern: _emberData['default'].belongsTo('pattern'),
    user: _emberData['default'].belongsTo('user'),
    projectUploads: _emberData['default'].hasMany('projectUpload'),
    belongsToCurrentUser: _emberData['default'].attr('boolean')
  });
});
define('quiltr/project/route', ['exports', 'ember'], function (exports, _ember) {

  // project --> project-photo
  // project --> project-delete-button
  // project --> project-upload-form

  // project --> pattern-card

  exports['default'] = _ember['default'].Route.extend({
    uploads: _ember['default'].inject.service(),
    model: function model(params) {
      return this.get('store').findRecord('project', params.project_id);
    },
    afterModel: function afterModel(model) {
      return _ember['default'].RSVP.hash({
        projectUploads: model.get('projectUploads'),
        pattern: model.get('pattern')
      });
    },
    actions: {
      uploadPhoto: function uploadPhoto(data) {
        var _this = this;

        return this.get('uploads').saveUpload(data, '/project_uploads').then(function () {
          return _this.refresh();
        })['catch'](function (error) {
          return console.error(error);
        });
      },
      removePhoto: function removePhoto(photo) {
        var _this2 = this;

        var currentPhoto = photo;
        currentPhoto.deleteRecord();
        currentPhoto.save().then(function () {
          _this2.get('flashMessages').success('Photo deleted.');
        });
      },
      deleteProject: function deleteProject(project) {
        var _this3 = this;

        project.deleteRecord();
        project.save().then(function () {
          return _this3.transitionTo('projects');
        }).then(function () {
          return _this3.get('flashMessages').success('Project deleted.');
        })['catch'](function () {
          return _this3.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("quiltr/project/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 6,
              "column": 6
            },
            "end": {
              "line": 9,
              "column": 6
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(2);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          morphs[1] = dom.createMorphAt(fragment, 3, 3, contextualElement);
          return morphs;
        },
        statements: [["inline", "project-delete-button", [], ["project", ["subexpr", "@mut", [["get", "model", ["loc", [null, [7, 40], [7, 45]]], 0, 0, 0, 0]], [], [], 0, 0], "deleteProject", "deleteProject"], ["loc", [null, [7, 8], [7, 77]]], 0, 0], ["inline", "project-edit-button", [], ["project", ["subexpr", "@mut", [["get", "model", ["loc", [null, [8, 38], [8, 43]]], 0, 0, 0, 0]], [], [], 0, 0], "editProject", "editProject"], ["loc", [null, [8, 8], [8, 71]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child1 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 13,
              "column": 2
            },
            "end": {
              "line": 18,
              "column": 2
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1, "class", "meta project-notes");
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createTextNode("Notes");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2, "class", "whitespace-prewrap");
          var el3 = dom.createComment("");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1, 3]), 0, 0);
          return morphs;
        },
        statements: [["content", "model.notes", ["loc", [null, [16, 39], [16, 54]]], 0, 0, 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child2 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 22,
              "column": 2
            },
            "end": {
              "line": 24,
              "column": 2
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "project-upload-form", [], ["project", ["subexpr", "@mut", [["get", "model", ["loc", [null, [23, 34], [23, 39]]], 0, 0, 0, 0]], [], [], 0, 0], "uploadPhoto", "uploadPhoto"], ["loc", [null, [23, 4], [23, 67]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child3 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 27,
              "column": 4
            },
            "end": {
              "line": 29,
              "column": 4
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createComment("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(fragment, 1, 1, contextualElement);
          return morphs;
        },
        statements: [["inline", "project-photo", [], ["photo", ["subexpr", "@mut", [["get", "photo", ["loc", [null, [28, 28], [28, 33]]], 0, 0, 0, 0]], [], [], 0, 0], "project", ["subexpr", "@mut", [["get", "model", ["loc", [null, [28, 42], [28, 47]]], 0, 0, 0, 0]], [], [], 0, 0], "removePhoto", "removePhoto", "class", "col-md-4"], ["loc", [null, [28, 6], [28, 92]]], 0, 0]],
        locals: ["photo"],
        templates: []
      };
    })();
    var child4 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 23
            },
            "end": {
              "line": 37,
              "column": 53
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("Finished");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child5 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 37,
              "column": 53
            },
            "end": {
              "line": 37,
              "column": 72
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("In progress");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes() {
          return [];
        },
        statements: [],
        locals: [],
        templates: []
      };
    })();
    var child6 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 38,
              "column": 4
            },
            "end": {
              "line": 40,
              "column": 4
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Started: ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["inline", "formatDate", [["get", "model.startDate", ["loc", [null, [39, 31], [39, 46]]], 0, 0, 0, 0]], [], ["loc", [null, [39, 18], [39, 48]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    var child7 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 41,
              "column": 4
            },
            "end": {
              "line": 43,
              "column": 4
            }
          },
          "moduleName": "quiltr/project/template.hbs"
        },
        isEmpty: false,
        arity: 0,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("Finished: ");
          dom.appendChild(el1, el2);
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 1, 1);
          return morphs;
        },
        statements: [["inline", "formatDate", [["get", "model.finishDate", ["loc", [null, [42, 32], [42, 48]]], 0, 0, 0, 0]], [], ["loc", [null, [42, 19], [42, 50]]], 0, 0]],
        locals: [],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 52,
            "column": 0
          }
        },
        "moduleName": "quiltr/project/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-9");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" \n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        var el4 = dom.createTextNode("\n      made by ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "row");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "col-md-3");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2, "class", "meta project-meta");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Project status: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment("");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h2");
        var el3 = dom.createTextNode("Original Pattern");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(fragment, [2]);
        var element4 = dom.childAt(element3, [1]);
        var morphs = new Array(10);
        morphs[0] = dom.createMorphAt(element1, 1, 1);
        morphs[1] = dom.createMorphAt(element2, 1, 1);
        morphs[2] = dom.createMorphAt(element2, 3, 3);
        morphs[3] = dom.createMorphAt(element0, 3, 3);
        morphs[4] = dom.createMorphAt(element0, 5, 5);
        morphs[5] = dom.createMorphAt(dom.childAt(element0, [7]), 1, 1);
        morphs[6] = dom.createMorphAt(dom.childAt(element4, [1]), 1, 1);
        morphs[7] = dom.createMorphAt(element4, 3, 3);
        morphs[8] = dom.createMorphAt(element4, 4, 4);
        morphs[9] = dom.createMorphAt(element3, 5, 5);
        return morphs;
      },
      statements: [["content", "model.name", ["loc", [null, [3, 4], [3, 18]]], 0, 0, 0, 0], ["content", "model.user.username", ["loc", [null, [5, 14], [5, 37]]], 0, 0, 0, 0], ["block", "if", [["subexpr", "currentUser", [["get", "model.user.id", ["loc", [null, [6, 25], [6, 38]]], 0, 0, 0, 0]], [], ["loc", [null, [6, 12], [6, 39]]], 0, 0]], [], 0, null, ["loc", [null, [6, 6], [9, 13]]]], ["block", "if", [["get", "model.notes", ["loc", [null, [13, 8], [13, 19]]], 0, 0, 0, 0]], [], 1, null, ["loc", [null, [13, 2], [18, 9]]]], ["block", "if", [["subexpr", "currentUser", [["get", "model.user.id", ["loc", [null, [22, 21], [22, 34]]], 0, 0, 0, 0]], [], ["loc", [null, [22, 8], [22, 35]]], 0, 0]], [], 2, null, ["loc", [null, [22, 2], [24, 9]]]], ["block", "each", [["get", "model.projectUploads", ["loc", [null, [27, 12], [27, 32]]], 0, 0, 0, 0]], [], 3, null, ["loc", [null, [27, 4], [29, 13]]]], ["block", "if", [["get", "model.finished", ["loc", [null, [37, 29], [37, 43]]], 0, 0, 0, 0]], [], 4, 5, ["loc", [null, [37, 23], [37, 79]]]], ["block", "if", [["get", "model.startDate", ["loc", [null, [38, 10], [38, 25]]], 0, 0, 0, 0]], [], 6, null, ["loc", [null, [38, 4], [40, 11]]]], ["block", "if", [["get", "model.finishDate", ["loc", [null, [41, 10], [41, 26]]], 0, 0, 0, 0]], [], 7, null, ["loc", [null, [41, 4], [43, 11]]]], ["inline", "pattern-card", [], ["pattern", ["subexpr", "@mut", [["get", "model.pattern", ["loc", [null, [46, 25], [46, 38]]], 0, 0, 0, 0]], [], [], 0, 0]], ["loc", [null, [46, 2], [46, 40]]], 0, 0]],
      locals: [],
      templates: [child0, child1, child2, child3, child4, child5, child6, child7]
    };
  })());
});
define('quiltr/projects/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.get('store').findAll('project');
    }
  });
});
define("quiltr/projects/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 2,
              "column": 0
            },
            "end": {
              "line": 4,
              "column": 0
            }
          },
          "moduleName": "quiltr/projects/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["inline", "project-card", [], ["project", ["subexpr", "@mut", [["get", "project", ["loc", [null, [3, 28], [3, 35]]], 0, 0, 0, 0]], [], [], 0, 0], "class", "col-sm-4 col-md-3"], ["loc", [null, [3, 5], [3, 63]]], 0, 0]],
        locals: ["project"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "quiltr/projects/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Project Gallery");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(fragment, 2, 2, contextualElement);
        dom.insertBoundary(fragment, null);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [2, 8], [2, 13]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [2, 0], [4, 9]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
define('quiltr/quiltr-fabric/service', ['exports', 'ember'], function (exports, _ember) {
  /*global fabric*/

  exports['default'] = _ember['default'].Service.extend({
    patternData: {},
    colorSchemes: [{
      neon: ['rgba(255,0,102,1)'],
      pool: ['rgba(5,131,156,1)'],
      papaya: ['#01744d'],
      purple: ['#7e4264']
    }, {
      neon: ['rgba(0,255,200,1)', 'rgba(176,255,5,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(5,131,156,1)'],
      papaya: ['#e24e42', '#e9b000'],
      purple: ['#452445', '#7e4264']
    }, {
      neon: ['rgba(0,255,200,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)'],
      papaya: ['#e24e42', '#e9b000', '#e86e80'],
      purple: ['#452445', '#7e4264', '#ff8851']
    }, {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      papaya: ['#e24e42', '#e9b000', '#e86e80', '#008f95'],
      purple: ['#452445', '#7e4264', '#ff8851', '#69b49d']
    }, {
      neon: ['rgba(0,255,200,1)', 'rgba(255,179,0,1)', 'rgba(176,255,5,1)', 'rgba(255,0,102,1)', 'rgba(112,141,145,1)'],
      pool: ['rgba(52,194,182,1)', 'rgba(251,246,40,1)', 'rgba(202,196,208,1)', 'rgba(182,241,29,1)', 'rgba(5,131,156,1)'],
      papaya: ['#e24e42', '#e9b000', '#e86e80', '#008f95', '#01744d'],
      purple: ['#452445', '#7e4264', '#ff8851', '#69b49d', '#ecc125']
    }],
    sizes: {
      lap: {
        width: 36,
        height: 36
      },
      baby: {
        width: 36,
        height: 60
      },
      twin: {
        width: 72,
        height: 96
      },
      full: {
        width: 84,
        height: 96
      },
      queen: {
        width: 96,
        height: 96
      },
      king: {
        width: 108,
        height: 96
      }
    },
    square: function square(x, y, fillColor, patternBlockSize) {
      return new fabric.Rect({
        left: x,
        top: y,
        fill: fillColor,
        width: patternBlockSize,
        height: patternBlockSize
      });
    },
    hstTopLeft: function hstTopLeft(x, y, fillColor, patternBlockSize) {
      var path = new fabric.Path('M ' + x + ' ' + y + ' L ' + (x + patternBlockSize) + ' ' + y + ' L ' + x + ' ' + (y + patternBlockSize) + ' z');
      path.set({ fill: fillColor });
      return path;
    },
    hstTopRight: function hstTopRight(x, y, fillColor, patternBlockSize) {
      var path = new fabric.Path('M ' + x + ' ' + y + ' L ' + (x + patternBlockSize) + ' ' + y + ' L ' + (x + patternBlockSize) + ' ' + (y + patternBlockSize) + ' z');
      path.set({ fill: fillColor });
      return path;
    },
    hstBottomLeft: function hstBottomLeft(x, y, fillColor, patternBlockSize) {
      var path = new fabric.Path('M ' + x + ' ' + y + ' L ' + (x + patternBlockSize) + ' ' + (y + patternBlockSize) + ' L ' + x + ' ' + (y + patternBlockSize) + ' z');
      path.set({ fill: fillColor });
      return path;
    },
    hstBottomRight: function hstBottomRight(x, y, fillColor, patternBlockSize) {
      var path = new fabric.Path('M ' + (x + patternBlockSize) + ' ' + y + ' L ' + (x + patternBlockSize) + ' ' + (y + patternBlockSize) + ' L ' + x + ' ' + (y + patternBlockSize) + ' z');
      path.set({ fill: fillColor });
      return path;
    },
    calculateDimensions: function calculateDimensions(quiltSize, blockSize) {
      var quiltWidth = this.get('sizes')[quiltSize].width;
      var quiltHeight = this.get('sizes')[quiltSize].height;
      var columns = quiltWidth / blockSize;
      var rows = quiltHeight / blockSize;
      var dimensions = {
        quiltWidth: quiltWidth,
        quiltHeight: quiltHeight,
        columns: columns,
        rows: rows
      };
      return dimensions;
    },
    getColorScheme: function getColorScheme(colors) {
      var schemeKeys = Object.keys(this.get('colorSchemes')[0]);
      var schemeKey = schemeKeys[Math.floor(schemeKeys.length * Math.random() * 1)];
      this.get('patternData').colorScheme = schemeKey;
      return this.get('colorSchemes')[colors - 1][schemeKey];
    },
    generatePattern: function generatePattern() {
      var quiltSize = _ember['default'].$("input:radio[name='quiltSize']:checked").val();
      var colors = _ember['default'].$("input:radio[name='colors']:checked").val();
      var blockSize = _ember['default'].$("input:radio[name='blockSize']:checked").val();

      this.prepForDrawing(quiltSize, colors, blockSize);
    },
    prepForDrawing: function prepForDrawing(quiltSize, colors, blockSize) {
      this.get('patternData').quiltSize = quiltSize;
      this.get('patternData').colors = colors;
      this.get('patternData').blockSize = blockSize;
      var dimensions = this.calculateDimensions(quiltSize, blockSize);
      var colorScheme = this.getColorScheme(colors);

      // set up canvas & patternBlockSize
      var patternCanvas = new fabric.StaticCanvas('canvas');
      patternCanvas.renderOnAddRemove = false;
      var container = _ember['default'].$('.canvas-container');
      var canvasWidth = container.width();
      var patternBlockSize = canvasWidth / dimensions.columns;
      var canvasHeight = patternBlockSize * dimensions.rows;
      patternCanvas.setDimensions({ width: canvasWidth, height: canvasHeight });

      this.drawPattern(patternCanvas, dimensions, colorScheme, patternBlockSize);
    },
    drawPattern: function drawPattern(patternCanvas, dimensions, colorScheme, patternBlockSize) {
      var x = 0;
      var y = 0;

      var blockTypes = {
        square: {
          block: this.square,
          color: colorScheme[0],
          count: 0
        },
        hstTopLeft: {
          block: this.hstTopLeft,
          color: colorScheme[1] || colorScheme[0],
          count: 0
        },
        hstTopRight: {
          block: this.hstTopRight,
          color: colorScheme[2] || colorScheme[Math.floor(Math.random() * 2)] || colorScheme[0],
          count: 0
        },
        hstBottomLeft: {
          block: this.hstBottomLeft,
          color: colorScheme[3] || colorScheme[Math.floor(Math.random() * 3)] || colorScheme[0],
          count: 0
        },
        hstBottomRight: {
          block: this.hstBottomRight,
          color: colorScheme[4] || colorScheme[Math.floor(Math.random() * 4)] || colorScheme[0],
          count: 0
        }
      };

      var blockKeys = Object.keys(blockTypes);

      for (var i = 0; i < dimensions.rows; i++) {
        for (var j = 0; j < dimensions.columns; j++) {
          var blockKey = blockKeys[Math.floor(blockKeys.length * Math.random() * 1)];
          var blockType = blockTypes[blockKey];
          // let block = blockType.block;
          patternCanvas.add(blockType.block(x, y, blockType.color, patternBlockSize));
          blockTypes[blockKey].count++;
          x += patternBlockSize;
        }
        x = 0;
        y += patternBlockSize;
      }

      patternCanvas.renderAll();

      this.get('patternData').svg = patternCanvas.toSVG();
    }
  });
});
define('quiltr/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('quiltr/router', ['exports', 'ember', 'quiltr/config/environment'], function (exports, _ember, _quiltrConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _quiltrConfigEnvironment['default'].locationType
  });

  Router.map(function () {
    this.route('sign-up');
    this.route('sign-in');
    this.route('change-password');
    this.route('users');
    this.route('patterns', { path: '/gallery' }, function () {});
    this.route('pattern', { path: '/patterns/:pattern_id' });
    this.route('project', { path: '/projects/:project_id' });
    this.route('project.edit', { path: '/projects/:project_id/edit' });
    this.route('projects');
    this.route('favorites');
    this.route('generate');
    this.route('newproject', { path: '/patterns/:pattern_id/newproject' });
    this.route('my-projects');
    this.route('faq');
  });

  exports['default'] = Router;
});
define('quiltr/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('quiltr/services/flash-messages', ['exports', 'ember-cli-flash/services/flash-messages'], function (exports, _emberCliFlashServicesFlashMessages) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberCliFlashServicesFlashMessages['default'];
    }
  });
});
define('quiltr/sign-in/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      if (this.get('auth.credentials.token')) {
        this.transitionTo('application');
      }
    },

    actions: {
      signIn: function signIn(credentials) {
        var _this = this;

        return this.get('auth').signIn(credentials)
        // .then(() => {
        //   let previousTransition = this.get('previousTransition');
        //   if (previousTransition) {
        //     this.set('previousTransition', null);
        //     previousTransition.retry();
        //   }
        //   else {
        //     this.transitionTo('application');
        //   }
        // })
        .then(function () {
          return _this.transitionTo('application');
        }).then(function () {
          return _this.get('flashMessages').success('Thanks for signing in!');
        })['catch'](function () {
          _this.get('flashMessages').danger('There was a problem. Please try again.');
        });
      }
    }
  });
});
define("quiltr/sign-in/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "quiltr/sign-in/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "auth-form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("Sign In");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        return morphs;
      },
      statements: [["inline", "sign-in-form", [], ["submit", "signIn", "reset", "reset"], ["loc", [null, [3, 2], [3, 48]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/sign-up/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    auth: _ember['default'].inject.service(),
    flashMessages: _ember['default'].inject.service(),
    beforeModel: function beforeModel() {
      if (this.get('auth.credentials.token')) {
        this.transitionTo('application');
      }
    },
    actions: {
      signUp: function signUp(credentials) {
        var _this = this;

        this.get('auth').signUp(credentials).then(function () {
          return _this.get('auth').signIn(credentials);
        }).then(function () {
          return _this.transitionTo('application');
        }).then(function () {
          _this.get('flashMessages').success('Successfully signed-up! You have also been signed-in.');
        })['catch'](function () {
          _this.get('flashMessages').danger('Your email address and username must be unique. Please try again.');
        });
      }
    }
  });
});
define("quiltr/sign-up/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 5,
            "column": 0
          }
        },
        "moduleName": "quiltr/sign-up/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1, "class", "auth-form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        var el3 = dom.createTextNode("Sign Up");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [0]), 3, 3);
        return morphs;
      },
      statements: [["inline", "sign-up-form", [], ["submit", "signUp"], ["loc", [null, [3, 2], [3, 34]]], 0, 0]],
      locals: [],
      templates: []
    };
  })());
});
define('quiltr/uploads/service', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Service.extend({
    ajax: _ember['default'].inject.service(),

    saveUpload: function saveUpload(data, endpoint) {
      return this.get('ajax').post(endpoint, {
        data: data,
        contentType: false,
        processData: false
      });
    }
  });
});
define('quiltr/user/model', ['exports', 'ember-data'], function (exports, _emberData) {
  exports['default'] = _emberData['default'].Model.extend({
    email: _emberData['default'].attr('string'),
    username: _emberData['default'].attr('string'),
    favorites: _emberData['default'].hasMany('favorites'),
    projects: _emberData['default'].hasMany('project')
  });
});
define('quiltr/users/route', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    model: function model() {
      return this.get('store').findAll('user');
    }
  });
});
define("quiltr/users/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template((function () {
    var child0 = (function () {
      return {
        meta: {
          "revision": "Ember@2.8.3",
          "loc": {
            "source": null,
            "start": {
              "line": 4,
              "column": 0
            },
            "end": {
              "line": 6,
              "column": 0
            }
          },
          "moduleName": "quiltr/users/template.hbs"
        },
        isEmpty: false,
        arity: 1,
        cachedFragment: null,
        hasRendered: false,
        buildFragment: function buildFragment(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createComment("");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
          var morphs = new Array(1);
          morphs[0] = dom.createMorphAt(dom.childAt(fragment, [1]), 0, 0);
          return morphs;
        },
        statements: [["content", "user.email", ["loc", [null, [5, 6], [5, 20]]], 0, 0, 0, 0]],
        locals: ["user"],
        templates: []
      };
    })();
    return {
      meta: {
        "revision": "Ember@2.8.3",
        "loc": {
          "source": null,
          "start": {
            "line": 1,
            "column": 0
          },
          "end": {
            "line": 8,
            "column": 0
          }
        },
        "moduleName": "quiltr/users/template.hbs"
      },
      isEmpty: false,
      arity: 0,
      cachedFragment: null,
      hasRendered: false,
      buildFragment: function buildFragment(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Users");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("ul");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment("");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      buildRenderNodes: function buildRenderNodes(dom, fragment, contextualElement) {
        var morphs = new Array(1);
        morphs[0] = dom.createMorphAt(dom.childAt(fragment, [2]), 1, 1);
        return morphs;
      },
      statements: [["block", "each", [["get", "model", ["loc", [null, [4, 8], [4, 13]]], 0, 0, 0, 0]], [], 0, null, ["loc", [null, [4, 0], [6, 9]]]]],
      locals: [],
      templates: [child0]
    };
  })());
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('quiltr/config/environment', ['ember'], function(Ember) {
  var prefix = 'quiltr';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("quiltr/app")["default"].create({"name":"quiltr","version":"0.0.0+157f29d5"});
}

/* jshint ignore:end */
//# sourceMappingURL=quiltr.map
