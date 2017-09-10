var currentpanel;
var lastcaller;
function showpanel(id,caller = document.getElementById("firstbtn")) {
  if (currentpanel) {
    document.getElementById(currentpanel).className = "panel bottom";
  }
  if (lastcaller) {
    lastcaller.className = "sidebtn";
  }
  document.getElementById(id).className = "panel top";
  caller.className = "highlightedbtn";
  currentpanel = id;
  lastcaller = caller;
}
