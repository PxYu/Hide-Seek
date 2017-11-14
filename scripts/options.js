'use strict';

var bgp = chrome.extension.getBackgroundPage();
var popupSettings = store.get('popupSettings');

var initialize_state = function() {
    $("#button1").prop('checked', popupSettings.started);
    $("#button2").prop('checked', popupSettings.rerank);
    $("#numcover").val(popupSettings.numcover);
    $("#smlt_to").val(popupSettings.smlt_to);
    bgp.popupSettings.started = popupSettings.started;
    bgp.popupSettings.rerank = popupSettings.rerank;
    bgp.popupSettings.numcover = popupSettings.numcover;
    bgp.popupSettings.smlt_to = popupSettings.smlt_to;
    if (!popupSettings.started) {
        bgp.popupSettings.rerank = false;
        popupSettings.rerank = false;
        $("#button2").prop('checked', false);
        $("#button2").prop("disabled", true);
        $("#numcover").prop("disabled", true);
        $("#smlt_to").prop("disabled", true);
    } else {
        $("#button2").prop("disabled", false);
        $("#numcover").prop("disabled", false);
        $("#smlt_to").prop("disabled", false);
    }
    store.set('popupSettings', popupSettings);
}

var update_state = function() {
    initialize_state();
    $("#status").text("Settings saved!");
    setTimeout(function() {
        $("#status").text('');
    }, 1500);
}

$("#button1").change(function() {
    popupSettings.started = this.checked;
    update_state();
})

$("#button2").change(function() {
    popupSettings.rerank = this.checked;
    update_state();
})


$("#numcover").change(function() {
    var numcover = parseInt($("#numcover").val());
    if (numcover >= 2 && numcover <= 8) {
        popupSettings.numcover = numcover;
        update_state();
    } else {
        $("#status").text("Setting out of bound!");
        setTimeout(function() {
            $("#status").text('');
        }, 1500);
        $("#numcover").val(popupSettings.numcover);
    }
})

$("#smlt_to").change(function() {
    var smlt = parseInt($("#smlt_to").val());
    console.log(smlt);
    if (smlt >= 10 && smlt <= 60) {
        popupSettings.smlt_to = smlt;
        update_state();
    } else {
        $("#status").text("Setting out of bound!");
        setTimeout(function() {
            $("#status").text('');
        }, 1500);
        $("#smlt_to").val(popupSettings.smlt_to);
    }
})

console.log(popupSettings.started);
console.log(popupSettings.rerank);
console.log(popupSettings.numcover);
console.log(popupSettings.smlt_to);
initialize_state();