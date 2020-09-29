var fullscreenEnabled = false;
var refreshEnabled = true;

var rotation_time = 60 * 1000;

var rotation_running = false;

function nextIdxCalculator(idx, max) {
    return (idx < max) ? (idx + 1) : 0;
}

function rotateTabs() {
    try {
	chrome.tabs.query({
	    active: true,
	    windowType: "normal",
	    currentWindow: true
	},
			  function(tabArray) {

			      var curTab = tabArray[0];
			      chrome.windows.get(curTab.windowId, {
				  populate: true
			      },
						 function(window) {
						     var selectedTabIdx = 0;
						     for (var i = 0; i < window.tabs.length; i++) {
							 if (window.tabs[i].active) {
							     selectedTabIdx = i;
							     break;
							 }
						     }

						     var nextIdx = nextIdxCalculator(selectedTabIdx,
										     (window.tabs.length - 1));
						     var nextIdxPlus1 = nextIdxCalculator(nextIdx,
											  (window.tabs.length - 1));


						     chrome.tabs.update(window.tabs[nextIdx].id, {
							 active: true
						     });
						     if (refreshEnabled) {
							 chrome.tabs.reload(window.tabs[nextIdxPlus1].id);
						     }
						     if (fullscreenEnabled) {
							 chrome.windows.update(curTab.windowId, {
							     state: "fullscreen"
							 });
						     }
						 });
			  })
    } catch (e) {
	console.log(e);
    }
};

chrome.commands.onCommand.addListener(function(command) {
    console.log("command:"+command)
    switch (command) {
    case "toggle-rotation":
	rotation_running = !rotation_running;
	console.log("[toggle-rotation] rotation_running == " + rotation_running);

	runner();
	break;
    }
    return true;
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runner() {
    console.log("in runner");

    while (this.rotation_running) {
	rotateTabs();
	await sleep(rotation_time);
    }
};
