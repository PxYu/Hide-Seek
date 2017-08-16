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
            // $('#start_btn').hide();
            // $('#stop_btn').show();

            $('#myonoffswitch').prop('checked', true);
        } else {
            // $('#start_btn').show();
            // $('#stop_btn').hide();

            $('#myonoffswitch').prop('checked', false);
        }
    }
    showHideButton();

    var startHandle = function() {
        BGPage.popupSettings.started = true;
        BGPage.savePopupSettings();

        showHideButton();

        // fixedAlert('启动成功');
    }

    var stopHandle = function() {
        BGPage.popupSettings.started = false;
        BGPage.savePopupSettings();

        showHideButton();

        // fixedAlert('停止成功');

        BGPage.keywordsPools = [];
    }

    // $('#start_btn').click(startHandle);
    // $('#stop_btn').click(stopHandle);

    $('#myonoffswitch').click(function() {
        if ($(this).prop('checked')) {
            startHandle();
        } else {
            stopHandle();
        }
    });
});