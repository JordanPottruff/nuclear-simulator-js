/**
 * @callback executionCallback
 * @param {number} timeMillis - the absolute time, in milliseconds, of when this
 * event is being executed.
 */

/**
 * @callback validationCallback - a function that, immediately prior to
 * execution, returns true if execution should proceed and false if the event
 * should no longer be executed.
 * @returns {boolean} - whether the event should be executed.
 */

/**
 * An event that takes place in the future.
 *
 * @property {number} timeDelayMillis - the time in milliseconds until the event
 * occurs.
 * @property {validationCallback} validationFn - the function for determining
 * whether execution should proceed. Checked immediately before execution.
 * @property {executionCallback} executionFn - the business logic to execute
 * after the given delay, only if the validation check passes.
 * @property {boolean} isRealTime - whether the event should be executed at its
 * real, absolute time. A false value implies that execution can be performed
 * as fast as possible.
 */
export class ScheduledEvent {
  constructor(timeDelayMillis, validationFn, executionFn, isRealTime) {
    this.timeDelayMillis = timeDelayMillis;
    this.validationFn = validationFn;
    this.executionFn = executionFn;
    this.isRealTime = isRealTime;
  }
}
