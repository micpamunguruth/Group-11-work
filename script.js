const venues = [
  { id: "v1", name: "Main Auditorium", type: "Hall", cap: 500, loc: "Block A", ok: true },
  { id: "v2", name: "Lecture Theatre 1", type: "Hall", cap: 150, loc: "Block B", ok: true },
  { id: "v3", name: "Seminar Room 2B", type: "Room", cap: 40, loc: "Block B, Level 2", ok: true },
  { id: "v4", name: "Student Union Hall", type: "Hall", cap: 250, loc: "Student Centre", ok: true },
  { id: "v5", name: "Central Courtyard", type: "Outdoor", cap: 300, loc: "Campus centre", ok: true },
  { id: "v6", name: "Sports Field Pavilion", type: "Outdoor", cap: 400, loc: "Sports Complex", ok: false },
  { id: "v7", name: "Boardroom", type: "Room", cap: 20, loc: "Admin Block", ok: true },
  { id: "v8", name: "Library Conference Room", type: "Room", cap: 60, loc: "Library, Level 3", ok: true }
];

const resources = [
  { id: "projector", name: "Projector", type: "Equipment", stock: 6 },
  { id: "sound", name: "Sound system", type: "Audio", stock: 3 },
  { id: "tent", name: "Event tent", type: "Shelter", stock: 4 },
  { id: "chairs", name: "Plastic chairs", type: "Furniture", stock: 400 },
  { id: "tables", name: "Folding tables", type: "Furniture", stock: 40 },
  { id: "mic", name: "Wireless microphone", type: "Audio", stock: 8 },
  { id: "podium", name: "Podium", type: "Furniture", stock: 3 },
  { id: "banner", name: "Banner stand", type: "Display", stock: 10 }
];


const bookings = [
  { ref: "EVT-1001", event: "Freshers’ Welcome", venue: "v1", date: "2026-11-16", start: "09:00", end: "12:00", att: 420 },
  { ref: "EVT-1002", event: "Robotics Club Demo", venue: "v5", date: "2026-11-16", start: "10:00", end: "13:00", att: 120 },
  { ref: "EVT-1003", event: "Dept. Staff Meeting", venue: "v7", date: "2026-11-17", start: "14:00", end: "15:30", att: 15 },
  { ref: "EVT-1004", event: "Career Fair", venue: "v4", date: "2026-11-18", start: "09:00", end: "16:00", att: 230 },
  { ref: "EVT-1005", event: "Debate Society Finals", venue: "v2", date: "2026-11-18", start: "13:00", end: "17:00", att: 140 },
  { ref: "EVT-1006", event: "Thesis Workshop", venue: "v8", date: "2026-11-19", start: "10:00", end: "12:00", att: 45 },
  { ref: "EVT-1007", event: "Cultural Night", venue: "v1", date: "2026-11-20", start: "17:00", end: "21:00", att: 450 },
  { ref: "EVT-1008", event: "Peer Tutoring Briefing", venue: "v1", date: "2026-11-16", start: "11:00", end: "12:00", att: 30 }
];
let nextRef = 1009;

function $(id) { return document.getElementById(id); }

function venueName(id) {
  return venues.find(function (v) { return v.id === id; }).name;
}

