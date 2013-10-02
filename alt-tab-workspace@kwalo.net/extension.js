const Lang = imports.lang;
const Gio = imports.gi.Gio;

const AltTabWorkspace = new Lang.Class({
    Name: 'AltTabWorkspace',

    _init : function () {
        this._settings = new Gio.Settings({ schema: 'org.gnome.shell.app-switcher'});
    },

    enable : function () {
        this._settings.set_boolean('current-workspace-only', true);
    },

    disable : function () {
        this._settings.set_boolean('current-workspace-only', false);
    },
});

function init(metadata) {
    // enable and disable methods of this object will be called to
    // activate/deactivate extension
    return new AltTabWorkspace();
}
