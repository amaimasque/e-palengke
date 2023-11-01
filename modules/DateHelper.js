var moment = require('moment');

function getDate(date, specifiedFormat = null, toFormat = null) {
  return moment(date, specifiedFormat).format(toFormat);
}

function timestampToTime(timestamp) {
  // var timestamp = moment.unix(timestamp);
  let date = new Date(timestamp).toString();
  // let date = timestamp.format("MM/DD/YYYY HH/mm/ss");
  return moment(date).fromNow();
  // return date;
}
export default {getDate, timestampToTime};
