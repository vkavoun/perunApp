var $ = require("jquery");

function DispatchManager() {
    this.initialized = false;
}

DispatchManager.prototype.init = function () {
    if(!this.initialized) {
        this.initialized = true;
        this.eventCatcher = $("body");
    }
};

DispatchManager.prototype.addActionListener = function (event, func, scope) {
    this.eventCatcher.on(event, _.bind(func, scope));
};

DispatchManager.prototype.dispatchEvent = function (event, data) {
    this.eventCatcher.trigger(event, data);
};

export var dispatchManager = DispatchManager;