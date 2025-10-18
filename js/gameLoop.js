'use strict';

const GameLoopState = {
    STOPPED: 'STOPPED',
    PAUSED: 'PAUSED',
    RUNNING: 'RUNNING',
};

/**
 * A game loop management class.
 * Takes care of:
 * - dedicated timers for rendering vs logic
 * - catch up in case of lags or browser throttle
 * - repeating updates instead of timeDeltas (fixed step updates + accumulator pattern)
 *
 * Not included currently
 * - optional offline progress
 *
 * Known issue cases:
 * - Firefox on Android unloads the tab after some time --> when it's reloaded, no progress will be made
 *
 * @see https://gist.github.com/HipHopHuman/3e9b4a94b30ac9387d9a99ef2d29eb1a
 */
class GameLoop {
    /**
     * @param {{
     *     targetTicksPerSecond: number,
     *     maxUpdatesPerTick: number,
     *     immediateTick: boolean,
     *     onUpdate: function(deltaTime: number, totalTime: number, isLastUpdateInTick: boolean, gameLoop: GameLoop),
     *     onRender: function(interpolationFactor: number, gameLoop: GameLoop),
     *     onPanic: function(gameLoop: GameLoop),
     * }} options <ul>
     *     <li>targetTicksPerSecond: defaults to 60</li>
     *     <li>maxUpdatesPerTick: defaults to 300 (so up to 5mins) are caught up</li>
     *     <li>immediateTick: defaults to false. If true, a tick will be executed before
     *         waiting for the next animation frame.</li>
     *     <li>onUpdate: defaults to no-op</li>
     *     <li>onRender: defaults to no-op</li>
     *     <li>onPanic: defaults to no-op</li>
     *   </ul>
     */
    constructor(options = {}) {
        /**
         * @type {GameLoopState.STOPPED|GameLoopState.PAUSED|GameLoopState.RUNNING}
         */
        this.state = GameLoopState.STOPPED;

        /**
         * @type {{
         *     targetTicksPerSecond: number,
         *     maxUpdatesPerTick: number,
         *     immediateTick: boolean,
         *     onUpdate: function(number, number, boolean, GameLoop),
         *     onRender: function(number, GameLoop),
         *     onPanic: function(GameLoop)
         * }}
         */
        this.options = Object.assign({
            targetTicksPerSecond: 60,
            maxUpdatesPerTick: 300,
            immediateTick: false,
            onUpdate: () => {},
            onRender: () => {},
            onPanic: () => {},
        }, options);

        /**
         * @type {number}
         */
        this.step = 1000 / this.options.targetTicksPerSecond;

        this.tick = this.tick.bind(this);
        this.render = this.render.bind(this);
    }

    get isStopped() {
        return this.state === GameLoopState.STOPPED;
    }

    get isPaused() {
        return this.state === GameLoopState.PAUSED;
    }

    get isRunning() {
        return this.state === GameLoopState.RUNNING;
    }

    start() {
        if (!this.isStopped) return;

        this.state = GameLoopState.RUNNING;
        const lag = 0;
        const delta = 0;
        const total = 0;
        const last = null;
        this.timing = {last, total, delta, lag};
        if (this.options.immediateTick) {
            this.tick(performance.now());
        }
        this.frame = setInterval(this.tick, this.step);
        this.renderFrame = requestAnimationFrame(this.render);
    }

    stop() {
        if (this.isRunning || this.isPaused) {
            this.state = GameLoopState.STOPPED;
            clearInterval(this.frame);
            cancelAnimationFrame(this.renderFrame);
        }
    }

    pause() {
        if (this.isRunning) {
            this.state = GameLoopState.PAUSED;
            clearInterval(this.frame);
            cancelAnimationFrame(this.renderFrame);
        }
    }

    resume() {
        if (this.isPaused) {
            this.state = GameLoopState.RUNNING;
            this.frame = setInterval(this.tick, this.step);
            this.renderFrame = requestAnimationFrame(this.render);
        }
    }

    tick(time) {
        if (this.state !== GameLoopState.RUNNING) return;

        if (isUndefined(time)) {
            time = performance.now();
        }
        if (this.timing.last === null) this.timing.last = time;
        this.timing.delta = time - this.timing.last;
        this.timing.total += this.timing.delta;
        this.timing.lag += this.timing.delta;
        this.timing.last = time;

        let numberOfUpdates = 0;

        while (this.timing.lag >= this.step) {
            this.timing.lag -= this.step;
            this.options.onUpdate(this.step, this.timing.total, this.timing.lag < this.step, this);

            // Game loop state might have changed
            if (this.state !== GameLoopState.RUNNING) break;

            numberOfUpdates++;
            if (numberOfUpdates >= this.options.maxUpdatesPerTick) {
                this.options.onPanic(this);
                break;
            }
        }

        // console.log('[GameLoop] Tick', {
        //     delta: Math.round(this.timing.delta),
        //     lag: Math.round(this.timing.lag),
        // });

        if (numberOfUpdates > 3) {
            console.log('[GameLoop] Tick number of updates', numberOfUpdates);
        }

    }

    render() {
        if (this.state !== GameLoopState.RUNNING) return;

        // TODO no interpolation support currently
        this.options.onRender(1, this);

        this.renderFrame = requestAnimationFrame(this.render);
    }
}
