/* ==============================================================================
    Usage:
    -----------------------------------------------------------------------------
    Call a11yHelp.init() after DOM content load, passing in a settings object
    that includes settings for:

            mode:           polite = click/enter
                            rude = hover/focus

            triggerPos:     right
                            left
                            (which side of the label will the
                             help icon be displayed on)
    -----------------------------------------------------------------------------
    Example:
    -----------------------------------------------------------------------------
        window.addEventListener('DOMContentLoaded', function () {
            TxGov.a11yHelp.init({
                mode: 'polite',
                triggerPos: 'right'
            });
        }, false);
   ============================================================================== */

var TxGov = TxGov || {};

(function (txgov) {

    'use strict';

    txgov.a11yHelp = {

        /*
            Properties
        */

        settings: {
            // default: can be overridden during initialization
            mode: 'polite',
            triggerPos: 'right'
        },

        targets: null,
        triggers: null,
        
        /*
            Methods
        */

        showHelp: function (e) {

            e.preventDefault();
            e.stopPropagation();

            var a11yHelp = txgov.a11yHelp,
                mode = a11yHelp.settings.mode;

            // Hide other balloons when opening one (only needed in polite mode)
            if (mode === 'polite') a11yHelp.hideAllTargets();

            // Show help
            a11yHelp.setStyles(this.target, {
                display: 'block'
            });
            this.helpOn = true;

            // Configure handlers
            a11yHelp.configureHandlers(this);
        },

        hideHelp: function (e) {

            e.preventDefault();
            e.stopPropagation();

            var a11yHelp = txgov.a11yHelp;

            // Hide help
            a11yHelp.setStyles(this.target, {
                display: 'none'
            });
            this.helpOn = false;

            // Configure handlers
            txgov.a11yHelp.configureHandlers(this);
        },

        /*
            Helpers
        */

        configureHandlers: function (trigger) {
            var mode = txgov.a11yHelp.settings.mode,
                showHelp = txgov.a11yHelp.showHelp,
                hideHelp = txgov.a11yHelp.hideHelp;

            if (trigger.helpOn) {
                switch (mode) {
                    case "polite":
                        trigger.removeEventListener('click', showHelp, false);
                        trigger.addEventListener('click', hideHelp, false);
                        break;
                    case "rude":
                        trigger.removeEventListener('mouseover', showHelp, false);
                        trigger.removeEventListener('focus', showHelp, false);
                        trigger.addEventListener('click', function (e) { 
                                e.stopPropagation();
                                e.preventDefault();
                            }, false);
                        trigger.addEventListener('mouseout', hideHelp, false);
                        trigger.addEventListener('blur', hideHelp, false);
                        break;
                }
            } else {
                switch (mode) {
                    case "polite":
                        trigger.removeEventListener('click', hideHelp, false);
                        trigger.addEventListener('click', showHelp, false);
                        break;
                    case "rude":
                        trigger.removeEventListener('mouseout', hideHelp, false);
                        trigger.removeEventListener('blur', hideHelp, false);
                        trigger.addEventListener('click', function (e) { 
                                e.stopPropagation();
                                e.preventDefault();
                            }, false);
                        trigger.addEventListener('mouseover', showHelp, false);
                        trigger.addEventListener('focus', showHelp, false);
                        break;
                }
            }
        },

        hideAllTargets: function () {
            var a11yHelp = txgov.a11yHelp,
                triggers = a11yHelp.triggers,
                i = 0,
                trigger;

            for (; trigger = triggers[i]; i++) {
                a11yHelp.setStyles(trigger.target, {
                    display: 'none'
                });
                trigger.helpOn = false;

                // Configure handlers
                a11yHelp.configureHandlers(trigger);
            }
        },

        setStyles: function (elm, styles) {
            for (var style in styles) {
                elm.style[style] = styles[style];
            }
        },

        /*
            Initialize
        */

        init: function (settings) {

            var a11yHelp = txgov.a11yHelp;

            a11yHelp.initSettings(settings);
            a11yHelp.initElements();

        },

        initElements: function () {

            var a11yHelp = txgov.a11yHelp,
                triggers = document.querySelectorAll('.a11y-help'),
                targets = document.querySelectorAll('.a11y-help-content'),
                target, i = 0, trigger;

            // Sanity check
            if (triggers.length !== targets.length) {
                throw new Error('Number of .a11y-help triggers and .a11y-help-content targets should match.');
            }

            // Store triggers & targets
            a11yHelp.triggers = triggers;
            a11yHelp.targets = targets;

            // Setup triggers & targets
            for (; trigger = triggers[i]; i++) {
                // Init target
                target = targets[i];
                a11yHelp.initTarget(target);

                // Bind target to trigger and track target state
                Object.defineProperty(trigger, 'target', {
                    value: target
                });
                Object.defineProperty(trigger, 'helpOn', {
                    value: false,
                    writable: true
                });

                // Init trigger
                a11yHelp.initTrigger(trigger);
            }

        },

        initSettings: function (settings) {
            // Store custom settings
            if (typeof settings === 'object') {
                for (var setting in settings) {
                    if( settings.hasOwnProperty( setting ) ) {
                        txgov.a11yHelp.settings[setting] = settings[setting];
                    }
                }
            }
        },

        initTarget: function (target) {
            
            var a11yHelp = txgov.a11yHelp,
                close = target.querySelector('.a11y-help-close'),
                triggers = document.querySelectorAll('.a11y-help'),
                triggerPos = a11yHelp.settings.triggerPos,
                triggerWidth = getComputedStyle(triggers[0]).width;

            // Position bubble relative to parent label
            a11yHelp.setStyles( target.parentNode, { position: 'relative', overflow: 'visible' });

            // Set styles on target
            a11yHelp.setStyles(
                target,
                {
                    boxShadow: '0 0 5px #ccc',
                    position: 'absolute',
                    maxWidth: window.innerWidth,
                    left: triggerPos === 'left' ? triggerWidth : 'auto',
                    right: triggerPos === 'right' ? triggerWidth : 'auto',
                    top: '-5px'
                }
            );

            // Hide close link (in rude mode)
            if (a11yHelp.settings.mode === 'rude') {
                a11yHelp.setStyles(
                    close,
                    {
                        display: 'none'
                    }
                );
            }

            // Trigger the trigger's click event on 'close' click
            close.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                txgov.a11yHelp.hideAllTargets();
            }, false);
        },

        initTrigger: function (trigger) {
            var a11yHelp = txgov.a11yHelp;

            // Setup event handlers
            a11yHelp.configureHandlers(trigger);

            // Housekeeping
            trigger.setAttribute('href', 'javascript:void();');
            trigger.removeAttribute('title');
        }

    };

}(TxGov));
