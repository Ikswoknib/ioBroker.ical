/* jshint -W097 */// jshint strict:false
/*jslint node: true */
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;
var setup  = require(__dirname + '/lib/setup');
var fs     = require('fs');

var objects = null;
var states  = null;
var onStateChanged = null;
var onObjectChanged = null;
var sendToID = 1;

var adapterShortName = setup.adapterName.substring(setup.adapterName.indexOf('.')+1);
var adapterShortNameLog = adapterShortName + ' Event (' + setup.getCurrentTimezoneName() + ')';

function checkConnectionOfAdapter(cb, counter) {
    counter = counter || 0;
    console.log('Try check #' + counter);
    if (counter > 30) {
        if (cb) cb('Cannot check connection');
        return;
    }

    states.getState('system.adapter.' + adapterShortName + '.0.alive', function (err, state) {
        if (err) console.error(err);
        if (state && state.val) {
            if (cb) cb();
        } else {
            setTimeout(function () {
                checkConnectionOfAdapter(cb, counter + 1);
            }, 1000);
        }
    });
}

function checkValueOfState(id, value, cb, counter) {
    counter = counter || 0;
    if (counter > 20) {
        if (cb) cb('Cannot check value Of State ' + id);
        return;
    }

    states.getState(id, function (err, state) {
        if (err) console.error(err);
        if (value === null && !state) {
            if (cb) cb();
        } else
        if (state && (value === undefined || state.val === value)) {
            if (cb) cb();
        } else {
            setTimeout(function () {
                checkValueOfState(id, value, cb, counter + 1);
            }, 500);
        }
    });
}

function sendTo(target, command, message, callback) {
    onStateChanged = function (id, state) {
        if (id === 'messagebox.system.adapter.test.0') {
            callback(state.message);
        }
    };

    states.pushMessage('system.adapter.' + target, {
        command:    command,
        message:    message,
        from:       'system.adapter.test.0',
        callback: {
            message: message,
            id:      sendToID++,
            ack:     false,
            time:    (new Date()).getTime()
        }
    });
}

function dateToString(date) {
    let m = (date.getMonth() + 1);
    if (m < 10) m = '0' + m;
    let day = date.getDate();
    if (day < 10) day = '0' + day;
    
    return (date.getYear() + 1900) + '' + m + '' + day;
}

function dateTimeToString(date) {
	let day = dateToString(date);
    let h = date.getHours();
    if (h < 10) h = '0' + h;
    let m = date.getMinutes();
    if (m < 10) m = '0' + m;
    let s = date.getSeconds();
    if (s < 10) s = '0' + s;

    return day + 'T' + h + '' + m + '' + s;
}