function safe(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function clashes(a, b) {
  return a.venue === b.venue && a.date === b.date && a.start < b.end && b.start < a.end;
}

function filterVenues() {
  const text = $("vSearch").value.trim().toLowerCase();
  const type = $("vType").value;
  const minCap = Number($("vCap").value) || 0;
  const avail = $("vAvail").value;

  return venues.filter(function (v) {
    const matchText = (v.name + " " + v.loc).toLowerCase().includes(text);
    const matchType = type === "" || v.type === type;
    const matchCap = v.cap >= minCap;
    const matchAvail = avail === "" || (avail === "yes") === v.ok;
    return matchText && matchType && matchCap && matchAvail;
  });
}

function showVenues() {
  const list = filterVenues();
  $("venueCount").textContent = list.length + " of " + venues.length + " venues shown";

  if (list.length === 0) {
    $("venueCards").innerHTML = '<p class="empty">No venues match your filters.</p>';
    return;
  }
  let html = "";
  list.forEach(function (v) {
    html += '<article class="card"><h3>' + v.name + "</h3>" +
      "<p>" + v.type + " · " + v.loc + "</p>" +
      "<p>Capacity: <strong>" + v.cap + "</strong></p>" +
      '<span class="badge ' + (v.ok ? "ok" : "bad") + '">' + (v.ok ? "Available" : "Unavailable") + "</span></article>";
  });
  $("venueCards").innerHTML = html;
}

function showResources() {
  const type = $("rType").value;
  const level = $("rStatus").value;
  let html = "";

  resources.forEach(function (r) {
    const status = r.stock >= 5 ? "In stock" : "Low stock";
    if ((type === "" || r.type === type) && (level === "" || status === level)) {
      html += "<tr><th scope='row'>" + r.name + "</th><td>" + r.type + "</td><td>" + r.stock + "</td>" +
        '<td><span class="badge ' + (status === "In stock" ? "ok" : "warn") + '">' + status + "</span></td></tr>";
    }
  });
  $("resBody").innerHTML = html || '<tr><td colspan="4" class="empty">No resources match your filters.</td></tr>';
}

function getExtras() {
  const boxes = document.querySelectorAll("input[name=extra]:checked");
  return Array.from(boxes).map(function (box) { return box.value; });
}

function calculateNeeds(attendees, venue, extras) {
  const needs = {
    chairs: attendees,
    tables: Math.ceil(attendees / 10),
    mic: Math.ceil(attendees / 100)
  };
  if (extras.includes("projector")) needs.projector = 1;
  if (extras.includes("sound")) needs.sound = 1;
  if (extras.includes("podium")) needs.podium = 1;
  if (extras.includes("tent") || venue.type === "Outdoor") needs.tent = Math.ceil(attendees / 50);
  return needs;
}

function showEstimate() {
  const attendees = Number($("evAtt").value);
  const venue = venues.find(function (v) { return v.id === $("evVenue").value; });

  if (attendees < 1 || !venue) {
    $("estIntro").textContent = "Enter attendees and choose a venue to see what you will need.";
    $("estWrap").hidden = true;
    return;
  }
  const needs = calculateNeeds(attendees, venue, getExtras());
  let html = "";
  resources.forEach(function (r) {
    if (needs[r.id]) {
      const short = needs[r.id] > r.stock ? ' <span class="badge bad">Short</span>' : "";
      html += "<tr><th scope='row'>" + r.name + "</th><td>" + needs[r.id] + "</td><td>" + r.stock + short + "</td></tr>";
    }
  });
  $("estIntro").textContent = "For " + attendees + " attendees at " + venue.name + ":";
  $("estBody").innerHTML = html;
  $("estWrap").hidden = false;
}

function showSchedule() {
  const sorted = bookings.slice().sort(function (a, b) {
    return (a.date + a.start).localeCompare(b.date + b.start);
  });

  let rows = "";
  sorted.forEach(function (b) {
    rows += "<tr><td>" + b.ref + "</td><th scope='row'>" + safe(b.event) + "</th><td>" + venueName(b.venue) +
      "</td><td>" + b.date + "</td><td>" + b.start + "–" + b.end + "</td><td>" + b.att + "</td></tr>";
  });
  $("schBody").innerHTML = rows;

  const problems = [];
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      if (clashes(bookings[i], bookings[j])) {
        problems.push("“" + bookings[i].event + "” and “" + bookings[j].event + "” both use " + venueName(bookings[i].venue) + " on " + bookings[i].date + ".");
      }
    }
  }

  let people = 0;
  bookings.forEach(function (b) { people += b.att; });
  $("stats").innerHTML =
    '<div class="stat"><strong>' + bookings.length + "</strong>Events planned</div>" +
    '<div class="stat"><strong>' + people + "</strong>Total attendees</div>" +
    '<div class="stat"><strong>' + problems.length + "</strong>Conflicts found</div>";

  if (problems.length === 0) {
    $("clashBox").innerHTML = '<p class="msg ok">No conflicts in the current schedule.</p>';
  } else {
    $("clashBox").innerHTML = '<div class="msg warn" role="alert"><strong>Conflicts in the schedule:</strong><ul><li>' +
      problems.join("</li><li>") + "</li></ul></div>";
  }
}

