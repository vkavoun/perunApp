var $ = require("jquery");

function DispatchManager() {
    this.initialized = false;
}

DispatchManager.prototype.init = function () {
    if (!this.initialized) {
        this.initialized = true;
    }
};

DispatchManager.prototype.addActionListener = function (event, func, scope) {
    $(event.target).on(event.event, function (e, data) {
        func.call(scope, {
            event:  event,
            result: data
        });
    });
};

DispatchManager.prototype.dispatchEvent = function (event, data) {
    $(event.target).trigger(event.event, data);
};

var _instance = new DispatchManager();
_instance.init();

export var dispatchManager = _instance;