function setupIcsFiles() {
    let now = new Date();

    let last5Min = new Date(now.getTime() - (5 * 60 * 1000));
    let next5Min = new Date(now.getTime() + (5 * 60 * 1000));
    let next10Min = new Date(now.getTime() + (10 * 60 * 1000));
    let next11Min = new Date(now.getTime() + (11 * 60 * 1000));

    let nextDay = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    nextDay.setHours(0, 0, 0, 0);
    let nextDay1 = new Date(nextDay.getTime() + (24 * 60 * 60 * 1000));
    let nextDay2 = new Date(nextDay1.getTime() + (24 * 60 * 60 * 1000));
    let nextDay3 = new Date(nextDay2.getTime() + (24 * 60 * 60 * 1000));
    let nextDay4 = new Date(nextDay3.getTime() + (24 * 60 * 60 * 1000));
    let nextDay5 = new Date(nextDay4.getTime() + (24 * 60 * 60 * 1000));
    let yesterday = new Date(nextDay.getTime() - (2 * 24 * 60 * 60 * 1000));

    let last5MinT = dateTimeToString(last5Min);
    let next5MinT = dateTimeToString(next5Min);
    let next10MinT = dateTimeToString(next10Min);
    let next11MinT = dateTimeToString(next11Min);
    let nextDayT = dateToString(nextDay);
    let nextDayT1 = dateToString(nextDay1);
    let nextDayT2 = dateToString(nextDay2);
    let nextDayT3 = dateToString(nextDay3);
    let nextDayT4 = dateToString(nextDay4);
    let nextDayT5 = dateToString(nextDay5);
    let yesterdayT = dateToString(yesterday);
    
    let data = fs.readFileSync(__dirname + '/data/calender_head_template.ics').toString();

    // EventThreeDays
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + yesterdayT + '\n';
    data += 'DTEND;VALUE=DATE:' + nextDayT1 + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f5261@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventThreeDays\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventThreeDays\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';
    
    // EventNow
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + last5MinT + '\n';
    data += 'DTEND;VALUE=DATE:' + next5MinT + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f561@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventNow\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventNow\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    // EventDisabled
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + last5MinT + '\n';
    data += 'DTEND;VALUE=DATE:' + next5MinT + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f562@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventDisabled\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventDisabled\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    // EventLater
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + next10MinT + '\n';
    data += 'DTEND;VALUE=DATE:' + next11MinT + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f563@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventLater\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventLater\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    // EventNextDay1
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + nextDayT + '\n';
    data += 'DTEND;VALUE=DATE:' + nextDayT1 + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f642@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventNextDay1\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventNextDay1\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    // EventNextDay2
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + nextDayT1 + '\n';
    data += 'DTEND;VALUE=DATE:' + nextDayT2 + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f625@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventNextDay2\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventNextDay2\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    // EventNextDay3
    data += 'BEGIN:VEVENT\n';
    data += 'DTSTART;VALUE=DATE:' + nextDayT2 + '\n';
    data += 'DTEND;VALUE=DATE:' + nextDayT3 + '\n';
    data += 'DTSTAMP:20111213T124028Z\n';
    data += 'UID:2fb00ad3a214f7369e7a95f626@calendarlabs.com\n';
    data += 'CREATED:20111213T123901Z\n';
    data += 'DESCRIPTION:EventNextDay3\n';
    data += 'LAST-MODIFIED:20111213T123901Z\n';
    data += 'LOCATION:\n';
    data += 'SEQUENCE:0\n';
    data += 'STATUS:CONFIRMED\n';
    data += "SUMMARY:EventNextDay3\n";
    data += 'TRANSP:TRANSPARENT\n';
    data += 'END:VEVENT\n';

    data += 'END:VCALENDAR\n';
    fs.writeFileSync(__dirname + '/data/events.ics', data);
}

