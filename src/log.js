/*
 * A logging framework (Yikes! But remember, it's for fun and self-learning!) that keeps track of contextual metadata
 * called "log preambles" that will be logged as a prefix to each log. The completed preambles are placed in brackets.
 * For example, take this log output:
 *
 *     [ConfigurationListing] an instrumented version of "componentDidUpdate" was invoked.
 *     [ConfigurationListing|tetherElements] This component has already executed the tethering process. Skipping it.
 *     [SourceBrowser] "componentDidUpdate" was accessed. Instrumenting a pointcut/aspect around it
 *
 * The log preamble gives you some contextual clues to help you trace the execution of the code.
 */

/*
 * A "context map" that will be logged by the shim to help give context to log statements. This is like Logback's
 * Mapped Diagnostic Context (MDC) except much less feature-ful.
 */
let logPreambles = new Map()

/*
 * The next ID value to use when a logPreamble is added
 */
let logPreamblesNextId = 0

/*
 * Add a log preamble if it doesn't already exist. Returns an identifier for this preamble so that a later call to
 * removeLogPreamble can delete the specific entry. It's not enough to use the log preamble string value itself for identifying
 * "what to delete" because duplicates log preambles are allowed of the same value. We need a unique identifier, so we'll use
 * an always increasing number.
 */
function addLogPreamble(preamble) {
    let id = logPreamblesNextId
    logPreamblesNextId++
    logPreambles.set(id, preamble)
    return id
}

function removeLogPreamble(id) {
    let deleted = logPreambles.delete(id)
    if (!deleted) throw new Error(`Failed to delete a log preamble! Something is wrong. Check the key (${id})`)
}

/*
 * Note: lower levels are more verbose. (I always have a hard time remember if "lower" or "higher" means "more" logs or "fewer" logs...)
 */
let logLevels = {
    "debug": {
        rank: 0,
        logFn: console.info // I don't know how the actual browser log levels can be configured so I'm making my own and coding the "info" level even for debug logs.
    },
    "info": {
        rank: 1,
        logFn: console.info
    },
    "warn": {
        rank: 2,
        logFn: console.warn
    },
    "error": {
        rank: 3,
        logFn: console.error
    }
}

let configuredLogLevelRank = logLevels[window.config.logLevel].rank
console.log(`The current log level is '${window.config.logLevel}' consider lowering it for more logs or raising it for fewer logs.`)

/*
 * Compute the complete log preamble from all the log preamble entries and write to the log given the given log function
 * (logFn). The log function can be anything but will usually be "console.log", "console.info", "console.warn", "console.error" etc,
 *
 * This is not meant to be called directly but instead should only be called by the public interface methods: "myLog", "myLogError", etc.
 */
function _myLog(logLevelDescriptor, ...args) {

    let logLevel = logLevels[logLevelDescriptor]
    let logFn = logLevel.logFn

    if (configuredLogLevelRank > logLevel.rank) {
        // Skip the log. The configured log level rank is too high. This log statement should be filtered out.
        return
    }


    if (logPreambles.size === 0) {
        logFn(...args)
    } else {
        let seenUnordered = new Set()
        let toLogOrdered = []
        for (let [id, preamble] of logPreambles) {
            if (seenUnordered.has(preamble)) {
                // skip
            } else {
                seenUnordered.add(preamble)
                toLogOrdered.push(preamble)
            }
        }
        let completedPreamble = `[${toLogOrdered.join('|')}]`
        logFn(completedPreamble, ...args)
    }
}

/*
 * Public Interface.
 *
 * Wrappers for "console.log", "console.warn", "console.error" etc that will do the log and also prepend
 * the log preambles data if it exists.
 */
function myLogDebug() {
    _myLog("debug", ...arguments)
}

function myLog() {
    _myLog("info", ...arguments)
}

function myLogWarn() {
    _myLog("warn", ...arguments)
}

function myLogError() {
    _myLog("error", ...arguments)
}