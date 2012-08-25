const Lang = imports.lang;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const AltTab = imports.ui.altTab;

const AltTabWorkspace = new Lang.Class({
    Name: 'AltTabWorkspace',

    _init : function () {
        // Store orginal version of methods if user wants to
        // disable extension
        this._originalGetAppLists = AltTab.AltTabPopup.prototype._getAppLists;
        this._originalAppSwitcherInit = AltTab.AppSwitcher.prototype._init;
    },

    // Make getAppLists function return only windows from current workspace
    _modifiedGetAppLists : function () {
        let getAppLists = this._originalGetAppLists;
        return function () {
            let [apps, allApps] = getAppLists();
            return [apps, []];
        };
    },

    // Modify _init function of AppSwitcher class, so it returns only windows
    // from current workspace
    _modifiedAppSwitcherInit : function () {
        return function (localApps, otherApps, altTabPopup) {
            // Call parent class' _init method. We can't use this.parent here.
            AltTab.SwitcherList.prototype._init.call(this, true);

            // Construct the AppIcons, add to the popup
            let activeWorkspace = global.screen.get_active_workspace();
            let workspaceIcons = [];
            let otherIcons = [];
            for (let i = 0; i < localApps.length; i++) {
                let appIcon = new AltTab.AppIcon(localApps[i]);
                // Cache the window list now; we don't handle dynamic changes here,
                // and we don't want to be continually retrieving it.
                // We add only windows from current workspace.
                appIcon.cachedWindows = [];
                let windows = appIcon.app.get_windows();
                for (let j = 0; j < windows.length; ++j) {
                    if (windows[j].get_workspace() == activeWorkspace) {
                        appIcon.cachedWindows.push(windows[j]);
                    }
                }
                workspaceIcons.push(appIcon);
            }

            this.icons = [];
            this._arrows = [];
            for (let i = 0; i < workspaceIcons.length; i++)
                this._addIcon(workspaceIcons[i]);

            this._curApp = -1;
            this._iconSize = 0;
            this._altTabPopup = altTabPopup;
            this._mouseTimeOutId = 0;
        }
    },
    
    enable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._modifiedGetAppLists();
        AltTab.AppSwitcher.prototype._init = this._modifiedAppSwitcherInit();
    },

    disable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._originalGetAppLists;
        AltTab.AppSwitcher.prototype._init = this._originalAppSwitcherInit;
    },
});

function init(metadata) {
    // enable and disable methods of this object will be called to
    // activate/deactivate extension
    return new AltTabWorkspace();
}