function setError(id, message) {
  $("e-" + id).textContent = message;
  $(id).setAttribute("aria-invalid", message ? "true" : "false");
  return message === "";
}

function checkForm() {
  const attendees = Number($("evAtt").value);
  const venue = venues.find(function (v) { return v.id === $("evVenue").value; });
  const today = new Date().toISOString().slice(0, 10);
  const start = $("evStart").value;
  const end = $("evEnd").value;
  const date = $("evDate").value;

  let venueError = "";
  if (!venue) venueError = "Choose a venue.";
  else if (!venue.ok) venueError = "This venue is unavailable.";
  else if (attendees > venue.cap) venueError = "Capacity is " + venue.cap + ". Pick a bigger venue or fewer attendees.";

  let endError = "";
  if (end === "") endError = "Choose an end time.";
  else if (start !== "" && end <= start) endError = "End time must be after the start time.";

  const results = [
    setError("evName", $("evName").value.trim().length >= 3 ? "" : "Enter at least 3 characters."),
    setError("evEmail", $("evEmail").validity.valid && $("evEmail").value !== "" ? "" : "Enter a valid email address."),
    setError("evAtt", attendees >= 1 && attendees <= 1000 ? "" : "Enter a number from 1 to 1000."),
    setError("evVenue", venueError),
    setError("evDate", date === "" ? "Choose a date." : date < today ? "The date cannot be in the past." : ""),
    setError("evStart", start === "" ? "Choose a start time." : ""),
    setError("evEnd", endError)
  ];
  return !results.includes(false);
}

function submitPlan(event) {
  event.preventDefault();
  const message = $("planMsg");

  if (!checkForm()) {
    message.innerHTML = '<p class="msg bad">Please fix the highlighted fields.</p>';
    return;
  }

  const attendees = Number($("evAtt").value);
  const venue = venues.find(function (v) { return v.id === $("evVenue").value; });
  const plan = {
    ref: "EVT-" + nextRef,
    event: $("evName").value.trim(),
    venue: venue.id,
    date: $("evDate").value,
    start: $("evStart").value,
    end: $("evEnd").value,
    att: attendees
  };

  const taken = bookings.find(function (b) { return clashes(b, plan); });
  if (taken) {
    message.innerHTML = '<p class="msg bad" role="alert">Not saved. ' + venue.name + ' is already booked for “' +
      taken.event + "” from " + taken.start + " to " + taken.end + ".</p>";
    return;
  }

  const needs = calculateNeeds(attendees, venue, getExtras());
  const shortages = resources.filter(function (r) { return needs[r.id] > r.stock; });
  if (shortages.length > 0) {
    message.innerHTML = '<p class="msg bad" role="alert">Not saved. Not enough: ' +
      shortages.map(function (r) { return r.name; }).join(", ") + ".</p>";
    return;
  }

  bookings.push(plan);
  nextRef++;
  message.innerHTML = '<p class="msg ok"><strong>Plan submitted.</strong> Reference ' + plan.ref + ": “" + safe(plan.event) +
    "” at " + venue.name + " on " + plan.date + ".</p>";
  showSchedule();
}

function clearForm() {
  $("planForm").reset();
  $("planMsg").innerHTML = "";
  ["evName", "evEmail", "evAtt", "evVenue", "evDate", "evStart", "evEnd"].forEach(function (id) { setError(id, ""); });
  showEstimate();
}

function startPage() {
 
  let options = '<option value="">Select a venue</option>';
  venues.forEach(function (v) { options += '<option value="' + v.id + '">' + v.name + " (" + v.cap + ")</option>"; });
  $("evVenue").innerHTML = options;

  const types = [];
  resources.forEach(function (r) { if (!types.includes(r.type)) types.push(r.type); });
  types.forEach(function (t) { $("rType").innerHTML += "<option>" + t + "</option>"; });

  $("evDate").min = new Date().toISOString().slice(0, 10);

  $("venueFilters").addEventListener("input", showVenues);
  $("rType").addEventListener("change", showResources);
  $("rStatus").addEventListener("change", showResources);
  $("planForm").addEventListener("input", showEstimate);
  $("planForm").addEventListener("submit", submitPlan);
  $("resetBtn").addEventListener("click", clearForm);

  showVenues();
  showResources();
  showSchedule();
}

startPage();
