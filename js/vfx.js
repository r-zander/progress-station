/*
 * The VFX Module.
 *
 * - it has knowledge about the game and the game's DOM
 * - it's written in a plug&play fashion - non-VFX code may only call the well-defined public interface
 * - the code is set up with a focus on performance, not readability or normalization
 */

function randomSize(factor = 4) {
    let rnd = randomInt(1 + factor + factor * factor + factor * factor * factor);
    if (rnd < 1) {
        return 3;
    }

    if (rnd < 1 + factor) {
        return 2;
    }

    if (rnd < 1 + factor + factor * factor) {
        return 1;
    }

    return 0;
}

const addedCssClass = Symbol('addedCssClass');

/**
 * @typedef {Object} ParticleBehavior
 * @property {function(HTMLElement): HTMLElement|null} findFreeElement
 * @property {function(): HTMLElement} createNewElement
 * @property {function(HTMLElement, any)} prepareElement
 * @property {function(HTMLElement)} scheduleRelease
 * @property {function(HTMLElement, HTMLElement)} [appendElement]
 */

/**
 * @type {ParticleBehavior & {_onAnimationEnd: function(AnimationEvent)}}
 */
const FlashBehavior = {
    findFreeElement: (parent) => {
        return Dom.get(parent).bySelector('.vfx.flash.free');
    },

    createNewElement: () => {
        return Dom.new.fromHtml('<div class="vfx flash"></div>');
    },

    prepareElement: (element, baseColor) => {
        if (isDefined(baseColor)) {
            element.style.color = baseColor;
        } else {
            element.style.removeProperty('color');
        }
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', FlashBehavior._onAnimationEnd, {passive: true});
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        if (event.animationName !== 'flash') return;

        const currentTarget = event.currentTarget;
        XFastdom.mutate(() => {
            currentTarget.classList.add('free');
        });
        currentTarget.removeEventListener('animationend', FlashBehavior._onAnimationEnd);
    },
};

/**
 * @type {ParticleBehavior & {_onAnimationEnd: function(AnimationEvent)}}
 */
const SplashParticleBehavior = {
    findFreeElement: (parent) => {
        return Dom.get(parent).bySelector('.vfx.splash-particle-wrapper.free');
    },

    createNewElement: () => {
        return Dom.new.fromHtml('<div class="vfx splash-particle-wrapper"><div class="particle"></div></div>');
    },

    prepareElement: (element, styleObject) => {
        element.style.rotate = (randomInt(120) - 60) + 'deg';
        for (const property in styleObject) {
            const value = styleObject[property];
            if (isFunction(value)) {
                element.style.setProperty(property, value());
            } else {
                element.style.setProperty(property, value);
            }
        }
        const childElement = element.children.item(0);
        const cssClass = 'size' + randomSize(3);
        childElement.classList.add(cssClass);
        childElement[addedCssClass] = cssClass;
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', SplashParticleBehavior._onAnimationEnd, {passive: true});
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        if (event.animationName !== 'fade-out') return;

        const currentTarget = event.currentTarget;
        XFastdom.mutate(() => {
            currentTarget.removeAttribute('style');
            currentTarget.classList.add('free');
            const childElement = currentTarget.children.item(0);
            childElement.classList.remove(childElement[addedCssClass]);
        });
        currentTarget.removeEventListener('animationend', SplashParticleBehavior._onAnimationEnd);
    },
};

/**
 * @type {ParticleBehavior & {_onAnimationEnd: function(AnimationEvent)}}
 */
