import Ember from 'ember';
/* global moment */


export function formatDateForForms(params/*, hash*/) {
  if (params[0]) {
    let date = new Date(params[0]);
    let wrapper = moment(date);
    return wrapper.format('YYYY-MM-DD');
  }
  return '';
}

export default Ember.Helper.helper(formatDateForForms);

