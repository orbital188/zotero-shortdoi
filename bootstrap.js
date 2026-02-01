// DOI Manager bootstrap for Zotero 6/7/8
dump("DOI Manager: Bootstrap file loaded\n");

if (typeof Zotero == 'undefined') {
    var Zotero;
}
var ShortDOI;
var chromeHandle;

let mainWindowListener;

function log(msg) {
    Zotero.debug("DOI Manager: " + msg);
}

// Helper function to get Services object
function getServices() {
    dump("DOI Manager: getServices() called\n");

    // First check if Services is already available as a global
    if (typeof Services !== 'undefined') {
        dump("DOI Manager: Services is already global\n");
        return Services;
    }

    dump("DOI Manager: Services not global, trying to import\n");

    // Try ESM import first (Zotero 8+ / Firefox 115+)
    try {
        if (typeof ChromeUtils !== 'undefined' && typeof ChromeUtils.importESModule === 'function') {
            dump("DOI Manager: Trying ChromeUtils.importESModule\n");
            let result = ChromeUtils.importESModule("resource://gre/modules/Services.sys.mjs");
            dump("DOI Manager: ESM import succeeded\n");
            return result.Services;
        }
    } catch (e) {
        dump("DOI Manager: ESM import failed: " + e + "\n");
    }

    // Try old JSM import (Zotero 6/7)
    try {
        if (typeof ChromeUtils !== 'undefined' && typeof ChromeUtils.import === 'function') {
            dump("DOI Manager: Trying ChromeUtils.import\n");
            let result = ChromeUtils.import("resource://gre/modules/Services.jsm");
            dump("DOI Manager: JSM import succeeded\n");
            return result.Services;
        }
    } catch (e) {
        dump("DOI Manager: JSM import failed: " + e + "\n");
    }

    dump("DOI Manager: Failed to get Services - no import method available\n");
    return null;
}

async function waitForZotero() {
    dump("DOI Manager: waitForZotero() called\n");

    if (typeof Zotero != 'undefined') {
        dump("DOI Manager: Zotero is defined, waiting for initialization\n");
        await Zotero.initializationPromise;
        dump("DOI Manager: Zotero initialization complete\n");
        return;
    }

    dump("DOI Manager: Zotero not defined, using Zotero 6 compatibility path\n");

    // Zotero 6 compatibility path
    var Services = getServices();
    if (!Services) {
        dump("DOI Manager: Could not get Services object in waitForZotero\n");
        return;
    }

    var windows = Services.wm.getEnumerator('navigator:browser');
    var found = false;
    while (windows.hasMoreElements()) {
        let win = windows.getNext();
        if (win.Zotero) {
            Zotero = win.Zotero;
            found = true;
            break;
        }
    }
    if (!found) {
        await new Promise((resolve) => {
            var listener = {
                onOpenWindow: function (aWindow) {
                    let domWindow = aWindow
                        .QueryInterface(Ci.nsIInterfaceRequestor)
                        .getInterface(
                            Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow
                        );
                    domWindow.addEventListener(
                        "load",
                        function () {
                            domWindow.removeEventListener(
                                "load",
                                arguments.callee,
                                false
                            );
                            if (domWindow.Zotero) {
                                Services.wm.removeListener(listener);
                                Zotero = domWindow.Zotero;
                                resolve();
                            }
                        },
                        false
                    );
                },
            };
            Services.wm.addListener(listener);
        });
    }
    await Zotero.initializationPromise;
}

// Adds main window open/close listeners in Zotero 6
function listenForMainWindowEvents() {
    var Services = getServices();
    mainWindowListener = {
        onOpenWindow: function (aWindow) {
            let domWindow = aWindow
                .QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
            async function onload() {
                domWindow.removeEventListener("load", onload, false);
                if (
                    domWindow.location.href !==
                    "chrome://zotero/content/standalone/standalone.xul"
                ) {
                    return;
                }
                onMainWindowLoad({ window: domWindow });
            }
            domWindow.addEventListener("load", onload, false);
        },
        onCloseWindow: async function (aWindow) {
            let domWindow = aWindow
                .QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
            if (
                domWindow.location.href !==
                "chrome://zotero/content/standalone/standalone.xul"
            ) {
                return;
            }
            onMainWindowUnload({ window: domWindow });
        },
    };
    Services.wm.addListener(mainWindowListener);
}

function removeMainWindowListener() {
    if (mainWindowListener) {
        var Services = getServices();
        Services.wm.removeListener(mainWindowListener);
    }
}

