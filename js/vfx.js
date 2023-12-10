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

/**
 *
 * @param element
 * @returns {Promise.<boolean>}
 */
function isHidden(element) {
    return XFastdom.measure(() => {
        return Dom.isHidden(element);
    });
}

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
        // XFastdom.mutate(() => {
            if (isDefined(baseColor)) {
                element.style.color = baseColor;
            } else {
                element.style.removeProperty('color');
            }
        // });
    },

    scheduleRelease: (element) => {
        // killAfterAnimation(element);
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
        // for (let i = 0; i < element.style.length; i++) {
        //     const property = element.style.item(i);
        //     if (styleObject.hasOwnProperty(property)) {
        //         element.style.setProperty(property, styleObject[property]);
        //         delete styleObject[property];
        //     }
        // }
        // XFastdom.mutate(() => {
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
            childElement.__addedCssClass = cssClass;
        // });
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
            childElement.classList.remove(childElement.__addedCssClass);
            // Remove all but the "particle" class
            // .forEach((value, key, parent) => {
            //     if (value === 'particle') return;
            //
            //     parent.remove(value);
            // });
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
        // for (let i = 0; i < element.style.length; i++) {
        //     const property = element.style.item(i);
        //     if (styleObject.hasOwnProperty(property)) {
        //         element.style.setProperty(property, styleObject[property]);
        //         delete styleObject[property];
        //     }
        // }
        // XFastdom.mutate(() => {
            element.style.rotate = randomInt(360) + 'deg';
            element.style.top = randomInt(parentHeight) + 'px';
            const childElement = element.children.item(0);
            const cssClass = 'size' + randomSize();
            childElement.classList.add(cssClass);
            childElement.__addedCssClass = cssClass;
        // });
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', ProgressParticleBehavior._onAnimationEnd, {passive: true});
        // element.addEventListener('animationcancel', (event) => {
        //     switch (event.animationName) {
        //         case 'shoot0':
        //         case 'shoot1':
        //         case 'shoot2':
        //         case 'shoot3':
        //             break;
        //         default:
        //             return;
        //     }
        //
        //     console.log(event.animationName + ' cancelled.', event.currentTarget);
        // }, {once: true, passive: true});
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
            // event.currentTarget.removeAttribute('style');
            currentTarget.classList.add('free');
            const childElement = currentTarget.children.item(0);
            childElement.classList.remove(childElement.__addedCssClass);
            // Remove all but the "particle" class
            // .forEach((value, key, parent) => {
            //     if (value === 'particle') return;
            //
            //     parent.remove(value);
            // });
        });
        currentTarget.removeEventListener('animationend', ProgressParticleBehavior._onAnimationEnd);
    },
};

/**
 * @type {ParticleBehavior & {_onAnimationEnd: function(AnimationEvent)}}
 */
const BattleProgressParticleBehavior = {
    findFreeElement: (parent) => {
        return Dom.get(parent).bySelector('.vfx.battle-progress-particle-wrapper.free');
    },

    createNewElement: () => {
        return Dom.new.fromHtml('<div class="vfx battle-progress-particle-wrapper"><div class="particle"></div></div>');
    },

    /**
     *
     * @param element
     * @param {{
     *     left: string,
     *     parentHeight: number
     * }} parameters
     */
    prepareElement: (element, parameters) => {
        // for (let i = 0; i < element.style.length; i++) {
        //     const property = element.style.item(i);
        //     if (styleObject.hasOwnProperty(property)) {
        //         element.style.setProperty(property, styleObject[property]);
        //         delete styleObject[property];
        //     }
        // }
        // XFastdom.mutate(() => {
            element.style.rotate = (randomInt(30) - 15) + 'deg';
            element.style.top = randomInt(parameters.parentHeight) + 'px';
            element.style.left = parameters.left;
            const childElement = element.children.item(0);
            const cssClass = 'size' + randomSize();
            childElement.classList.add(cssClass);
            childElement.__addedCssClass = cssClass;
        // });
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd, {passive: true});
    },

    appendElement: (parent, element) => {
        // XFastdom.mutate(() => {

            parent.insertAdjacentElement('afterend', element);
        // });
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
            // currentTarget.removeAttribute('style');
            currentTarget.classList.add('free');
            const childElement = currentTarget.children.item(0);
            childElement.classList.remove(childElement.__addedCssClass);
            // Remove all but the "particle" class
            // .forEach((value, key, parent) => {
            //     if (value === 'particle') return;
            //
            //     parent.remove(value);
            // });
        });
        currentTarget.removeEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd);
    },
};


// function killAfterAnimation(element, animationCount = 1) {
//     // TODO filter by animation name
//     // Little construct to capture `animationsEnded` per instance
//     ((animationsEnded) => {
//         element.addEventListener('animationend', () => {
//             animationsEnded++;
//             if (animationsEnded >= animationCount) {
//                 element.classList.add('free');
//             }
//         });
//     })(0);
// }

class Vfx {

