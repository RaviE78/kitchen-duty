let duties = [];
let index = 0;

const $ = (id) => document.getElementById(id);

const client = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

async function loadDuties() {
  const { data, error } = await client
    .from("duties")
    .select("id,duty,duty_date,room_number")
    .order("duty_date", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    if ($("status")) $("status").textContent = "Database connection error.";
    return;
  }

  duties = data || [];
  index = Math.min(index, Math.max(0, duties.length - 1));

  render();
  renderAdminList();
}

function render() {
  if (!duties.length) {
    if ($("date")) $("date").textContent = "No duties";
    if ($("room")) $("room").textContent = "-";
    if ($("dots")) $("dots").innerHTML = "";
    if ($("status")) $("status").textContent = "No duties available.";
    return;
  }

  const d = duties[index];

  const dutyDay = new Date(d.duty_date);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dutyKey = dutyDay.toDateString();
  const todayKey = today.toDateString();
  const tomorrowKey = tomorrow.toDateString();

  if ($("date")) {
    if (dutyKey === todayKey) {
      $("date").textContent = "Today";
    } else if (dutyKey === tomorrowKey) {
      $("date").textContent = "Tomorrow";
    } else {
      $("date").textContent = dutyDay.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
    }
  }

  if ($("room")) {
    $("room").textContent = d.room_number ?? "-";
  }

  if ($("status")) {
    $("status").textContent = d.duty || "Kitchen Duty";
  }

  if ($("card")) {
    const hue = (index * 67) % 360;
    $("card").style.background =
      `linear-gradient(135deg, hsl(${hue} 78% 58%), hsl(${(hue + 55) % 360} 78% 42%))`;
  }

  if ($("dots")) {
    $("dots").innerHTML = duties
      .map((_, i) => `<span class="${i === index ? "active" : ""}"></span>`)
      .join("");
  }
}

function move(direction) {
  if (duties.length < 2) return;

  index = (index + direction + duties.length) % duties.length;
  render();
}

if ($("prev")) {
  $("prev").onclick = () => move(-1);
}

if ($("next")) {
  $("next").onclick = () => move(1);
}

if ($("adminBtn")) {
  $("adminBtn").onclick = () => {
    $("adminPanel")?.classList.toggle("hidden");
  };
}

if ($("closeAdmin")) {
  $("closeAdmin").onclick = () => {
    $("adminPanel")?.classList.add("hidden");
  };
}

if ($("loginBtn")) {
  $("loginBtn").onclick = async () => {
    const email = $("email")?.value;
    const password = $("password")?.value;

    const { error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    }
  };
}

if ($("logoutBtn")) {
  $("logoutBtn").onclick = async () => {
    await client.auth.signOut();

    $("manageBox")?.classList.add("hidden");
    $("loginBox")?.classList.remove("hidden");
  };
}

if ($("dutyForm")) {
  $("dutyForm").onsubmit = async (e) => {
    e.preventDefault();

    const duty = $("duty")?.value || "Kitchen Cleaning";
    const duty_date = $("dutyDate")?.value;
    const room_number = $("roomNumber")?.value;

    const { error } = await client.from("duties").insert({
      duty,
      duty_date,
      room_number
    });

    if (error) {
      alert(error.message);
      return;
    }

    $("dutyForm").reset();
    await loadDuties();
  };
}

async function del(id) {
  if (!confirm("Delete this duty?")) return;

  const { error } = await client
    .from("duties")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadDuties();
}

async function editDuty(id, date, room) {
  const newDate = prompt("Date (YYYY-MM-DD)", date);
  if (newDate === null) return;

  const newRoom = prompt("Room number", room);
  if (newRoom === null) return;

  const { error } = await client
    .from("duties")
    .update({
      duty_date: newDate,
      room_number: newRoom
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadDuties();
}

function renderAdminList() {
  if (!$("dutyList")) return;

  $("dutyList").innerHTML = duties
    .map(
      (d) => `
        <div class="duty-row">
          <span>${d.duty_date} — Room ${d.room_number}</span>
          <button onclick="editDuty(${d.id}, '${d.duty_date}', '${d.room_number}')">
            Edit
          </button>
          <button onclick="del(${d.id})">
            Delete
          </button>
        </div>
      `
    )
    .join("");
}

client.auth.onAuthStateChange((_event, session) => {
  if (session) {
    $("loginBox")?.classList.add("hidden");
    $("manageBox")?.classList.remove("hidden");
  } else {
    $("loginBox")?.classList.remove("hidden");
    $("manageBox")?.classList.add("hidden");
  }
});

loadDuties();
