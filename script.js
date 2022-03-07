// GET https://destinations-api-ns.herokuapp.com/destinations
// GET https://destinations-api-ns.herokuapp.com/cities

const BASE_URL = "https://destinations-api-ns.herokuapp.com";
const DESTINATIONS_RECORD_TYPE = "destinations";
const CITIES_RECORD_TYPE = "cities";

async function loadRecords({ recordType, containerId }) {
  const url = `${BASE_URL}/${recordType}`;

  const res = await fetch(url);
  const data = await res.json();

  if (recordType === DESTINATIONS_RECORD_TYPE) {
    // data is an obj {destinationId: {id, location, destination, photo, description}}
    processDestinations(data, containerId);
  } else if (recordType === CITIES_RECORD_TYPE) {
    // array
    console.log(data);
  }
}

function processDestinations(destinations, containerId) {
  for (let destID in destinations) {
    const dest = destinations[destID];
    const card = createDestCard(dest);
    document.getElementById(containerId).appendChild(card);
  }
}

function createDestCard({ location, destination, description, photo, id }) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.style.width = "18rem";

  const cardPhoto = document.createElement("img");
  cardPhoto.setAttribute("src", photo);
  cardPhoto.classList.add("card-img-top");
  card.appendChild(cardPhoto);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  card.appendChild(cardBody);

  const cardTitle = document.createElement("h5");
  cardTitle.classList.add("card-title");
  cardTitle.innerText = `${destination} in ${location}`;
  cardBody.appendChild(cardTitle);

  const editButton = document.createElement("button");
  editButton.classList.add("btn", "btn-warning");
  editButton.innerText = "Edit";
  editButton.setAttribute("dest_id", id);
  editButton.addEventListener("click", handleDestEdit);
  cardBody.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger");
  deleteButton.innerText = "Delete";
  deleteButton.setAttribute("dest_id", id);
  deleteButton.addEventListener("click", handleDestDelete);
  cardBody.appendChild(deleteButton);

  if (description !== undefined) {
    addDescription({ text: description, container: cardBody });
  }

  return card;
}

function addDescription({ text, container }) {
  const cardText = document.createElement("p");
  cardText.classList.add("card-text");
  cardText.innerText = text;
  container.appendChild(cardText);
}

function handleDestEdit(evt) {
  const clickedBtn = evt.target;
  const destId = clickedBtn.getAttribute("dest_id");
  const url = `${BASE_URL}/${DESTINATIONS_RECORD_TYPE}/${destId}`;

  const newDestination = prompt("Enter new destination");
  const newLocation = prompt("Enter new location");
  const newDesc = prompt("Enter new description");

  const newObj = {};

  if (newDestination !== null && newDestination.length !== "") {
    newObj.destination = newDestination;
  }

  if (newLocation !== null && newLocation.length !== "") {
    newObj.location = newLocation;
  }

  if (newDesc !== null && newDesc.length !== "") {
    newObj.description = newDesc;
  }

  fetch(url, {
    method: "PUT",
    body: JSON.stringify(newObj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(({ location, destination, photo, description }) => {
      const cardTitle = clickedBtn.previousSibling;
      cardTitle.innerText = `${destination} in ${location}`;

      const cardImage = clickedBtn.parentElement.parentElement.children[0];
      cardImage.setAttribute("src", photo);

      if (description) {
        if (clickedBtn.nextSibling.nextSibling.nextSibling.tagName === "P") {
          clickedBtn.nextSibling.nextSibling.nextSibling.innerText =
            description;
        } else {
          addDescription({
            text: description,
            container: clickedBtn.parentElement,
          });
        }
      }
    });
}

function handleDestDelete(evt) {
  const destId = evt.target.getAttribute("dest_id");
  const url = `${BASE_URL}/${DESTINATIONS_RECORD_TYPE}/${destId}`;

  fetch(url, {
    method: "DELETE",
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("destinations_container").innerHTML = "";
      processDestinations(data, "destinations_container");
    })
    .catch((error) => {
      console.log(error);
    });
}

loadRecords({
  recordType: DESTINATIONS_RECORD_TYPE,
  containerId: "destinations_container",
});
