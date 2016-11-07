import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
});

Router.map(function () {
  this.route('sign-up');
  this.route('sign-in');
  this.route('change-password');
  this.route('users');
  this.route('patterns', { path: '/gallery' });
  this.route('pattern', { path: '/gallery/:pattern_id' });
  this.route('project', { path: '/project/:project_id' });
  this.route('projects');
  this.route('favorites');
  this.route('favorite', { path: '/favorites/:favorite_id' });
  this.route('generate');
});

export default Router;