const ProgressParticleBehavior = {
    findFreeElement: (parent) => {
        return Dom.get(parent).bySelector('.vfx.progress-particle-wrapper.free');
    },

    createNewElement: () => {
        return Dom.new.fromHtml('<div class="vfx progress-particle-wrapper"><div class="particle"></div></div>');
    },

    prepareElement: (element, parentHeight) => {
        element.style.rotate = randomInt(360) + 'deg';
        element.style.top = randomInt(parentHeight) + 'px';
        const childElement = element.children.item(0);
        const cssClass = 'size' + randomSize();
        childElement.classList.add(cssClass);
        childElement[addedCssClass] = cssClass;
        // childElement.style.animationPlayState = 'running';
    },

    scheduleRelease: (element) => {
        // FIXME there was a leak here - some elements don't start their animation, thus never end/cancel it and become stuck
        // element.addEventListener('animationend', ProgressParticleBehavior._onAnimationEnd, {passive: true});
        setTimeout(ProgressParticleBehavior._onAnimationEnd, 800, {
            currentTarget: element,
            animationName: 'shoot0',
        });
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        switch (event.animationName) {
            case 'shoot0':
            case 'shoot1':
            case 'shoot2':
            case 'shoot3':
                break;
            default:
                console.log('Ignored animation', event.animationName);
                return;
        }

        // const currentTarget = event.currentTarget;
        XFastdom.mutate(((currentTarget) => {
            const childElement = currentTarget.children.item(0);
            childElement.classList.remove(childElement[addedCssClass]);
            // childElement.style.animationPlayState = 'paused';
            currentTarget.classList.add('free');
        }).bind(this, event.currentTarget));
        event.currentTarget.removeEventListener('animationend', ProgressParticleBehavior._onAnimationEnd);
    },
};

/**
 * @type {ParticleBehavior & {_onAnimationEnd: function(AnimationEvent)}}
 */
const BattleProgressParticleBehavior = {
    findFreeElement: (parent) => {
        return Dom.get(parent.parentElement).bySelector('.vfx.battle-progress-particle-wrapper.free');
    },

    createNewElement: () => {
        return Dom.new.fromHtml('<div class="vfx battle-progress-particle-wrapper"><div class="particle"></div></div>');
    },

    /**
     * @param element
     * @param {{
     *     left: string,
     *     parentHeight: number
     * }} parameters
     */
    prepareElement: (element, parameters) => {
        element.style.rotate = (randomInt(30) - 15) + 'deg';
        element.style.top = randomInt(parameters.parentHeight) + 'px';
        element.style.left = parameters.left;
        const childElement = element.children.item(0);
        const cssClass = 'size' + randomSize();
        childElement.classList.add(cssClass);
        childElement[addedCssClass] = cssClass;
    },

    scheduleRelease: (element) => {
        // FIXME there was a leak here - some elements don't start their animation, thus never end/cancel it and become stuck
        // element.addEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd, {passive: true});
        setTimeout(BattleProgressParticleBehavior._onAnimationEnd, 800, {
            currentTarget: element,
            animationName: 'shoot0',
        });
    },

    appendElement: (parent, element) => {
        parent.insertAdjacentElement('afterend', element);
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        switch (event.animationName) {
            case 'shoot0':
            case 'shoot1':
            case 'shoot2':
            case 'shoot3':
                break;
            default:
                return;
        }

        const currentTarget = event.currentTarget;
        XFastdom.mutate(() => {
            currentTarget.classList.add('free');
            const childElement = currentTarget.children.item(0);
            childElement.classList.remove(childElement[addedCssClass]);
        });
        currentTarget.removeEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd);
    },
};

class VFX {

    /**
     * @param {HTMLElement} parent
     * @param {ParticleBehavior} behavior
     * @param {any} parameters
     */
    static #startParticle(parent, behavior, parameters) {
        if (document.hidden) return;

        XFastdom.mutate(() => {

            // Find unused particle element in parent
            let element = behavior.findFreeElement(parent);

            // If nothing found ...
            if (element === null) {
                // ... create new flash element
                element = behavior.createNewElement();

                if (isFunction(behavior.appendElement)) {
                    behavior.appendElement(parent, element);
                } else {
                    // append to parent
                    parent.append(element);
                }
            } else {
                // ... else: mark as in-use
                element.classList.remove('free');
            }

            // Modify element according to parameters
            behavior.prepareElement(element, parameters);

            // schedule release of element after animation is done
            behavior.scheduleRelease(element);
        });

