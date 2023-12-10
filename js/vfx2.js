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
        // killAfterAnimation(element);
        element.addEventListener('animationend', FlashBehavior._onAnimationEnd, {passive: true});
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        if (event.animationName !== 'flash') return;

        event.currentTarget.classList.add('free');
        event.currentTarget.removeEventListener('animationend', FlashBehavior._onAnimationEnd);
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
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', SplashParticleBehavior._onAnimationEnd, {passive: true});
    },

    /**
     * @param {AnimationEvent} event
     */
    _onAnimationEnd: (event) => {
        if (event.animationName !== 'fade-out') return;

        event.currentTarget.removeAttribute('style');
        event.currentTarget.classList.add('free');
        const childElement = event.currentTarget.children.item(0);
        childElement.classList.remove(childElement.__addedCssClass);
        // Remove all but the "particle" class
        // .forEach((value, key, parent) => {
        //     if (value === 'particle') return;
        //
        //     parent.remove(value);
        // });
        event.currentTarget.removeEventListener('animationend', SplashParticleBehavior._onAnimationEnd);
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
        element.style.rotate = randomInt(360) + 'deg';
        element.style.top = randomInt(parentHeight) + 'px';
        const childElement = element.children.item(0);
        const cssClass = 'size' + randomSize();
        childElement.classList.add(cssClass);
        childElement.__addedCssClass = cssClass;
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', ProgressParticleBehavior._onAnimationEnd, {passive: true});
        element.addEventListener('animationcancel', (event) => {
            switch (event.animationName) {
                case 'shoot0':
                case 'shoot1':
                case 'shoot2':
                case 'shoot3':
                    break;
                default:
                    return;
            }

            console.log(event.animationName + ' cancelled.', event.currentTarget);
        }, {once: true, passive: true});
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

        // event.currentTarget.removeAttribute('style');
        event.currentTarget.classList.add('free');
        const childElement = event.currentTarget.children.item(0);
        childElement.classList.remove(childElement.__addedCssClass);
        // Remove all but the "particle" class
        // .forEach((value, key, parent) => {
        //     if (value === 'particle') return;
        //
        //     parent.remove(value);
        // });
        event.currentTarget.removeEventListener('animationend', ProgressParticleBehavior._onAnimationEnd);
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
        element.style.rotate = (randomInt(30) - 15) + 'deg';
        element.style.top = randomInt(parameters.parentHeight) + 'px';
        element.style.left = parameters.left;
        const childElement = element.children.item(0);
        const cssClass = 'size' + randomSize();
        childElement.classList.add(cssClass);
        childElement.__addedCssClass = cssClass;
    },

    scheduleRelease: (element) => {
        element.addEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd, {passive: true});
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

        // event.currentTarget.removeAttribute('style');
        event.currentTarget.classList.add('free');
        const childElement = event.currentTarget.children.item(0);
        childElement.classList.remove(childElement.__addedCssClass);
        // Remove all but the "particle" class
        // .forEach((value, key, parent) => {
        //     if (value === 'particle') return;
        //
        //     parent.remove(value);
        // });
        event.currentTarget.removeEventListener('animationend', BattleProgressParticleBehavior._onAnimationEnd);
    },
};


function killAfterAnimation(element, animationCount = 1) {
    // TODO filter by animation name
    // Little construct to capture `animationsEnded` per instance
    ((animationsEnded) => {
        element.addEventListener('animationend', () => {
            animationsEnded++;
            if (animationsEnded >= animationCount) {
                element.classList.add('free');
            }
        });
    })(0);
}

class Vfx2 {

    /**
     *
     * @param {HTMLElement} parent
     * @param {ParticleBehavior} behavior
     * @param {any} parameters
     */
    static #startParticle(parent, behavior, parameters) {
        // 1 Find unused flash element in parent
        let element = behavior.findFreeElement(parent);

        // 2 If nothing found
        if (element === null) {
            // create new flash element
            element = behavior.createNewElement();

            if (isFunction(behavior.appendElement)) {
                behavior.appendElement(parent, element);
            } else {
                // append to parent
                parent.append(element);
            }
        } else {
            // 3 mark as in-use
            element.classList.remove('free');
        }

        // 4 Modify element according to parameters
        behavior.prepareElement(element, parameters);

        // 5 schedule release of element after animation is done
        behavior.scheduleRelease(element);

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
        let height = parent.clientHeight;
        this.#onetimeSplash(
            parent,
            numberOfParticles,
            {
                top: () => gaussianRandomInt(0, height) + 'px',
                [direction]: '0',
            },
        );
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
            particleDelay: 32, // ms
        },
        battles: {
            sinceLastParticle: 0,
            particleDelay: 128, // ms
        },
    };


    static followProgressBars(enabled = true) {
        if (!enabled) {
            cancelAnimationFrame(Vfx2.progressFollow.animationFrameRequestID);
            return;
        }

        const update = (updateTime) => {
            const timeDelta = updateTime - Vfx2.progressFollow.lastUpdate;
            Vfx2.progressFollow.lastUpdate = updateTime;


            if (!isPlaying()) {
                Vfx2.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
                return;
            }

            Vfx2.progressFollow.general.sinceLastParticle += timeDelta;
            if (Vfx2.progressFollow.general.sinceLastParticle >= Vfx2.progressFollow.general.particleDelay) {
                document.querySelectorAll(':not(.battle) > .progressFill.current').forEach((element) => {
                    // Don't spawn particles on elements that are invisible
                    if (Dom.isHidden(element)) return;

                    // TODO higher progress speed = more particles
                    this.#startParticle(element, ProgressParticleBehavior, element.clientHeight);
                });
                Vfx2.progressFollow.general.sinceLastParticle = 0;
            }

            Vfx2.progressFollow.battles.sinceLastParticle += timeDelta;
            if (Vfx2.progressFollow.battles.sinceLastParticle >= Vfx2.progressFollow.battles.particleDelay) {
                document.querySelectorAll('.battle > .progressFill.current').forEach((element) => {
                    // Don't spawn particles on elements that are invisible
                    if (Dom.isHidden(element)) return;

                    // TODO higher progress speed = more particles
                    this.#startParticle(element, BattleProgressParticleBehavior, {
                        left: element.style.width,
                        parentHeight: element.clientHeight,
                    });
                });
                Vfx2.progressFollow.battles.sinceLastParticle = 0;
            }

            Vfx2.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
        };

        Vfx2.progressFollow.lastUpdate = performance.now();
        Vfx2.progressFollow.animationFrameRequestID = requestAnimationFrame(update);
    }

}

const VFX = Vfx2;

VFX.followProgressBars(true);

GameEvents.TaskLevelChanged.subscribe((taskInfo) => {
    // Only show animations if the level went up
    if (taskInfo.previousLevel >= taskInfo.nextLevel) return;

    const numberOfParticles = 20;
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
