'use strict'
const {timedEventBuilder} = require('./timed-event');
const {loggerBuilder, logLevels} = require("../../logging");
const log = loggerBuilder()
                        .name('timers builder')
                        .level(logLevels.INFO)
                    .build();

function initializeTimers(inputs){
    let {parsedConf, featureStore} = inputs;

    if (parsedConf !== undefined) {
        let {schedule} = parsedConf;

        let timedEvents = {};

        for (let timerName in schedule){
            let {alias, call, period} = schedule[timerName];

            let scheduledPeriodicCall = featureStore.featureFunctions[call];
            if ( scheduledPeriodicCall !== undefined){

                log.info(`new timer ${timerName}`);

                timedEvents[timerName] = timedEventBuilder()
                                                        .name(timerName)
                                                        .alias(alias)
                                                        .call(scheduledPeriodicCall)
                                                        .period(period)
                                                    .build();
            }
        }

        return {
            timers: timedEvents
        }
    } else {
        return {
            error: `no parsed conf provided`
        }
    }
}

function startTimers(inputs){

    log.info(`starting timers...`);

    let {timers} = inputs;

    for (let timerName in timers){
        timers[timerName].start();
    }

    log.info(`all timers started`);
}

module.exports = {
    initializeTimers,
    startTimers
}
