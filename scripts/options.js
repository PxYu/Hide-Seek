'use strict';
console.log("options.js")

var bgp = chrome.extension.getBackgroundPage();
var popupSettings = store.get('popupSettings');

var time = popupSettings.date;
var uuid = popupSettings.uuid;

var update_state = function() {
    $("#button1").prop('checked', popupSettings.started);
    $("#button2").prop('checked', popupSettings.rerank);
    bgp.popupSettings.started = popupSettings.started;
    bgp.popupSettings.rerank = popupSettings.rerank;
    if (!popupSettings.started) {
        $("#button2").prop("disabled", true);
    } else {
        $("#button2").prop("disabled", false);
    }
    store.set('popupSettings', popupSettings);
}

$("#button1").change(function() {
    popupSettings.started = this.checked;
    if (!popupSettings.started) {
        // extension is off
        // popupSettings.rerank = false;
        // $("#button2").prop("disabled", true);
    } else {
        // extension is on
        // $("#button2").prop("disabled", false);
    }
    update_state();
})

$("#button2").change(function() {
    popupSettings.rerank = this.checked;
    update_state();
})
console.log(popupSettings.started);
console.log(popupSettings.rerank);
update_state();