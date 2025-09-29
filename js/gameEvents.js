'use strict';

class GameEvent {
    static _warnedEvents = [];

    /**
     * @param {undefined | Object} payloadDefinition
     * @param {boolean} requiresListeners Will print a warning to the console when
     * an event is triggered where no _listeners have been registered.
     * @param {boolean} onetime A onetime GameEvent is only triggered once. If you subscribe to it and
     * it was already triggered, your callback will be executed immediately.
     */
    constructor(payloadDefinition, requiresListeners = true, onetime = false) {
        this._payloadDefinition = payloadDefinition;
        this._requiresListeners = requiresListeners;
        this._isOnetime = onetime;
        this._triggerCount = 0;
        this._lastPayload = undefined;
        this._listeners = [];
    }

    /**
     *
     * @param {function} callback if the callback returns a truthy value, it will be removed after it has been called once
     * @param {Object} context optional
     */
    subscribe(callback, context = undefined) {
        if (this._isOnetime && this._triggerCount > 0) {
            // One time event was already triggered - just execute
            // the callback with appropriate parameters and done
            callback.call(context, this._lastPayload);
            return;
        }

        if (isDefined(context)) {
            callback = callback.bind(context);
        }
        this._listeners.push(callback);
    }

    /**
     *
     * @param {function} callback
     */
    unsubscribe(callback) {
        if (this._isOnetime && this._triggerCount > 0) {
            warnWithStacktrace('Unsubscribed from an already triggered one-time event.');
        }

        if (!removeElement(this._listeners, callback)) {
            warnWithStacktrace('Tried to unsubscribe callback that was never subscribed.');
        }
    }

    /**
     *
     * @param {any} payload optional
     */
    trigger(payload) {
        if (this._isOnetime && this._triggerCount > 0) {
            warnWithStacktrace('Multiple triggers of "' + this.constructor.name + '".');
            return;
        }

        this._validatePayload(payload);

        this._lastPayload = payload;
        this._triggerCount++;

        if (this._listeners.length === 0) {
            if (this._requiresListeners) {
                this._warnEmptyListeners(this.constructor.name);
            }

            return;
        }

        let indexToDelete = [];
        this._listeners.forEach((listener, index) => {
            if (listener(payload)) {
                indexToDelete.push(index);
            }
        });

        indexToDelete.forEach((index) => {
            this._listeners.splice(index, 1);
        });
    }

    _validatePayload(payload) {
        validateParameter(payload, this._payloadDefinition, this);
    }

    _warnEmptyListeners(event) {
        // make sure there's only 1 warning per event
        if (!GameEvent._warnedEvents.includes(event)) {
            console.warn('No listeners for event "' + event + '"!');
            GameEvent._warnedEvents.push(event);
        }
    }
}

const GameEvents = {
    IncompatibleVersionFound: new GameEvent({
        savedVersion: JsTypes.Number,
        expectedVersion: JsTypes.Number,
    }),
    RebalancedVersionFound: new GameEvent({
        savedVersion: JsTypes.Number,
        expectedVersion: JsTypes.Number,
    }),
    NewGameStarted: new GameEvent(undefined),
    GameStateChanged: new GameEvent({
        previousState: JsTypes.String,
        newState: JsTypes.String,
    }),
    TaskActivityChanged: new GameEvent({
        type: JsTypes.String,
        name: JsTypes.String,
        newActivityState: JsTypes.Boolean,
    }),
    TaskLevelChanged: new GameEvent({
        type: JsTypes.String,
        name: JsTypes.String,
        previousLevel: JsTypes.Number,
        nextLevel: JsTypes.Number
    }, false),
    BossAppearance: new GameEvent(undefined),
};
