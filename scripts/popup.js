$(function() {
    var acc = $(".accordion");
    var i;
    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        }
    }

    var alertTime;
    var fixedAlert = function(text, type) {
        $('#alert').html('<div class="alert alert-' + (type || 'success') + '">' + text + '</div>')
        if (alertTime) {
            clearTimeout(alertTime);
        }
        alertTime = setTimeout(function() {
            $('#alert').html('');
        }, 1500);
    }

    var bgp = chrome.extension.getBackgroundPage();
    var popupSettings = store.get('popupSettings');

    var initialize_state = function() {

        // display current states
        $("#button1").prop('checked', popupSettings.started);
        $("#button2").prop('checked', popupSettings.rerank);
        $("#numcover").val(popupSettings.numcover);
        $("#smlt_to").val(popupSettings.smlt_to);

        //change variables in bgp
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
            bgp.keywordsPools = [];
        } else {
            $("#button2").prop("disabled", false);
            $("#numcover").prop("disabled", false);
            $("#smlt_to").prop("disabled", false);
        }

        store.set('popupSettings', popupSettings);
    }

    var update_state = function() {
        initialize_state();
        fixedAlert("Settings saved!", "success");
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
            fixedAlert("Setting out of bound!", "warning");
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
            fixedAlert("Setting out of bound!", "warning");
            $("#smlt_to").val(popupSettings.smlt_to);
        }
    })

    initialize_state();
});