// Loads default preferences from prefs.js in Zotero 6
function setDefaultPrefs(rootURI) {
    var Services = getServices();
    var branch = Services.prefs.getDefaultBranch("");
    var obj = {
        pref(pref, value) {
            switch (typeof value) {
                case 'boolean':
                    branch.setBoolPref(pref, value);
                    break;
                case 'string':
                    branch.setStringPref(pref, value);
                    break;
                case 'number':
                    branch.setIntPref(pref, value);
                    break;
                default:
                    Zotero.logError(`Invalid type '${typeof (value)}' for pref '${pref}'`);
            }
        },
    };
    Services.scriptloader.loadSubScript(rootURI + "prefs.js", obj);
}

async function install() {
    dump("DOI Manager: install() called\n");
    await waitForZotero();
    log("Installed");
}

async function startup({ id, version, resourceURI, rootURI = resourceURI.spec }) {
    dump("DOI Manager: startup() called\n");

    try {
        await waitForZotero();
        dump("DOI Manager: waitForZotero completed\n");

        log("Starting");

        var Services = getServices();
        if (!Services) {
            dump("DOI Manager: Could not get Services in startup\n");
            return;
        }

        dump("DOI Manager: Got Services, platformMajorVersion = " + Zotero.platformMajorVersion + "\n");

        if (Zotero.platformMajorVersion < 102) {
            listenForMainWindowEvents();
            setDefaultPrefs(rootURI);
        }

        var aomStartup = Cc[
            "@mozilla.org/addons/addon-manager-startup;1"
        ].getService(Ci.amIAddonManagerStartup);
        var manifestURI = Services.io.newURI(rootURI + "chrome.manifest");
        chromeHandle = aomStartup.registerChrome(manifestURI, []);
        dump("DOI Manager: Chrome registered\n");

        // Load main script
        dump("DOI Manager: Loading zoteroshortdoi.js from " + rootURI + "\n");
        try {
            Services.scriptloader.loadSubScript(rootURI + "zoteroshortdoi.js");
            dump("DOI Manager: zoteroshortdoi.js loaded\n");
        } catch (e) {
            dump("DOI Manager: Failed to load zoteroshortdoi.js: " + e + "\n");
            Zotero.logError("DOI Manager: Failed to load zoteroshortdoi.js: " + e);
            return;
        }

        if (typeof ShortDOI === 'undefined') {
            dump("DOI Manager: ShortDOI is undefined after loading script\n");
            return;
        }

        dump("DOI Manager: Initializing ShortDOI\n");
        ShortDOI.init({ id, version, rootURI: rootURI || (resourceURI && resourceURI.spec) });
        log("ShortDOI.init completed");

        if (Zotero.platformMajorVersion >= 102) {
            log("Registering preference pane for Zotero 7+");
            Zotero.PreferencePanes.register({
                pluginID: 'zoteroshortdoi@wiernik.org',
                src: rootURI + 'content/options.xhtml',
            });
        }

        log("Calling addToAllWindows");
        ShortDOI.addToAllWindows();
        log("addToAllWindows completed");
        dump("DOI Manager: startup() completed successfully\n");

    } catch (e) {
        dump("DOI Manager: Error in startup(): " + e + "\n");
        if (typeof Zotero !== 'undefined') {
            Zotero.logError("DOI Manager: Error in startup(): " + e);
        }
    }
}

function onMainWindowLoad({ window }) {
    dump("DOI Manager: onMainWindowLoad called\n");
    if (typeof ShortDOI !== 'undefined') {
        ShortDOI.addToWindow(window);
    } else {
        dump("DOI Manager: ShortDOI undefined in onMainWindowLoad\n");
    }
}

function onMainWindowUnload({ window }) {
    if (typeof ShortDOI !== 'undefined') {
        ShortDOI.removeFromWindow(window);
    }

    window.addEventListener(
        "unload",
        function (e) {
            if (typeof ShortDOI !== 'undefined' && ShortDOI.notifierID) {
                Zotero.Notifier.unregisterObserver(ShortDOI.notifierID);
            }
        },
        false
    );
}

function shutdown() {
    dump("DOI Manager: shutdown() called\n");

    if (typeof Zotero !== 'undefined') {
        log("Shutting down");
    }

    if (typeof Zotero !== 'undefined' && Zotero.platformMajorVersion < 102) {
        removeMainWindowListener();
    }

    if (chromeHandle) {
        chromeHandle.destruct();
        chromeHandle = null;
    }

    if (typeof ShortDOI !== 'undefined') {
        ShortDOI.removeFromAllWindows();
        ShortDOI = undefined;
    }
}

function uninstall() {
    dump("DOI Manager: uninstall() called\n");
    if (typeof Zotero == 'undefined') {
        dump("DOI Manager: Uninstalled\n\n");
        return;
    }
    log("Uninstalled");
}

dump("DOI Manager: Bootstrap file parsing complete\n");
