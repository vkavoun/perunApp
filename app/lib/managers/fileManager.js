var fs = require("fs-jetpack");

import {Event} from "../event/event.js";
import {dispatchManager} from "./dispatchManager.js";

function FileManager() {
    if(_instance == null) {
        this.templateFolder = "./lib/view/templates";
        this.init();
    }
}

FileManager.prototype.init = function () {
    var self = this;
    dispatchManager.init();

    dispatchManager.addActionListener(Event.createEvent(Event.VIEW.FILE_REQUEST),
        function (request) {
            fs.readAsync(request.fileName, function (file) {
                dispatchManager.dispatchEvent(Event.createEvent(Event.VIEW.FILE_RESPONSE), file);
            });
        }, this);

    dispatchManager.addActionListener(Event.createEvent(Event.VIEW.TEMPLATE_REQUEST),
        function (request) {
            fs.readAsync(self.templateFolder + "/" + request.result.templateName).then(function (file) {
                dispatchManager.dispatchEvent(Event.createEvent(Event.VIEW.TEMPLATE_RESPONSE), {
                    viewName:request.result.viewName,
                    target: request.result.target ? request.result.target : null,
                    html: file
                });
            });
        }, this);
};

var _instance = new FileManager();

export var fileManager = _instance;