        // Do not return the element - the VFX is system is considered closed and internal workings should not be exposed
    }

    /**
     * @param {HTMLElement} parent
     * @param {number} numberOfParticles
     * @param {Object<function():string|string>} styleObject
     */
    static #onetimeSplash(parent, numberOfParticles, styleObject) {
        for (let i = 0; i < numberOfParticles; i++) {
            this.#startParticle(parent, SplashParticleBehavior, styleObject);
        }
    }

    /**
     * @param {HTMLElement} parent
     * @param {number} numberOfParticles
     * @param {'left'|'right'} direction
     */
    static onetimeSplash(parent, numberOfParticles, direction) {
        XFastdom.measure(() => {
            return parent.clientHeight;
        }).then((height) => {
            this.#onetimeSplash(
                parent,
                numberOfParticles,
                {
                    top: () => gaussianRandomInt(0, height) + 'px',
                    [direction]: '0',
                },
            );
        });
    }

    static flash(parent, baseColor = undefined) {
        this.#startParticle(parent, FlashBehavior, baseColor);
    }

    static progressFollow = {
        animationFrameRequestID: undefined,
        lastUpdate: undefined,
        sinceLastParticle: undefined,
        general: {
            sinceLastParticle: 0,
            particleDelay: 64, // ms
            elementHeight: 30,
        },
        battles: {
            sinceLastParticle: 0,
            particleDelay: 128, // ms
            elementHeight: 30,
        },
    };

    static followProgressBars(enabled = true) {
        if (!enabled) {
            cancelAnimationFrame(VFX.progressFollow.animationFrameRequestID);
            return;
        }

        const update = (updateTime) => {
            const timeDelta = updateTime - VFX.progressFollow.lastUpdate;
            VFX.progressFollow.lastUpdate = updateTime;


            if (document.hidden) {
                // Game's paused or the tab is not visible --> no need for any VFX
                VFX.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
                return;
            }

            if (gameData.state.areTasksProgressing) {
                VFX.progressFollow.general.sinceLastParticle += timeDelta;
                if (VFX.progressFollow.general.sinceLastParticle >= VFX.progressFollow.general.particleDelay) {
                    let selector = '.operationQuickDisplay.progressFill.current';
                    if (gameData.selectedTab === 'modules') {
                        selector += ', .moduleOperation.progressFill.current';
                    }
                    document.querySelectorAll(selector).forEach((element) => {
                        // Is the element itself or any parent "hidden"?
                        if (element.closest('.hidden') !== null) {
                            return;
                        }

                        if (VFX.progressFollow.general.elementHeight === undefined || VFX.progressFollow.general.elementHeight === 0) {
                            return XFastdom.measure(() => {
                                console.log('Measure general progress clientHeight');
                                return element.parentElement.clientHeight;
                            }).then((elementHeight) => {
                                VFX.progressFollow.general.elementHeight = elementHeight;
                                this.#startParticle(element, ProgressParticleBehavior, elementHeight);
                            });
                        } else {
                            this.#startParticle(element, ProgressParticleBehavior, VFX.progressFollow.general.elementHeight);
                        }
                    });
                    VFX.progressFollow.general.sinceLastParticle = 0;
                }
            }

            VFX.progressFollow.battles.sinceLastParticle += timeDelta;
            if (VFX.progressFollow.battles.sinceLastParticle >= VFX.progressFollow.battles.particleDelay) {
                let selector = '.battleQuickDisplay.progressFill.current';
                if (gameData.selectedTab === 'battles') {
                    selector += ', .battleProgress.progressFill.current';
                }

                document.querySelectorAll(selector).forEach((element) => {
                    // Is the element itself or any parent "hidden"?
                    if (element.closest('.hidden') !== null) {
                        return;
                    }

                    if (element.classList.contains('bossBattle')) {
                        if (!gameData.state.isBossBattleProgressing) {
                            return;
                        }
                    } else if (!gameData.state.areTasksProgressing) {
                        return;
                    }

                    XFastdom.measure(() => {
                        if (VFX.progressFollow.battles.elementHeight === undefined || VFX.progressFollow.battles.elementHeight === 0) {
                            VFX.progressFollow.battles.elementHeight = element.parentElement.clientHeight;
                        }
                        return {
                            left: element.style.width,
                            parentHeight: VFX.progressFollow.battles.elementHeight,
                        };
                    }).then((parameters) => {
                        this.#startParticle(element, BattleProgressParticleBehavior, parameters);
                    });
                });
                VFX.progressFollow.battles.sinceLastParticle = 0;
            }

            VFX.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
        };

        VFX.progressFollow.lastUpdate = performance.now();
        VFX.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
    }

    static #playButtonShakeTimeout;

    static shakePlayButton() {
        this.shakeElement(Dom.get().byId('pauseButton'), 'pauseButton');
    }

    static #shakeTimeouts = {};

    /**
     *
     * @param {HTMLElement} element
     * @param {string} identifier identifies this shake - if another shake with the same identifier is started,
     *                            the ongoing shake is extended.
     * @param {number} [duration = 150] milliseconds
     */
    static shakeElement(element, identifier, duration = 150) {
        clearTimeout(VFX.#shakeTimeouts[identifier]);
        element.classList.add('shake-strong-tilt-move');
        VFX.#shakeTimeouts[identifier] = setTimeout(() => {
            element.classList.remove('shake-strong-tilt-move');
        }, duration);
    }

    /**
     * @param {HTMLElement} element
     * @param {string} animationCssClass
     * @param {string} animationName
     */
    static highlightText(element, animationCssClass, animationName) {
        const callback = (ev) => {
            if (ev.animationName === animationName) {
                element.removeEventListener('animationend', callback);
            }
            element.classList.remove(animationCssClass);
        };
        element.addEventListener('animationend', callback);
        element.classList.add(animationCssClass);
    }
}

