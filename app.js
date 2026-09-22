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
      (d) => 
        <div class="duty-row">
          <span>${d.duty_date} — Room ${d.room_number}</span>
          <button onclick="editDuty(${d.id}, '${d.duty_date}', '${d.room_number}')">
            Edit
          </button>
          <button onclick="del(${d.id})">
            Delete
          </button>
        </div>
      
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
