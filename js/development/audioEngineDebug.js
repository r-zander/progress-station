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
                max: Infinity,
                total: Infinity,
            },
            highestProgressSpeed: {
                avg: 0,
                max: 0,
                total: 0,
            },
        },
        lastMinuteAvg: {
            avgProgressSpeeds: [], // Capped to targetTicksPerSecond * 60 entries
            avgProgressSpeed: 0, // average of avgProgressSpeeds
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
        const max = musicContext.maxProgressSpeed;
        const total = musicContext.totalProgressSpeed;

        // Update all-time statistics for each measurement
        if (avg < statistics.allTime.lowestProgressSpeed.avg) {
            statistics.allTime.lowestProgressSpeed.avg = avg;
        }
        if (avg > statistics.allTime.highestProgressSpeed.avg) {
            statistics.allTime.highestProgressSpeed.avg = avg;
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
        statistics.lastMinuteAvg.maxProgressSpeeds.push(musicContext.maxProgressSpeed);
        statistics.lastMinuteAvg.totalProgressSpeeds.push(musicContext.totalProgressSpeed);

        // Trim buffers to max size (remove oldest entries)
        if (statistics.lastMinuteAvg.avgProgressSpeeds.length > maxEntries) {
            statistics.lastMinuteAvg.avgProgressSpeeds.shift();
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
     * Update the debug overlay with current statistics
     */
    function updateOverlay() {
        if (!overlayEnabled) return;

        const debugDiv = document.getElementById('audioEngineDebug');
        if (!debugDiv) return;

        // Remove hidden class and update content
        debugDiv.classList.remove('hidden');
        debugDiv.innerHTML = `
            <div style="font-family: monospace; font-size: 12px; border: 2px solid white; padding: 3px;">
                <strong>Music Context Statistics</strong>
                <hr style="margin: 5px 0;">
                <div style="margin-bottom: 8px;">
                    <strong>Current Values:</strong><br>
                    Highest Attr: ${musicContext.highestAttribute}<br>
                    Avg Speed: ${formatValue(musicContext.avgProgressSpeed)}<br>
                    Max Speed: ${formatValue(musicContext.maxProgressSpeed)}<br>
                    Total Speed: ${formatValue(musicContext.totalProgressSpeed)}<br>
                    Danger Level: ${formatValue(musicContext.dangerLevel)}<br>
                    Battles: ${musicContext.numberOfEngagedBattles}<br>
                    State: ${musicContext.gameState}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>All-Time Lowest:</strong><br>
                    Avg: ${formatValue(statistics.allTime.lowestProgressSpeed.avg)}<br>
                    Max: ${formatValue(statistics.allTime.lowestProgressSpeed.max)}<br>
                    Total: ${formatValue(statistics.allTime.lowestProgressSpeed.total)}
                </div>
                <div style="margin-bottom: 8px;">
                    <strong>All-Time Highest:</strong><br>
                    Avg: ${formatValue(statistics.allTime.highestProgressSpeed.avg)}<br>
                    Max: ${formatValue(statistics.allTime.highestProgressSpeed.max)}<br>
                    Total: ${formatValue(statistics.allTime.highestProgressSpeed.total)}
                </div>
                <div>
                    <strong>Last Minute Avg:</strong><br>
                    Avg Speed: ${formatValue(statistics.lastMinuteAvg.avgProgressSpeed)}<br>
                    Max Speed: ${formatValue(statistics.lastMinuteAvg.maxProgressSpeed)}<br>
                    Total Speed: ${formatValue(statistics.lastMinuteAvg.totalProgressSpeed)}<br>
                    Samples: ${statistics.lastMinuteAvg.totalProgressSpeeds.length}
                </div>
            </div>
        `;
    }

    /**
     * Reset statistics to initial values
     * @private
     */
    function resetStatistics() {
        statistics.allTime.lowestProgressSpeed.avg = Infinity;
        statistics.allTime.lowestProgressSpeed.max = Infinity;
        statistics.allTime.lowestProgressSpeed.total = Infinity;
        statistics.allTime.highestProgressSpeed.avg = 0;
        statistics.allTime.highestProgressSpeed.max = 0;
        statistics.allTime.highestProgressSpeed.total = 0;
        statistics.lastMinuteAvg.avgProgressSpeeds = [];
        statistics.lastMinuteAvg.avgProgressSpeed = 0;
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
            '<div id="audioEngineDebug" class="position-fixed end-0 p-3 text-bg-dark hidden" style="top: 60px; z-index: 2000; max-width: 300px;"></div>'
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
        if (debugDiv) {
            debugDiv.remove();
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
