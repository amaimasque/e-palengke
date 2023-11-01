import moment from 'moment';

function formatDate(date, specificFormat = null) {
  return moment(date).format(specificFormat);
}

function toProperCase(string) {
  return string.replace(/\w\S*/g, function (string) {
    return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
  });
};

function generateID() {
  return '_' + Math.random().toString(36).substr(2, 9);
};

export default {
  formatDate,
  generateID,
  toProperCase,
}