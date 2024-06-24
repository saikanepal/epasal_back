const moment = require('moment');

// Function to calculate the date based on the period and start date
function calculateDate(period, fromDate = moment().utcOffset('+0545')) {
    let date;
    switch (period) {
        case 'Monthly':
            date = fromDate.add(1, 'months');
            break;
        case 'Quarterly':
            date = fromDate.add(3, 'months');
            break;
        case 'Yearly':
            date = fromDate.add(1, 'years');
            break;
        default:
            return '';
    }
    return date.format();
}
function getCurrentDateTime() {
    const nepalTimeNow = moment().utcOffset('+0545');
    return nepalTimeNow.format();
}
module.exports = {
    calculateDate,
    getCurrentDateTime,
};

// // Example usage
// const nepalTimeNow = moment().utcOffset('+0545');
// console.log('Current Nepal Time:', nepalTimeNow.format());

// const monthlyDate = calculateDate('monthly');
// console.log('Monthly Date:', monthlyDate);

// const quarterlyDate = calculateDate('quarterly');
// console.log('Quarterly Date:', quarterlyDate);

// const yearlyDate = calculateDate('yearly');
// console.log('Yearly Date:', yearlyDate);

// const invalidPeriodDate = calculateDate('weekly');
// console.log('Invalid Period Date:', invalidPeriodDate);