describe('Test ' + adapterShortNameLog + ' adapter', function() {
    before('Test ' + adapterShortNameLog + ' adapter: Start js-controller', function (_done) {
        this.timeout(600000); // because of first install from npm

        setupIcsFiles();

        setup.setupController(function () {
            var config = setup.getAdapterConfig();
            // enable adapter
            config.common.enabled  = true;
            config.common.loglevel = 'silly';

            config.native.daysPreview = 2;
            config.native.fulltime = "";
            config.native.forceFullday = false;
            config.native.replaceDates = false;
            config.native.hideYear = true;
            config.native.calendars[0] = {
                "name": "event-calendar",
                "url": __dirname + '/data/events.ics',
                "user": "username",
                "pass": "password",
                "sslignore": "ignore",
                "color": "red"
            };

            config.native.events = [
            	{"name": "EventThreeDays", "enabled": true, "display": true},
            	{"name": "EventNow", "enabled": true, "display": true},
	            {"name": "EventDisabled", "enabled": false, "display": true},
	            {"name": "EventLater", "enabled": true, "display": true},
	            {"name": "EventNextDay1", "enabled": true, "display": true},
	            {"name": "EventNextDay2", "enabled": true, "display": true},
	            {"name": "EventNextDay3", "enabled": true, "display": true}
            ];

            setup.setAdapterConfig(config.common, config.native);

            setup.startController(true, function(id, obj) {}, function (id, state) {
                    if (onStateChanged) onStateChanged(id, state);
                },
                function (_objects, _states) {
                    objects = _objects;
                    states  = _states;
                    _done();
                });
        });
    });

    it('Test ' + adapterShortNameLog + ' adapter: Check if adapter started', function (done) {
        this.timeout(60000);
        checkConnectionOfAdapter(function (res) {
            if (res) console.log(res);
            expect(res).not.to.be.equal('Cannot check connection');
            objects.setObject('system.adapter.test.0', {
                    common: {

                    },
                    type: 'instance'
                },
                function () {
                    states.subscribeMessage('system.adapter.test.0');
                    done();
                });
        });
    });

    it('Test ' + adapterShortNameLog + ': check count of events', function (done) {
        this.timeout(5000);
        setTimeout(function () {
            states.getState('ical.0.data.count', function (err, state) {
                expect(err).to.be.not.ok;
                expect(state.val).to.be.equal(4);
                done();
            });
        }, 1000);
    });

    it('Test ' + adapterShortNameLog + ': check count of tomorrow events', function (done) {
        this.timeout(5000);
        setTimeout(function () {
            states.getState('ical.0.data.countTomorrow', function (err, state) {
                expect(err).to.be.not.ok;
                expect(state.val).to.be.equal(2);
                done();
            });
        }, 1000);
    });

    let tests = [
    	{name: 'ical.0.events.0.later.EventThreeDays', value: false},
    	{name: 'ical.0.events.0.today.EventThreeDays', value: true},
    	{name: 'ical.0.events.0.now.EventThreeDays', value: true},
    	{name: 'ical.0.events.1.EventThreeDays', value: true},
    	{name: 'ical.0.events.2.EventThreeDays', value: false},
    	{name: 'ical.0.events.0.later.EventNow', value: false},
    	{name: 'ical.0.events.0.today.EventNow', value: true},
    	{name: 'ical.0.events.0.now.EventNow', value: true},
    	{name: 'ical.0.events.1.EventNow', value: false},
    	{name: 'ical.0.events.2.EventNow', value: false},
    	{name: 'ical.0.events.0.later.EventDisabled', value: undefined},
    	{name: 'ical.0.events.0.today.EventDisabled', value: undefined},
    	{name: 'ical.0.events.0.now.EventDisabled', value: undefined},
    	{name: 'ical.0.events.1.EventDisabled', value: undefined},
    	{name: 'ical.0.events.2.EventDisabled', value: undefined},
    	{name: 'ical.0.events.0.later.EventLater', value: true},
    	{name: 'ical.0.events.0.today.EventLater', value: true},
    	{name: 'ical.0.events.0.now.EventLater', value: false},
    	{name: 'ical.0.events.1.EventLater', value: false},
    	{name: 'ical.0.events.2.EventLater', value: false},
    	{name: 'ical.0.events.0.later.EventNextDay1', value: false},
    	{name: 'ical.0.events.0.today.EventNextDay1', value: false},
    	{name: 'ical.0.events.0.now.EventNextDay1', value: false},
    	{name: 'ical.0.events.1.EventNextDay1', value: true},
    	{name: 'ical.0.events.2.EventNextDay1', value: false},
    	{name: 'ical.0.events.0.later.EventNextDay2', value: false},
    	{name: 'ical.0.events.0.today.EventNextDay2', value: false},
    	{name: 'ical.0.events.0.now.EventNextDay2', value: false},
    	{name: 'ical.0.events.1.EventNextDay2', value: false},
    	{name: 'ical.0.events.2.EventNextDay2', value: true},
    	{name: 'ical.0.events.0.later.EventNextDay3', value: false},
    	{name: 'ical.0.events.0.today.EventNextDay3', value: false},
    	{name: 'ical.0.events.0.now.EventNextDay3', value: false},
    	{name: 'ical.0.events.1.EventNextDay3', value: false},
    	{name: 'ical.0.events.2.EventNextDay3', value: false}
    ];

    for(let i = 0;i < tests.length; i++) {
	    it('Test ' + adapterShortNameLog + ': event ' + tests[i].name, function (done) {
	        this.timeout(5000);
	        setTimeout(function () {
	            states.getState(tests[i].name, function (err, state) {
	                expect(err).to.be.not.ok;
	                if (tests[i].value === undefined) {
	                	expect(state).to.be.undefined;
	                } else {
	                	expect(state.val).to.be.equals(tests[i].value);
	                }
	                done();
	            });
	        }, 1000);
	    });
    }

    after('Test ' + adapterShortNameLog + ' adapter: Stop js-controller', function (done) {
        this.timeout(10000);

        setup.stopController(function (normalTerminated) {
            console.log('Adapter normal terminated: ' + normalTerminated);
            done();
        });
    });
});