

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

function openWindow(element) {
  element.style.display = "flex";
  biggestIndex++;  // Increment biggestIndex by 1
  element.style.zIndex = biggestIndex;
}

function makeClosable(elementName) {
  var screen = document.querySelector("#" + elementName)
  var closeButton = document.querySelector("#" + elementName + "close")
  closeButton.addEventListener("click", function() {
    closeWindow(screen)
  })
}

function initializeWindow(elementName) {
  var screen = document.querySelector("#" + elementName)
  addWindowTapHandling(screen)
  makeClosable(elementName)
  dragElement(screen)
}

var welcomeScreenOpen = document.querySelector("#welcomeopen")

welcomeScreenOpen.addEventListener("click", function() {
  openWindow(welcomeScreen);
});

var notesWindow = document.querySelector("#notes")

initializeWindow("welcome")
initializeWindow("notes")
initializeWindow("gallery")

var notesStorageKey = "spepeos-notes"
var notesList = document.querySelector("#notesList")
var addNoteButton = document.querySelector("#addNote")
var noteTitle = document.querySelector("#noteTitle")
var noteDate = document.querySelector("#noteDate")
var noteContent = document.querySelector("#noteContent")
var notesError = document.querySelector("#notesError")
var defaultNote = {
  id: "welcome",
  title: "Welcome",
  date: "10/08/2026",
  content: noteContent.innerHTML
}

function showNotesError(message) {
  notesError.textContent = message
  notesError.hidden = !message
}

function sanitizeNoteContent(html) {
  var template = document.createElement("template")
  template.innerHTML = html

  function copySafeNodes(nodes) {
    var fragment = document.createDocumentFragment()
    nodes.forEach(function(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(document.createTextNode(node.textContent))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var allowedTags = ["P", "BR", "STRONG", "B", "EM", "I", "DEL", "INS", "BLOCKQUOTE"]
        var children = copySafeNodes(Array.from(node.childNodes))
        if (allowedTags.includes(node.tagName)) {
          var safeElement = document.createElement(node.tagName.toLowerCase())
          safeElement.appendChild(children)
          fragment.appendChild(safeElement)
        } else {
          fragment.appendChild(children)
        }
      }
    })
    return fragment
  }

  var safeContent = document.createElement("div")
  safeContent.appendChild(copySafeNodes(Array.from(template.content.childNodes)))
  return safeContent.innerHTML
}

function createNoteId() {
  return "note-" + Date.now() + "-" + Math.random().toString(36).slice(2)
}

var savedNotes
try {
  var savedNotesValue = localStorage.getItem(notesStorageKey)
  savedNotes = savedNotesValue ? JSON.parse(savedNotesValue) : null
} catch (error) {
  showNotesError("Saved notes could not be loaded from this browser.")
  savedNotes = null
}

var notes = savedNotes && Array.isArray(savedNotes.notes) &&
  savedNotes.notes.length > 0 &&
  savedNotes.notes.every(function(note) {
    return note && typeof note.id === "string" && typeof note.title === "string" &&
      typeof note.date === "string" && typeof note.content === "string"
  })
  ? savedNotes.notes
  : [defaultNote]
if (savedNotesValue && notes[0] === defaultNote) {
  showNotesError("Saved notes data is invalid. Your original note is available; saving will replace the invalid data.")
}
var selectedNoteId = savedNotes && notes.some(function(note) {
  return note.id === savedNotes.selectedNoteId
}) ? savedNotes.selectedNoteId : notes[0].id

function getSelectedNote() {
  return notes.find(function(note) {
    return note.id === selectedNoteId
  })
}

function saveNotes() {
  try {
    localStorage.setItem(notesStorageKey, JSON.stringify({
      notes: notes,
      selectedNoteId: selectedNoteId
    }))
    showNotesError("")
  } catch (error) {
    showNotesError("Notes could not be saved. Check this browser's storage settings.")
  }
}

function renderNotes() {
  notesList.replaceChildren()
  notes.forEach(function(note) {
    var button = document.createElement("button")
    button.type = "button"
    button.className = "note-list-item" + (note.id === selectedNoteId ? " selected" : "")
    button.setAttribute("aria-pressed", note.id === selectedNoteId)

    var title = document.createElement("span")
    title.className = "note-list-title"
    title.textContent = note.title || "Untitled"

    var date = document.createElement("span")
    date.className = "note-list-date"
    date.textContent = note.date

    button.append(title, date)
    button.addEventListener("click", function() {
      updateCurrentNote()
      selectedNoteId = note.id
      displaySelectedNote()
    })
    notesList.appendChild(button)
  })
}

function displaySelectedNote() {
  var note = getSelectedNote()
  if (!note) {
    return
  }
  noteTitle.value = note.title
  noteDate.textContent = note.date
  noteContent.innerHTML = sanitizeNoteContent(note.content)
  renderNotes()
}

function updateCurrentNote() {
  var note = getSelectedNote()
  if (!note) {
    return
  }
  note.title = noteTitle.value.trim() || "Untitled"
  note.content = sanitizeNoteContent(noteContent.innerHTML)
  renderNotes()
  saveNotes()
}

function addNote() {
  updateCurrentNote()
  var today = new Date().toLocaleDateString()
  var note = {
    id: createNoteId(),
    title: "Untitled",
    date: today,
    content: "<p></p>"
  }
  notes.unshift(note)
  selectedNoteId = note.id
  displaySelectedNote()
  noteTitle.focus()
  saveNotes()
}

if (savedNotesValue === null && notes.length === 1 && notes[0] === defaultNote) {
  notes[0].content = sanitizeNoteContent(defaultNote.content)
}
displaySelectedNote()
addNoteButton.addEventListener("click", addNote)
noteTitle.addEventListener("input", updateCurrentNote)
noteContent.addEventListener("input", updateCurrentNote)

var photos = [
  {
    src: "toro.jpg",
    title: "Toro",
    description: "A photo of Toro",
    alt: "toro sitting outside :)"
  }
]

var selectedIcon = undefined

function selectIcon(element) {
  element.classList.add("selected");
  selectedIcon = element
} 
function deselectIcon(element) {
  element.classList.remove("selected");
  selectedIcon = undefined
}

function handleIconTap(element, targetWindow) {
  if (element.classList.contains("selected")) {
    deselectIcon(element)
    openWindow(targetWindow)
  } else {
    if (selectedIcon) {
      deselectIcon(selectedIcon)
    }
    selectIcon(element)
  }
}

var photos = []

var galleryPhotos = document.querySelector("#galleryPhotos")

photos.forEach(function(photo){
  var card = document.createElement("article")
  card.className = "photo-card"

  var image = document.createElement("img")
  image.src = photo.src
  image.alt = photo.alt

  var title = document.createElement("h3")
  title.textContent = photo.title

  var description = document.createElement("h3")
  description.textContent = photo.description

  card.append(image, title, description)
  galleryPhotos.appendChild(card)

})

var desktopIcons = [
  { element: document.querySelector("#notesIcon"), window: notesWindow },
  { element: document.querySelector("#galleryIcon"), window: document.querySelector("#gallery") }
]

desktopIcons.forEach(function(icon) {
  icon.element.addEventListener("click", function() {
    handleIconTap(icon.element, icon.window)
  })
  dragElement(icon.element)
})
