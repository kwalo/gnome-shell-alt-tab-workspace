const Lang = imports.lang;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

const AltTab = imports.ui.altTab;

const AltTabWorkspace = new Lang.Class({
    Name: 'AltTabWorkspace',

    _init : function () {
        // Store orginal version of _getAppLists if users wants to
        // disable extension
        this._getAppLists_orig = AltTab.AltTabPopup.prototype._getAppLists;
    },

    // Make getAppLists function return only windows from current workspace
    _modifiedGetAppLists : function () {
        let getAppLists = this._getAppLists_orig;
        return function () {
            let [apps, allApps] = getAppLists();
            return [apps, []];
        };
    },
    
    enable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._modifiedGetAppLists();
    },

    disable : function () {
        AltTab.AltTabPopup.prototype._getAppLists = this._getAppLists_orig;
    },
});

function init(metadata) {
    // enable and disable methods of this object will be called to
    // activate/deactivate extension
    return new AltTabWorkspace();
}
