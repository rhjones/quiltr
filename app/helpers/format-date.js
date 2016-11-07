import Ember from 'ember';

export function formatDate(params) {
  let date = new Date(params[0]);
  let wrapper = moment(date);
  return wrapper.format('MMMM D, YYYY');
}

export default Ember.Helper.helper(formatDate);