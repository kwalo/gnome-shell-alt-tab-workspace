const Lang = imports.lang;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const AltTab = imports.ui.altTab;
const SwitcherPopup = imports.ui.switcherPopup;

const AltTabWorkspace = new Lang.Class({
    Name: 'AltTabWorkspace',

    _init : function () {
        // Store orginal version of methods if user wants to
        // disable extension
        this._originalAppSwitcherInit = AltTab.AppSwitcher.prototype._init;
    },

    // Modify _init function of AppSwitcher class, so it returns only windows
    // from current workspace
    _modifiedAppSwitcherInit : function () {
        return function (apps, altTabPopup) {
            // Call parent class' _init method. We can't use this.parent here.
            SwitcherPopup.SwitcherList.prototype._init.call(this, true);

            this.icons = [];
            this._arrows = [];

            let windowTracker = Shell.WindowTracker.get_default();
            let workspace = global.screen.get_active_workspace()
                let allWindows = global.display.get_tab_list(Meta.TabList.NORMAL,
                        global.screen, workspace);

            // Construct the AppIcons, add to the popup
            for (let i = 0; i < apps.length; i++) {
                let appIcon = new AltTab.AppIcon(apps[i]);
                // Cache the window list now; we don't handle dynamic changes here,
                // and we don't want to be continually retrieving it
                let cachedWindows = allWindows.filter(function(w) {
                    return windowTracker.get_window_app (w) == appIcon.app;
                });
                if (cachedWindows.length > 0) {
                    appIcon.cachedWindows = cachedWindows;
                    this._addIcon(appIcon);
                }
            }

            this._curApp = -1;
            this._iconSize = 0;
            this._altTabPopup = altTabPopup;
            this._mouseTimeOutId = 0;

            this.actor.connect('destroy', Lang.bind(this, this._onDestroy));
        }
    },
    
    enable : function () {
        AltTab.AppSwitcher.prototype._init = this._modifiedAppSwitcherInit();
    },

    disable : function () {
        AltTab.AppSwitcher.prototype._init = this._originalAppSwitcherInit;
    },
});

function init(metadata) {
    // enable and disable methods of this object will be called to
    // activate/deactivate extension
    return new AltTabWorkspace();
}
