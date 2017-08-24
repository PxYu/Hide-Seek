$(function() {
    var BGPage = chrome.extension.getBackgroundPage();

    var alertTime;
    var fixedAlert = function(text, type) {
        $('#alert').html('<div class="alert alert-' + (type || 'success') + '">' + text + '</div>')
        if (alertTime) {
            clearTimeout(alertTime);
        }
        alertTime = setTimeout(function() {
            $('#alert').html('');
        }, 1200);
    }

    var showHideButton = function() {
        if (BGPage.popupSettings.started) {
            $('#myonoffswitch').prop('checked', true);
        } else {
            $('#myonoffswitch').prop('checked', false);
        }
    }
    showHideButton();

    var startHandle = function() {
        BGPage.popupSettings.started = true;
        BGPage.savePopupSettings();

        showHideButton();
    }

    var stopHandle = function() {
        BGPage.popupSettings.started = false;
        BGPage.savePopupSettings();

        showHideButton();
        BGPage.keywordsPools = [];
    }

    $('#myonoffswitch').click(function() {
        if ($(this).prop('checked')) {
            startHandle();
        } else {
            stopHandle();
        }
    });
});