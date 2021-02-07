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
 * Compute the complete log preamble from all the log preamble entries and write to the log given the given log function
 * (logFn). The log function can be anything but will usually be "console.log", "console.info", "console.warn", "console.error" etc,
 *
 * This is meant to only be called from "myLog" and "myLogError"
 */
function _myLog(logFn, ...args) {

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
function myLog() {
    _myLog(console.log, ...arguments)
}

function myLogWarn() {
    _myLog(console.warn, ...arguments)
}

function myLogError() {
    _myLog(console.error, ...arguments)
}