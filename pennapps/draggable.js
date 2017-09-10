var lastX = new Map(); //map of object to last mouse position
var lastY = new Map();
var posX = new Map(); //map of object to position
var posY = new Map();
var currentobj; //object being dragged
var isGreen; //is currentobj green?
var isRed; //is currentobj red?
var justMade;

function totaloffset(elem) { //get total offset of object
  var pos = {
    top: elem.offsetTop,
    left: elem.offsetLeft
  };
  if (elem.offsetParent) {
    var p = totaloffset(elem.offsetParent);
    pos.top += p.top;
    pos.left += p.left;
  }
  return pos;
}
function getNearestElement() {
  if (isGreen) {
    //find which element it should come before
    var i = 0;
    var allGreens = document.getElementById("draggablecontainer").getElementsByClassName("draggable green");
    while (true) {
      if (i >= allGreens.length) { //reached the end of element list
        if (elem == currentobj) {
          return posY.get(currentobj) > 65 ? null : "end";
        }
        if (totaloffset(currentobj).top-totaloffset(elem).top > 65) {
          return null
        } else {
          return "end"
        }
      }
      var elem = allGreens.item(i)
      if (elem != currentobj && totaloffset(elem).top > totaloffset(currentobj).top) {
        return elem;
      }
      i++;
    }
  } else { //find the nearest blue object if it's close enough
    var elems = document.getElementById("draggablecontainer").getElementsByClassName("draggable blue");
    if (isRed) {
      //scrap that, find the neatest green object if it's close enough
      elems = document.getElementById("draggablecontainer").getElementsByClassName("draggable green");
    }
    var minDist = 65;
    var minElement;
    for (var i = 0;i<elems.length;i++) {
      var elem = elems.item(i);
      if (elem != currentobj && !elem.contains(currentobj) && !currentobj.contains(elem)) {
        var dist = Math.sqrt(Math.pow(totaloffset(elem).top-totaloffset(currentobj).top,2) +
          Math.pow(totaloffset(elem).left-totaloffset(currentobj).left,2));
        if (dist < minDist) {
          minDist = dist;
          minElement = elem;
        }
      }
    }
    if (!isRed) {
      //if it's blue, you can snap it back to its original place this way
      var dist = Math.sqrt(Math.pow(posX.get(currentobj),2)+Math.pow(posY.get(currentobj),2));
      if (dist<minDist) {
        minDist = dist;
        minElement = currentobj;
      }
    }
    return minElement;
  }
}
var highlightedDiv;
function highlightDiv(elem,writeinred) {
  if (highlightedDiv) {
    highlightedDiv.style.border = "none";
  }
  if (elem) {
    if (writeinred) {
      elem.style.border = "thick solid red";
    } else if (isGreen) {
      if (elem == "end") {
        var allGreens = document.getElementById("draggablecontainer").getElementsByClassName("draggable green");
        elem = allGreens.item(allGreens.length-1);
        elem.style.borderBottom = "thick solid yellow";
      } else {
        elem.style.borderTop = "thick solid yellow";
      }
    } else if (isRed) {
      elem.style.borderLeft = "thick solid yellow";
    } else {
      elem.style.border = "thick solid yellow";
    }
  }
  highlightedDiv = elem;
}

