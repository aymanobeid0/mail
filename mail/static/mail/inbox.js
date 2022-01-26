document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document
    .querySelector("#compose-form")
    .addEventListener("submit", submit_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mail(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#email-view").style.display = "block";

      console.log(email.read);

      const view = document.querySelector("#email-view");
      view.innerHTML = `
      <div class="row flex-column justify-content-start border">
        <div class=""><b>From:</b> <span>${email["sender"]}</span></div>
        <div class=""><b>To: </b><span>${email["recipients"]}</span></div>
        <div class=""><b>Subject:</b> <span>${email["subject"]}</span</div>
        <div class=""><b>Time:</b> <span>${email["timestamp"]}</span></div>
        <div class="m-2">${email["body"]}</div>
        <button class="btn-primary m-2 reply ">Reply</button>
        <button class="btn-secondary m-2  archive ">archive</button>
      </div>
      
    `;
      const reply = document.querySelector(".reply");
      reply.addEventListener("click", function () {
        compose_email();
        document.querySelector("#compose-recipients").value = email.recipients;
        document.querySelector("#compose-subject").value = email.subject;
        document.querySelector("#compose-body").value = email.body;
      });
      const archive = document.querySelector(".archive");
      archive.addEventListener("click", function () {
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: true,
          }),
        }).then((response) => load_mailbox("archive"));
      });
    });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((element) => {
        console.log(element.body);
        div = document.createElement("div");
        if (element.read == true) {
          div.innerHTML = ` <div class="row justify-content-between bg-secondary text-white border border-secondary mb-2 p-3">
        <div> ${element.sender}</div>
        <div> ${element.subject}</div>
        <div> ${element.timestamp}</div>
    </div>`;
        } else {
          div.innerHTML = ` <div class="row justify-content-between border border-secondary mb-2 p-3">
        <div> ${element.sender}</div>
        <div> ${element.subject}</div>
        <div> ${element.timestamp}</div>
    </div>`;
        }

        div.addEventListener("click", () => load_mail(element.id));

        document.querySelector("#emails-view").append(div);
      });
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
    });
}

function submit_email(event) {
  event.preventDefault();

  // Post email to API route
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  }).then((response) => load_mailbox("sent"));
}