if (isBoolean(gameData.settings.vfx.followProgressBars)) {
    VFX.followProgressBars(gameData.settings.vfx.followProgressBars);
}

GameEvents.TaskLevelChanged.subscribe((taskInfo) => {
    // Only show animations if the level went up
    if (taskInfo.previousLevel >= taskInfo.nextLevel) return;

    const numberOfParticles = 15;
    const direction = taskInfo.type === 'Battle' ? 'left' : 'right';
    let taskProgressBar = undefined;
    let quickTaskProgressBar = undefined;
    if (taskInfo.type === 'Battle' || taskInfo.type === 'BossBattle') {
        if (gameData.selectedTab === 'battles') {
            taskProgressBar = getBattleElement(taskInfo.name).querySelector('.progressBar');
        }
        quickTaskProgressBar = document.querySelector(`.quickTaskDisplay.${taskInfo.name} > .progressBar`);
    } else if (taskInfo.type === 'GridStrength') {
        taskProgressBar = document.getElementById('energyDisplay');
    } else if (taskInfo.type === 'GalacticSecret') {
        taskProgressBar = document.querySelector('#' + galacticSecrets[taskInfo.name].domId + ' .progressBar');
    } else {
        if (gameData.selectedTab === 'modules') {
            const taskElement = getModuleOperationElement(taskInfo.name);
            taskProgressBar = taskElement.querySelector('.progressBar');
        }
        quickTaskProgressBar = document.querySelector(`.quickTaskDisplay.${taskInfo.name} .progressBar`);
    }
    if (taskProgressBar !== undefined) {
        VFX.onetimeSplash(taskProgressBar, numberOfParticles, direction);
        VFX.flash(taskProgressBar);
    }

    // Doesn't have a quick display
    if (quickTaskProgressBar === undefined) return;

    VFX.onetimeSplash(quickTaskProgressBar, numberOfParticles, direction);
    VFX.flash(quickTaskProgressBar);
});
