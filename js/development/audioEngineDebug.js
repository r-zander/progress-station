'use strict';

/**
 * Audio Engine Debug Overlay
 * Provides a visual overlay for debugging the music context statistics
 */
const AudioEngineDebug = (() => {
    let statisticsEnabled = localStorage.getItem('ps_audioEngineDebug_statisticsEnabled') === 'true';
    let overlayEnabled = localStorage.getItem('ps_audioEngineDebug_overlayEnabled') === 'true';

    const statistics = {
        allTime: {
            lowestProgressSpeed: {
                avg: Infinity,
                median: Infinity,
                max: Infinity,
                total: Infinity,
            },
            highestProgressSpeed: {
                avg: 0,
                median: 0,
                max: 0,
                total: 0,
            },
        },
        lastMinuteAvg: {
            avgProgressSpeeds: [], // Capped to targetTicksPerSecond * 60 entries
            avgProgressSpeed: 0, // average of avgProgressSpeeds
            medianProgressSpeeds: [], // Capped to targetTicksPerSecond * 60 entries
            medianProgressSpeed: 0, // average of medianProgressSpeeds
            maxProgressSpeeds: [], // Capped to targetTicksPerSecond * 60 entries
            maxProgressSpeed: 0, // average of maxProgressSpeeds
            totalProgressSpeeds: [], // Capped to targetTicksPerSecond * 60 entries
            totalProgressSpeed: 0, // average of totalProgressSpeeds
        }
    };

    /**
     * Update statistics based on current musicContext values
     * Called via listener pattern
     */
    function updateStatistics() {
        if (!statisticsEnabled) return;

        if (!gameData.state.areTasksProgressing) return;

        const avg = musicContext.avgProgressSpeed;
        const median = musicContext.medianProgressSpeed;
        const max = musicContext.maxProgressSpeed;
        const total = musicContext.totalProgressSpeed;

        // Update all-time statistics for each measurement
        if (avg < statistics.allTime.lowestProgressSpeed.avg) {
            statistics.allTime.lowestProgressSpeed.avg = avg;
        }
        if (avg > statistics.allTime.highestProgressSpeed.avg) {
            statistics.allTime.highestProgressSpeed.avg = avg;
        }

        if (median < statistics.allTime.lowestProgressSpeed.median) {
            statistics.allTime.lowestProgressSpeed.median = median;
        }
        if (median > statistics.allTime.highestProgressSpeed.median) {
            statistics.allTime.highestProgressSpeed.median = median;
        }

        if (max < statistics.allTime.lowestProgressSpeed.max) {
            statistics.allTime.lowestProgressSpeed.max = max;
        }
        if (max > statistics.allTime.highestProgressSpeed.max) {
            statistics.allTime.highestProgressSpeed.max = max;
        }

        if (total < statistics.allTime.lowestProgressSpeed.total) {
            statistics.allTime.lowestProgressSpeed.total = total;
        }
        if (total > statistics.allTime.highestProgressSpeed.total) {
            statistics.allTime.highestProgressSpeed.total = total;
        }

        // Update last minute averages (rolling buffer)
        const maxEntries = targetTicksPerSecond * 60; // 1 minute worth of data

        // Add current values to rolling buffers
        statistics.lastMinuteAvg.avgProgressSpeeds.push(musicContext.avgProgressSpeed);
        statistics.lastMinuteAvg.medianProgressSpeeds.push(musicContext.medianProgressSpeed);
        statistics.lastMinuteAvg.maxProgressSpeeds.push(musicContext.maxProgressSpeed);
        statistics.lastMinuteAvg.totalProgressSpeeds.push(musicContext.totalProgressSpeed);

        // Trim buffers to max size (remove oldest entries)
        if (statistics.lastMinuteAvg.avgProgressSpeeds.length > maxEntries) {
            statistics.lastMinuteAvg.avgProgressSpeeds.shift();
        }
        if (statistics.lastMinuteAvg.medianProgressSpeeds.length > maxEntries) {
            statistics.lastMinuteAvg.medianProgressSpeeds.shift();
        }
        if (statistics.lastMinuteAvg.maxProgressSpeeds.length > maxEntries) {
            statistics.lastMinuteAvg.maxProgressSpeeds.shift();
        }
        if (statistics.lastMinuteAvg.totalProgressSpeeds.length > maxEntries) {
            statistics.lastMinuteAvg.totalProgressSpeeds.shift();
        }

        // Calculate averages
        statistics.lastMinuteAvg.avgProgressSpeed = calculateAverage(
            statistics.lastMinuteAvg.avgProgressSpeeds
        );
        statistics.lastMinuteAvg.medianProgressSpeed = calculateAverage(
            statistics.lastMinuteAvg.medianProgressSpeeds
        );
        statistics.lastMinuteAvg.maxProgressSpeed = calculateAverage(
            statistics.lastMinuteAvg.maxProgressSpeeds
        );
        statistics.lastMinuteAvg.totalProgressSpeed = calculateAverage(
            statistics.lastMinuteAvg.totalProgressSpeeds
        );

        // Update overlay if enabled
        updateOverlay();
    }

    /**
     * Calculate average of an array
     * @param {number[]} arr - Array of numbers
     * @returns {number} Average value
     */
    function calculateAverage(arr) {
        if (arr.length === 0) return 0;
        const sum = arr.reduce((acc, val) => acc + val, 0);
        return sum / arr.length;
    }

    /**
     * Format a number for display
     * @param {number} value - Value to format
     * @returns {string} Formatted value
     */
    function formatValue(value) {
        if (value === Infinity) return 'N/A';
        if (value === 0) return '0.000';
        return value.toFixed(3);
    }

    /**
     * Introspect Howl instances to extract detailed information
     * @param {Howl} howl - Howl instance to introspect
     * @returns {Array} Array of sound instance info
     * @private
     */
    function extractHowlInstances(howl) {
        const instances = [];
        if (howl._sounds && howl._sounds.length > 0) {
            howl._sounds.forEach(sound => {
                if (sound._id !== undefined) {
                    instances.push({
                        id: sound._id,
                        playing: howl.playing(sound._id),
                        volume: howl.volume(sound._id),
                        muted: howl.mute(sound._id),
                        paused: sound._paused || false,
                        ended: sound._ended || false,
                    });
                }
            });
        }
        return instances;
    }

    /**
     * Build debug information from AudioEngine's internal state
     * @private
     */
    function buildDebugInfo() {
        const debugState = AudioEngine.getDebugState();

        // Build active layers summary
        const activeLayers = [];
        for (const layerKey in debugState.activeLayers) {
            const layerKeyParts = layerKey.split('##');
            const howl = debugState.activeLayers[layerKey].howl;
            const soundId = debugState.activeLayers[layerKey].soundId;

            activeLayers.push({
                state: layerKeyParts[0],
                layer: layerKeyParts[1],
                isPlaying: howl?.playing(soundId) || false,
                volume: howl?.volume(soundId),
                muted: howl?.mute(soundId),
                soundId: soundId,
            });
        }

        // Introspect ALL music layer Howls (permanent storage)
        const allMusicLayerHowls = [];
        for (const layerKey in debugState.layerHowls) {
            const layerKeyParts = layerKey.split('##');
            const howl = debugState.layerHowls[layerKey].howl;
            const soundId = debugState.layerHowls[layerKey].soundId;
            const isActive = debugState.activeLayers[layerKey] !== undefined;

            allMusicLayerHowls.push({
                state: layerKeyParts[0],
                layer: layerKeyParts[1],
                primarySoundId: soundId,
                instances: extractHowlInstances(howl),
                howlState: howl.state(),
                isActive: isActive,
            });
        }

        // Introspect sound effect Howls from banks
        const soundEffectHowls = [];
        for (const bankName in debugState.banks) {
            const bank = debugState.banks[bankName];
            for (const eventName in bank.events) {
                const eventData = bank.events[eventName];
                eventData.howls.forEach((howl, index) => {
                    soundEffectHowls.push({
                        bank: bankName,
                        event: eventName,
                        index: index,
                        instances: extractHowlInstances(howl),
                        state: howl.state(),
                    });
                });
            }
        }

        // Introspect ALL Howls directly from Howler.js
        const allHowlerSounds = [];
        if (Howler._howls && Howler._howls.length > 0) {
            Howler._howls.forEach((howl, howlIndex) => {
                const instances = extractHowlInstances(howl);
                allHowlerSounds.push({
                    howlIndex: howlIndex,
                    src: howl._src || 'unknown',
                    state: howl.state(),
                    instances: instances,
                    volume: howl.volume(),
                    muted: howl.mute(),
                });
            });
        }

        // Calculate statistics
        const musicLayerHowls = allMusicLayerHowls.filter(h => h.isActive);

        let playingInstances = 0;
        let stoppedInstances = 0;
        let mutedInstances = 0;

        soundEffectHowls.forEach(howl => {
            howl.instances.forEach(inst => {
                if (inst.playing) playingInstances++;
                else stoppedInstances++;
                if (inst.muted) mutedInstances++;
            });
        });

        allMusicLayerHowls.forEach(howl => {
            howl.instances.forEach(inst => {
                if (inst.playing) playingInstances++;
                else stoppedInstances++;
                if (inst.muted) mutedInstances++;
            });
        });

        return {
            activeStates: {...debugState.activeStates},
            activeLayers: activeLayers,
            registeredStates: Object.keys(debugState.musicStates),
            howlStats: {
                totalMusicHowls: Object.keys(debugState.layerHowls).length,
                activeMusicHowls: Object.keys(debugState.activeLayers).length,
                totalSoundEffectHowls: soundEffectHowls.length,
                playingInstances: playingInstances,
                stoppedInstances: stoppedInstances,
                mutedInstances: mutedInstances,
            },
            soundEffectHowls: soundEffectHowls,
            musicLayerHowls: musicLayerHowls,
            allMusicLayerHowls: allMusicLayerHowls,
            allHowlerSounds: allHowlerSounds,
        };
    }

    /**
     * Update the debug overlay with current statistics
     */
    function updateOverlay() {
        if (!overlayEnabled) return;

        const debugDiv = Dom.get().bySelector('#audioEngineDebug > .offcanvas-body');
        if (debugDiv === null) return;

        // Build debug info by introspecting AudioEngine state
        const musicDebug = buildDebugInfo();

        // Format active states
        const activeStatesText = Object.keys(musicDebug.activeStates).length > 0
            ? Object.entries(musicDebug.activeStates)
                .map(([group, state]) => `${group}: ${state}`)
                .join('<br>')
            : 'None';

        // Format active layers
        const activeLayersText = musicDebug.activeLayers.length > 0
            ? musicDebug.activeLayers
                .map(layer => `${layer.state}/${layer.layer} (${layer.isPlaying ? 'playing' : 'stopped'})`)
                .join('<br>')
            : 'None';

        // Format Howl statistics
        const howlStatsText = `
            Music Howls: ${musicDebug.howlStats.totalMusicHowls} (${musicDebug.howlStats.activeMusicHowls} active)<br>
            SFX Howls: ${musicDebug.howlStats.totalSoundEffectHowls}<br>
            Playing: ${musicDebug.howlStats.playingInstances}<br>
            Stopped: ${musicDebug.howlStats.stoppedInstances}<br>
            Muted: ${musicDebug.howlStats.mutedInstances}
        `;

        // Format ALL music layer Howls (permanent storage)
        const allMusicLayerDetailsText = musicDebug.allMusicLayerHowls && musicDebug.allMusicLayerHowls.length > 0
            ? musicDebug.allMusicLayerHowls.map(howl => {
                const activeIcon = howl.isActive ? '🟢' : '⚪';
                const instancesText = howl.instances.map(inst => {
                    const playIcon = inst.playing ? '▶' : '⏹';
                    const muteIcon = inst.muted ? '🔇' : '';
                    return `#${inst.id} ${playIcon}${muteIcon} v${inst.volume?.toFixed(2) || '?'}`;
                }).join(', ');
                return `${activeIcon} ${howl.state}/${howl.layer} [${howl.howlState}]<br>${instancesText || 'No instances'}`;
            }).join('<br>')
            : 'None';

        // Format detailed music layer instances (active only - for comparison)
        const musicLayerDetailsText = musicDebug.musicLayerHowls.length > 0
            ? musicDebug.musicLayerHowls.map(howl => {
                const instancesText = howl.instances.map(inst => {
                    const playIcon = inst.playing ? '▶' : '⏹';
                    const muteIcon = inst.muted ? '🔇' : '';
                    return `#${inst.id} ${playIcon}${muteIcon} v${inst.volume?.toFixed(2) || '?'}`;
                }).join(', ');
                return `${howl.state}/${howl.layer} [${howl.howlState}]<br>${instancesText || 'No instances'}`;
            }).join('<br>')
            : 'None';

        // Format sound effect instances (only show if there are active instances)
        const activeSFXHowls = musicDebug.soundEffectHowls.filter(h => h.instances.length > 0);
        const sfxDetailsText = activeSFXHowls.length > 0
            ? activeSFXHowls.map(howl => {
                const instancesText = howl.instances.map(inst => {
                    const playIcon = inst.playing ? '▶' : '⏹';
                    const muteIcon = inst.muted ? '🔇' : '';
                    return `#${inst.id} ${playIcon}${muteIcon}`;
                }).join(', ');
                return `${howl.bank}/${howl.event}: ${instancesText}`;
            }).join('<br>')
            : 'None active';

        // Format ALL Howler sounds (direct from Howler.js, bypassing AudioEngine)
        const allHowlerText = musicDebug.allHowlerSounds.length > 0
            ? musicDebug.allHowlerSounds.map((howl, idx) => {
                const srcDisplay = Array.isArray(howl.src)
                    ? howl.src[0].substring(howl.src[0].lastIndexOf('/') + 1)
                    : (howl.src || 'unknown').substring((howl.src || 'unknown').lastIndexOf('/') + 1);
                const instancesText = howl.instances.length > 0
                    ? howl.instances.map(inst => {
                        const playIcon = inst.playing ? '▶' : '⏹';
                        const muteIcon = inst.muted ? '🔇' : '';
                        const stateIcon = inst.state === 'paused' ? '⏸' : (inst.state === 'ended' ? '⏹' : '');
                        return `#${inst.id} ${playIcon}${muteIcon}${stateIcon}`;
                    }).join(', ')
                    : 'No instances';
                return `[${idx}] ${srcDisplay}<br>${instancesText}`;
            }).join('<br>')
            : 'None';

        const totalHowlerInstances = musicDebug.allHowlerSounds.reduce((sum, h) => sum + h.instances.length, 0);
        const playingHowlerInstances = musicDebug.allHowlerSounds.reduce((sum, h) =>
            sum + h.instances.filter(i => i.playing).length, 0);

        // Remove hidden class and update content
        debugDiv.classList.remove('hidden');
        debugDiv.innerHTML = `
            <hr style="margin: 5px 0;">
            <div style="margin-bottom: 8px;">
                <strong>Howl Statistics:</strong><br>
                ${howlStatsText}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>🔍 Howler.js Direct View:</strong><br>
                <span style="font-size: 10px;">Total Howls: ${musicDebug.allHowlerSounds.length} | Instances: ${totalHowlerInstances} | Playing: ${playingHowlerInstances}</span><br>
                ${allHowlerText}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Music Layer Howls (Permanent):</strong><br>
                <span style="font-size: 10px;">(🟢=Active, ⚪=Inactive)</span><br>
                ${allMusicLayerDetailsText}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Active SFX:</strong><br>
                ${sfxDetailsText}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Music State:</strong><br>
                Active States:<br>
                ${activeStatesText}<br>
                <br>
                Active Layers:<br>
                ${activeLayersText}<br>
                <br>
                Registered: ${musicDebug.registeredStates.join(', ') || 'None'}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>Current Values:</strong><br>
                Highest Attr: ${musicContext.highestAttribute}<br>
                Avg Speed: ${formatValue(musicContext.avgProgressSpeed)}<br>
                Median Speed: ${formatValue(musicContext.medianProgressSpeed)}<br>
                Max Speed: ${formatValue(musicContext.maxProgressSpeed)}<br>
                Total Speed: ${formatValue(musicContext.totalProgressSpeed)}<br>
                Danger Level: ${formatValue(musicContext.dangerLevel)}<br>
                Battles: ${musicContext.numberOfEngagedBattles}<br>
                State: ${musicContext.gameState}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>All-Time Lowest:</strong><br>
                Avg: ${formatValue(statistics.allTime.lowestProgressSpeed.avg)}<br>
                Median: ${formatValue(statistics.allTime.lowestProgressSpeed.median)}<br>
                Max: ${formatValue(statistics.allTime.lowestProgressSpeed.max)}<br>
                Total: ${formatValue(statistics.allTime.lowestProgressSpeed.total)}
            </div>
            <div style="margin-bottom: 8px;">
                <strong>All-Time Highest:</strong><br>
                Avg: ${formatValue(statistics.allTime.highestProgressSpeed.avg)}<br>
                Median: ${formatValue(statistics.allTime.highestProgressSpeed.median)}<br>
                Max: ${formatValue(statistics.allTime.highestProgressSpeed.max)}<br>
                Total: ${formatValue(statistics.allTime.highestProgressSpeed.total)}
            </div>
            <div>
                <strong>Last Minute Avg:</strong><br>
                Avg Speed: ${formatValue(statistics.lastMinuteAvg.avgProgressSpeed)}<br>
                Median Speed: ${formatValue(statistics.lastMinuteAvg.medianProgressSpeed)}<br>
                Max Speed: ${formatValue(statistics.lastMinuteAvg.maxProgressSpeed)}<br>
                Total Speed: ${formatValue(statistics.lastMinuteAvg.totalProgressSpeed)}<br>
                Samples: ${statistics.lastMinuteAvg.totalProgressSpeeds.length}
            </div>
        `;
    }

    /**
     * Reset statistics to initial values
     * @private
     */
    function resetStatistics() {
        statistics.allTime.lowestProgressSpeed.avg = Infinity;
        statistics.allTime.lowestProgressSpeed.median = Infinity;
        statistics.allTime.lowestProgressSpeed.max = Infinity;
        statistics.allTime.lowestProgressSpeed.total = Infinity;
        statistics.allTime.highestProgressSpeed.avg = 0;
        statistics.allTime.highestProgressSpeed.median = 0;
        statistics.allTime.highestProgressSpeed.max = 0;
        statistics.allTime.highestProgressSpeed.total = 0;
        statistics.lastMinuteAvg.avgProgressSpeeds = [];
        statistics.lastMinuteAvg.avgProgressSpeed = 0;
        statistics.lastMinuteAvg.medianProgressSpeeds = [];
        statistics.lastMinuteAvg.medianProgressSpeed = 0;
        statistics.lastMinuteAvg.maxProgressSpeeds = [];
        statistics.lastMinuteAvg.maxProgressSpeed = 0;
        statistics.lastMinuteAvg.totalProgressSpeeds = [];
        statistics.lastMinuteAvg.totalProgressSpeed = 0;
    }

    /**
     * Register the statistics listener with musicContext
     * @private
     */
    function attachStatisticsListener() {
        musicContext.registerListener(updateStatistics);
    }

    /**
     * Create the overlay DOM element if it doesn't exist
     * @private
     */
    function createOverlayElement() {
        if (document.getElementById('audioEngineDebug')) return;

        document.body.insertAdjacentHTML(
            'beforeend',
`<div id="audioEngineDebug" class="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title">Audio Engine Debug</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body" 
         style="font-family: monospace;">
        
    </div>
</div>`);

        const offcanvasElement = document.getElementById('audioEngineDebug');
        bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement).show();
        offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
            disableOverlay();
        });
        offcanvasElement.addEventListener('show.bs.offcanvas', () => {
            enableOverlay();
        });

        document.body.insertAdjacentHTML(
            'beforeend',
`<a href="#audioEngineDebug" data-bs-toggle="offcanvas" class="text-bg-dark p-3" 
                   style="position: fixed; 
                          top: 2rem; 
                          right: 0; 
                          border-top-left-radius: 1rem;
                          border-bottom-left-radius: 1rem;
                          border: 2px solid white;
                          border-right: none;">
        <img src="../../img/icons/buttons/sound.svg" style="height: 1.5rem; filter: invert(1)" />
</a>`
        );
    }

    /**
     * Enable statistics collection
     */
    function enableStatistics() {
        if (statisticsEnabled) return;

        statisticsEnabled = true;
        localStorage.setItem('ps_audioEngineDebug_statisticsEnabled', 'true');

        resetStatistics();
        attachStatisticsListener();

        console.log('AudioEngineDebug: Statistics collection enabled');
    }

    /**
     * Disable statistics collection
     */
    function disableStatistics() {
        if (!statisticsEnabled) return;

        statisticsEnabled = false;
        localStorage.setItem('ps_audioEngineDebug_statisticsEnabled', 'false');

        console.log('AudioEngineDebug: Statistics collection disabled');
    }

    /**
     * Enable the debug overlay
     */
    function enableOverlay() {
        if (overlayEnabled) return;

        overlayEnabled = true;
        localStorage.setItem('ps_audioEngineDebug_overlayEnabled', 'true');

        createOverlayElement();

        bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('audioEngineDebug')).show();

        // Enable statistics if not already enabled
        if (!statisticsEnabled) {
            enableStatistics();
        }

        updateOverlay();

        console.log('AudioEngineDebug: Overlay enabled');
    }

    /**
     * Disable the debug overlay
     */
    function disableOverlay() {
        if (!overlayEnabled) return;

        overlayEnabled = false;
        localStorage.setItem('ps_audioEngineDebug_overlayEnabled', 'false');

        const debugDiv = document.getElementById('audioEngineDebug');
        if (debugDiv !== null) {
            bootstrap.Offcanvas.getOrCreateInstance(debugDiv).hide();
        }

        console.log('AudioEngineDebug: Overlay disabled');
    }

    /**
     * Get the current statistics
     * @returns {Object} Statistics object (not a copy - callers are trusted)
     */
    function getStatistics() {
        return statistics;
    }

    /**
     * Initialize the module - restore state from localStorage
     */
    function init() {
        // Restore statistics listener if it was enabled
        if (statisticsEnabled) {
            attachStatisticsListener();
            console.log('AudioEngineDebug: Statistics collection restored from localStorage');
        }

        // Restore overlay if it was enabled
        if (overlayEnabled) {
            createOverlayElement();

            // Ensure statistics are enabled if overlay is enabled
            if (!statisticsEnabled) {
                statisticsEnabled = true;
                attachStatisticsListener();
            }

            updateOverlay();
            console.log('AudioEngineDebug: Overlay restored from localStorage');
        }
    }

    // Self-initialize: restore state from localStorage on load
    init();

    // Public API
    return {
        enableStatistics,
        disableStatistics,
        enableOverlay,
        disableOverlay,
        getStatistics,
    };
})();
