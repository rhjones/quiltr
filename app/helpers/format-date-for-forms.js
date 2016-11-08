import Ember from 'ember';
/* global moment */


export function formatDateForForms(params/*, hash*/) {
  let date = new Date(params[0]);
  let wrapper = moment(date);
  return wrapper.format('YYYY-MM-DD');
}

export default Ember.Helper.helper(formatDateForForms);