function draggablemousedown(e,targetOverride = null) {
  var elem = targetOverride || e.target;
  if (elem.tagName != "DIV") {
    return;
  }
  if (elem.innerHTML == "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;") {
    return;
  }
  isGreen = elem.className.search("green") != -1;
  isRed = elem.className.search("red") != -1;
  lastX.set(elem,e.clientX);
  lastY.set(elem,e.clientY);
  currentobj = elem;
  posX.set(elem,0);
  posY.set(elem,0);
  document.onmousemove = draggablemousemove;
  document.onmouseup = draggablemouseup;
  justMade = false;
}
function draggablemousemove() {
  e = window.event;
  var deltaX = e.clientX-lastX.get(currentobj);
  var deltaY = e.clientY-lastY.get(currentobj);
  lastX.set(currentobj,e.clientX);
  lastY.set(currentobj,e.clientY);
  posX.set(currentobj,posX.get(currentobj)+deltaX);
  posY.set(currentobj,posY.get(currentobj)+deltaY);
  currentobj.style.left = posX.get(currentobj) + "px";
  currentobj.style.top = posY.get(currentobj) + "px";

  var elem = getNearestElement();
  if (elem) {
    highlightDiv(elem);
  } else {
    highlightDiv(currentobj,true);
  }
}
function draggablemouseup() {
  elem = getNearestElement();

  document.onmousemove = null;
  document.onmouseup = null;

  highlightDiv(null);
  if (isGreen) {
    var target;
    if (elem == "end") {
      currentobj.parentElement.appendChild(currentobj);
      currentobj.style.left = "0px";
      currentobj.style.top = "0px";
      if (justMade) {
        var target = currentobj.parentElement.getElementsByClassName("draggable green").item(currentobj.parentElement.getElementsByClassName("draggable green").length-2);
      }
    } else if (elem) {
      currentobj.parentElement.insertBefore(currentobj,elem);
      currentobj.style.left = "0px";
      currentobj.style.top = "0px";
      if (justMade) {
        var i = 0;
        var allGreens = document.getElementById("draggablecontainer").getElementsByClassName("draggable green");
        while (true) {
          if (allGreens.item(i) == elem) {
            if (allGreens.item(i-1) == currentobj) {
              target = allGreens.item(i-2);
            } else {
              target = allGreens.item(i-1);
            }
            break;
          }
          i++;
        }
      }
    } else {
      currentobj.parentElement.removeChild(currentobj);
      return;
    }
    if (justMade) {
      console.log(target.innerHTML);
      var amt = (target.innerHTML+'>&nbsp;&nbsp;&nbsp;&nbsp;</div>').match(new RegExp('>&nbsp;&nbsp;&nbsp;&nbsp;</div>','g')).length-1;
      if (target.className.search("endswithcolon")!=-1) {
        amt++;
      }
      if (currentobj.innerHTML.search("else")!=-1 || currentobj.innerHTML.search("elif")!=-1) {
        amt--;
      }
      for (var i = 0;i<amt;i++) {
        currentobj.innerHTML = '<div class = "draggable red">&nbsp;&nbsp;&nbsp;&nbsp;</div>' + currentobj.innerHTML;
      }
    }

  } else if (isRed) {
    if (elem) {
      elem.insertBefore(currentobj,elem.firstChild);
      currentobj.style.left = "0px";
      currentobj.style.top = "0px";
    } else {
      currentobj.parentElement.removeChild(currentobj);
    }
  } else {
    if (currentobj.parentElement == document.getElementById("draggablecontainer")) {
      if (elem) {
        elem.innerHTML = currentobj.innerHTML;
      }
      currentobj.parentElement.removeChild(currentobj);
    } else if (elem) {
      var text = currentobj.innerHTML;
      currentobj.innerHTML = elem.innerHTML;
      elem.innerHTML = text;
    } else {
      currentobj.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }
    currentobj.style.left = "0px";
    currentobj.style.top = "0px";
  }
}

function registerdragevents() {
  var elems = document.getElementById("draggablecontainer").getElementsByClassName("draggable");
  for (var i = 0;i<elems.length;i++) {
    elems.item(i).onmousedown = draggablemousedown;
  }
}

//semidraggable objects spawn a clone of itself when you hold down
//your mouse on it
function semidraggablemousedown(e) {
  if (e.target.tagName != "DIV") {
    return
  }
  var elem;
  if (e.target.className.search("semidraggable")==-1) {
    elem = e.target.parentElement.cloneNode(true);
  } else {
    elem = e.target.cloneNode(true);
  }
  elem.className = elem.className.replace("semidraggable","draggable");
  document.getElementById("draggablecontainer").appendChild(elem);
  var positionDifference = totaloffset(e.target);
  positionDifference.top -= totaloffset(elem).top;
  positionDifference.left -= totaloffset(elem).left;
  draggablemousedown(e,elem);
  posX.set(elem,positionDifference.left);
  posY.set(elem,positionDifference.top);
  elem.style.left = positionDifference.left;
  elem.style.top = positionDifference.top;
  elem.onmousedown = draggablemousedown;
  justMade = true;
}

function registersemidragevents() {
  var elems = document.getElementById("semidraggablecontainer").getElementsByClassName("semidraggable");
  for (var i = 0;i<elems.length;i++) {
    elems.item(i).onmousedown = semidraggablemousedown;
  }
}
