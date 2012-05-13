const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const AltTab = imports.ui.altTab;

function AltTabWorkspace () {
    this._init();
}

AltTabWorkspace.prototype = {
    _init : function () {
        // Store orginal version of _getAppLists if users wants to
        // disable extension
        this._getAppLists_orig = AltTab.AltTabPopup.prototype._getAppLists;
    },

    // Monkey patched version of AltTabPopup._getAppLists.
    // It's the same as original, but doesn't return windows from other
    // workspaces.
    _getAppLists_patched: function() {
        let tracker = Shell.WindowTracker.get_default();
        let appSys = Shell.AppSystem.get_default();
        let allApps = appSys.get_running ();

        let screen = global.screen;
        let display = screen.get_display();
        let windows = display.get_tab_list(Meta.TabList.NORMAL, screen,
                                           screen.get_active_workspace());

        // windows is only the windows on the current workspace. For
        // each one, if it corresponds to an app we know, move that
        // app from allApps to apps.
        let apps = [];
        for (let i = 0; i < windows.length && allApps.length != 0; i++) {
            let app = tracker.get_window_app(windows[i]);
            let index = allApps.indexOf(app);
            if (index != -1) {
                apps.push(app);
                allApps.splice(index, 1);
            }
        }

        // Now @apps is a list of apps on the current workspace, in
        // standard Alt+Tab order (MRU except for minimized windows),
        // and allApps is a list of apps that only appear on other
        // workspaces, @allApps contains windows from all workspaces.
        // We don't want that in results
        return [apps, []];
    },
    
    enable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._getAppLists_patched;
    },

    disable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._getAppLists_orig;
    },
};

function init(metadata) {
    // enable and disable methods of this object will be called to
    // activate/deactivate extension
    return new AltTabWorkspace();
}