    /**
     *
     * @param {HTMLElement} parent
     * @param {ParticleBehavior} behavior
     * @param {any} parameters
     */
    static #startParticle(parent, behavior, parameters) {
        XFastdom.mutate(() => {

            // 1 Find unused flash element in parent
            let element = behavior.findFreeElement(parent);

            // 2 If nothing found
            if (element === null) {
                // create new flash element
                element = behavior.createNewElement();

                if (isFunction(behavior.appendElement)) {
                    behavior.appendElement(parent, element);
                } else {
                    // XFastdom.mutate(() => {
                        // append to parent
                        parent.append(element);
                    // });
                }
            } else {
                // XFastdom.mutate(() => {
                    // 3 mark as in-use
                    element.classList.remove('free');
                // });
            }

            // 4 Modify element according to parameters
            behavior.prepareElement(element, parameters);

            // 5 schedule release of element after animation is done
            behavior.scheduleRelease(element);
        });
        // Do not return the element - the VFX is system is considered closed and internal workings should not be exposed
    }

    /**
     * @param {HTMLElement} parent
     * @param {number} numberOfParticles
     * @param {Object.<string, function():string|string>} styleObject
     */
    static #onetimeSplash(parent, numberOfParticles, styleObject) {
        for (let i = 0; i < numberOfParticles; i++) {
            this.#startParticle(parent, SplashParticleBehavior, styleObject);
//             let particleElement = htmlToElement(`
// <div style=" transform: rotate(${-60 + randomInt(120)}deg);  ${renderStyle(styleObject)}" class="splash-particle-wrapper">
//     <div class="particle size${randomSize(3)}" style="animation-duration: 600ms, 600ms; opacity: 0.6; scale: 0.5"></div>
// </div>`);
//             killAfterAnimation(particleElement);
//             parent.append(particleElement);
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
            cancelAnimationFrame(Vfx.progressFollow.animationFrameRequestID);
            return;
        }

        const update = (updateTime) => {
            const timeDelta = updateTime - Vfx.progressFollow.lastUpdate;
            Vfx.progressFollow.lastUpdate = updateTime;


            if (!isPlaying()) {
                Vfx.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
                return;
            }

            Vfx.progressFollow.general.sinceLastParticle += timeDelta;
            if (Vfx.progressFollow.general.sinceLastParticle >= Vfx.progressFollow.general.particleDelay) {
                let selector = '.operationQuickDisplay.progressFill.current';
                if (gameData.selectedTab === 'modules') {
                    selector += ', .moduleOperation.progressFill.current';
                }
                document.querySelectorAll(selector).forEach((element) => {
                    // Don't spawn particles on elements that are invisible
                    // isHidden(element).then((hidden) => {
                    //     if (hidden) return;

                        // TODO higher progress speed = more particles
                        if (Vfx.progressFollow.general.elementHeight === undefined || Vfx.progressFollow.general.elementHeight === 0) {
                            return XFastdom.measure(() => {
                                console.log('Measure general progress clientHeight');
                                return element.parentElement.clientHeight;
                            }).then((elementHeight) => {
                                Vfx.progressFollow.general.elementHeight = elementHeight;
                                this.#startParticle(element, ProgressParticleBehavior, elementHeight);
                            });
                        } else {
                            this.#startParticle(element, ProgressParticleBehavior, Vfx.progressFollow.general.elementHeight);
                        }
                    // });
                });
                Vfx.progressFollow.general.sinceLastParticle = 0;
            }

            Vfx.progressFollow.battles.sinceLastParticle += timeDelta;
            if (Vfx.progressFollow.battles.sinceLastParticle >= Vfx.progressFollow.battles.particleDelay) {
                let selector = '.battleQuickDisplay.progressFill.current';
                if (gameData.selectedTab === 'battles') {
                    selector += ', .battleProgress.progressFill.current';
                }

                document.querySelectorAll(selector).forEach((element) => {
                    // Don't spawn particles on elements that are invisible
                    // isHidden(element).then((hidden) => {
                    //     if (hidden) return;

                        return XFastdom.measure(() => {
                            if (Vfx.progressFollow.battles.elementHeight === undefined || Vfx.progressFollow.battles.elementHeight === 0) {
                                console.log('Measure battle clientHeight');
                                Vfx.progressFollow.battles.elementHeight = element.parentElement.clientHeight;
                            }
                            return {
                                left: element.style.width,
                                parentHeight: Vfx.progressFollow.battles.elementHeight,
                            };
                        }).then((parameters) => {
                            // TODO higher progress speed = more particles
                            this.#startParticle(element, BattleProgressParticleBehavior, parameters);
                        });
                    // });
                });
                Vfx.progressFollow.battles.sinceLastParticle = 0;
            }

            Vfx.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
        };

        Vfx.progressFollow.lastUpdate = performance.now();
        Vfx.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
    }

}

const VFX = Vfx;

VFX.followProgressBars(true);

GameEvents.TaskLevelChanged.subscribe((taskInfo) => {
    // Only show animations if the level went up
    if (taskInfo.previousLevel >= taskInfo.nextLevel) return;

    const numberOfParticles = 15;
    const direction = taskInfo.type === 'Battle' ? 'left' : 'right';
    let taskProgressBar = undefined;
    let quickTaskProgressBar = undefined;
    if (taskInfo.type === 'Battle') {
        if (gameData.selectedTab === 'battles') {
            taskProgressBar = getBattleElement(taskInfo.name).querySelector('.progressBar');
        }
        quickTaskProgressBar = document.querySelector(`.quickTaskDisplay.${taskInfo.name} > .progressBar`);
    } else if (taskInfo.type === 'GridStrength') {
        taskProgressBar = document.getElementById('energyDisplay');
    } else {
        if (gameData.selectedTab === 'modules') {
            const taskElement = getModuleOperationElement(taskInfo.name);
            taskProgressBar = taskElement.querySelector('.progressBar');
        }
        quickTaskProgressBar = document.querySelector(`.quickTaskDisplay.${taskInfo.name} .progressBar`);
    }
    if (taskProgressBar !== undefined) {
        // if (isVisible(taskProgressBar)) {
        // Don't spawn particles on elements that are invisible
        VFX.onetimeSplash(taskProgressBar, numberOfParticles, direction);
        VFX.flash(taskProgressBar);
    }

    // Doesn't have a quick display
    if (quickTaskProgressBar === undefined) return;

    VFX.onetimeSplash(quickTaskProgressBar, numberOfParticles, direction);
    VFX.flash(quickTaskProgressBar);
});
