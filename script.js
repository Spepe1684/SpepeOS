

// Make the DIV element draggable:
dragElement(document.getElementById("welcome"));

// Step 1: Define a function called `dragElement` that makes an HTML element draggable.
function dragElement(element) {
  // Step 2: Set up variables to keep track of the element's position.
  var initialX = 0;
  var initialY = 0;
  var movementX = 0;
  var movementY = 0;
  var wasDragged = false;

  // Step 3: Check if there is a special header element associated with the draggable element.
  if (document.getElementById(element.id + "header")) {
    // Step 4: If present, assign the `dragMouseDown` function to the header's `onmousedown` event.
    // This allows you to drag the window around by its header.
    document.getElementById(element.id + "header").onmousedown = startDragging;
  } else {
    // Step 5: If not present, assign the function directly to the draggable element's `onmousedown` event.
    // This allows you to drag the window by holding down anywhere on the window.
    element.onmousedown = startDragging;
  }

  // Step 6: Define the `startDragging` function to capture the initial mouse position and set up event listeners.
  function startDragging(e) {
    e = e || window.event;
    if (element.classList.contains("desktop-app") && !element.classList.contains("selected")) {
      return;
    }
    e.preventDefault();
    wasDragged = false;
    // Step 7: Get the mouse cursor position at startup.
    initialX = e.clientX;
    initialY = e.clientY;
    // Step 8: Set up event listeners for mouse movement (`elementDrag`) and mouse button release (`closeDragElement`).
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  // Step 9: Define the `elementDrag` function to calculate the new position of the element based on mouse movement.
  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    var deltaX = e.clientX - initialX;
    var deltaY = e.clientY - initialY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
      wasDragged = true;
    }
    movementX += deltaX;
    movementY += deltaY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.translate = movementX + "px " + movementY + "px";
  }

  // Step 12: Define the `stopDragging` function to stop tracking mouse movement by removing the event listeners.
  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
    if (wasDragged) {
      element.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }, { once: true, capture: true });
    }
  }
}

var welcomeScreen = document.querySelector("#welcome")

function openWindow(element) {
  element.style.display = "flex"
}

function closeWindow(element) {
  element.style.display = "none"
}

var biggestIndex = 1;

function handleWindowTap(element) {
  biggestIndex += 1;
  element.style.zIndex = biggestIndex;
}

function addWindowTapHandling(element) {
  element.addEventListener("mousedown", function() {
    handleWindowTap(element);
  });
}

var welcomeScreenClose = document.querySelector("#welcomeclose")

var welcomeScreenOpen = document.querySelector("#welcomeopen")

welcomeScreenClose.addEventListener("click", function() {
  closeWindow(welcomeScreen);
});

welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
});

var notesWindow = document.querySelector("#notes")
var notesWindowClose = document.querySelector("#notesclose")

addWindowTapHandling(welcomeScreen);
addWindowTapHandling(notesWindow);

notesWindowClose.addEventListener("click", function() {
  closeWindow(notesWindow);
});

var selectedIcon = undefined

function selectIcon(element) {
  element.classList.add("selected");
  selectedIcon = element
} 
function deselectIcon(element) {
  element.classList.remove("selected");
  selectedIcon = undefined
}

function handleIconTap(element) {
  if (element.classList.contains("selected")) {
    deselectIcon(element)
    openWindow(notesWindow)
  } else {
    if (selectedIcon) {
      deselectIcon(selectedIcon)
    }
    selectIcon(element)
  }
}

var desktopIcon = document.querySelector("#desktopApps > div")
desktopIcon.addEventListener("click", function() {
  handleIconTap(desktopIcon)
})

dragElement(desktopIcon)
dragElement(notesWindow)

