"use strict";

const host_url = '"https://flaskapp.osc-fr1.scalingo.io';
const get_all_url = "https://flaskapp.osc-fr1.scalingo.io/api/v1/items?sort=1";
const post_item_url = "https://flaskapp.osc-fr1.scalingo.io/api/v1/item"; // login required
const auth_url = "https://flaskapp.osc-fr1.scalingo.io/api/v1/login";

// DOM elements
const containerLogin = document.querySelector(".login");
const welcomeMessage = document.querySelector(".welcome");
const containerMovements = document.querySelector(".movements");
const currentDateEl = document.querySelector(".date");
const addItemContainer = document.querySelector(".operation--add");
const btnLogin = document.querySelector(".login__btn");
const loginInputUser = document.querySelector(".login__input--user");
const loginInputPassword = document.querySelector(".login__input--pin");
const inputItemName = document.querySelector(".form__input--user");
const inputItemPrice = document.querySelector(".form__input--pin");
const btnAddItem = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");
const deleteItemContainer = document.querySelector(".operation--delete");
const btnDelete = document.querySelector(".form__btn--delete");
const inputDeleteItem = document.querySelector(".form__input--delete");
const inputSearch = document.querySelector(".form__input--item--search");
const btnSearch = document.querySelector(".form__btn--search");

const inputSearchID = document.querySelector(".form__input--item--search--id");
const btnSearchID = document.querySelector(".form__btn--search--id");

const modalWindow = document.querySelector(".modal");
const modalOverlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".close-modal");
const windowItemName = document.querySelector(".search__item__name");
const windowItemPrice = document.querySelector(".search__item__price");
const windowItemDate = document.querySelector(".search__item__date");
const windowItemID = document.querySelector(".search__item__id");

// search by ID module
const searchItemID = function (id) {
  const request = fetch(
    `https://flaskapp.osc-fr1.scalingo.io/api/v1/item_id?id=${id}`
  );
  request
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          `failed to get item id=${id}, code: ${response.status}`
        );
      }
      return response.json();
    })
    .then(function (resp_json) {
      const data = resp_json.item;
      windowItemName.textContent = `name: ${data.name}`;
      windowItemPrice.textContent = `price: ${data.price}`;
      windowItemDate.textContent = `time added: ${timeConverter(
        data.create_time
      )}`;
      windowItemID.textContent = `item id: ${data.id}`;

      showModalWindow(true);
      btnCloseModal.addEventListener("click", function (e) {
        e.preventDefault();
        showModalWindow(false);
        inputSearchID.value = "";
      });
    })
    .catch((err) => {
      alert(err);
      inputSearchID.value = "";
    });
};

btnSearchID.addEventListener("click", function (e) {
  e.preventDefault();
  searchItemID(inputSearchID.value);
});

// search by name module
const searchItem = function (item_name) {
  const request = fetch(
    `https://flaskapp.osc-fr1.scalingo.io/api/v1/item?name=${item_name}`
  );
  request
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          `failed to get item ${item_name}, code: ${response.status}`
        );
      }
      return response.json();
    })
    .then(function (resp_json) {
      const data = resp_json.item;
      windowItemName.textContent = `name: ${data.name}`;
      windowItemPrice.textContent = `price: ${data.price}`;
      windowItemDate.textContent = `time added: ${timeConverter(
        data.create_time
      )}`;
      windowItemID.textContent = `item id: ${data.id}`;

      showModalWindow(true);
      btnCloseModal.addEventListener("click", function (e) {
        e.preventDefault();
        showModalWindow(false);
      });
      inputSearch.value = "";
    })
    .catch((err) => {
      alert(err);
      inputSearch.value = "";
    });
};

btnSearch.addEventListener("click", function (e) {
  e.preventDefault();
  searchItem(inputSearch.value);
});

// Credentials and login module
let access_token = null;
let isLoggedin = false;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  const user_name = loginInputUser.value;
  const pw = loginInputPassword.value;

  if (!user_name || !pw) {
    alert("missing login credentials");
    return;
  }
  login(user_name, pw);
});

const login = function (user_name, pw) {
  const request = fetch(auth_url, {
    body: JSON.stringify({
      username: user_name,
      password: pw,
    }),
    method: "POST",
  });
  request
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`invalid credentials, code: ${response.status}`);
      }
      return response.json();
    })
    .then(function (resp_json) {
      const data = resp_json;
      access_token = data.access_token;
      addItemContainer.classList.remove("hidden");
      deleteItemContainer.classList.remove("hidden");
      isLoggedin = true;
      containerLogin.classList.add("hidden");
      welcomeMessage.textContent = `Welcome! ${user_name}`;
      console.log("login success");
    })
    .catch((err) => alert(err));
};

// main list module
let mainList = null;

const getAllItems = function (sort = false) {
  const sort_val = !sort ? 1 : 0;
  const request = fetch(
    `https://flaskapp.osc-fr1.scalingo.io/api/v1/items?sort=${sort_val}`
  );
  request
    .then((response) => {
      if (!response.ok) {
        throw new Error(`failed to get items! ${response.status}`);
      }
      return response.json();
    })
    .then(function (resp_json) {
      const data = resp_json;
      mainList = data.items;
      console.log(mainList);
      renderItems(mainList);
    })
    .catch((err) => alert(err));
};

const refreshMainList = function (sort = false) {
  containerMovements.innerHTML = "";
  getAllItems(sort);
};

const renderItems = function (item_list) {
  item_list.forEach(function (item) {
    const html = `
    <div class="movements__row">
        <div class="movements__type movements__type--${item.id}">${
      item.name
    }</div>
        <div class="movements__time">${timeConverter(item.create_time)}</div>
        <div class="movements__value">$${item.price}</div>
    </div>
  `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// add item module (login required)
const addItem = function (item_name, item_price) {
  if (!access_token) {
    alert("login required to add items");
    return;
  }
  const request = fetch(post_item_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      name: item_name,
      price: item_price,
    }),
  });
  request
    .then(function (response) {
      if (!response.ok) {
        console.log(response);
        throw new Error(`failed to add new item! ${response.status}`);
      }
      return response.json();
    })
    .then((resp_json) => {
      const data = resp_json;
      console.log(data.id);
      refreshMainList();
      inputItemName.value = "";
      inputItemPrice.value = "";
    })
    .catch((err) => alert(err));
};

btnAddItem.addEventListener("click", function (e) {
  e.preventDefault();
  const name = inputItemName.value;
  const price = inputItemPrice.value;
  if (!name || !price) return;
  addItem(name, price);
});

// deleting item
const deleteItem = function (item_name) {
  const request = fetch(
    `https://flaskapp.osc-fr1.scalingo.io/api/v1/item?name=${item_name}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  request
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`failed to delete! code: ${response.status}`);
      } else {
        alert(`successfully deleted ${item_name}`);
      }
    })
    .then(function () {
      refreshMainList();
      inputDeleteItem.value = "";
    })
    .catch((err) => alert(err));
};

btnDelete.addEventListener("click", function (e) {
  e.preventDefault();
  deleteItem(inputDeleteItem.value);
});

// sorting
let sort_val = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  refreshMainList(!sort_val);
  sort_val = !sort_val;
});

const getCurrentDate = function () {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();

  today = dd + "/" + mm + "/" + yyyy;
  return String(today);
};

const timeConverter = function (UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
};

const showModalWindow = function (yes) {
  if (yes) {
    modalWindow.classList.remove("hidden");
    modalOverlay.classList.remove("hidden");
  } else {
    modalWindow.classList.add("hidden");
    modalOverlay.classList.add("hidden");
  }
};

const init = function () {
  currentDateEl.textContent = getCurrentDate();
  addItemContainer.classList.add("hidden");
  deleteItemContainer.classList.add("hidden");
  showModalWindow(false);
  getAllItems();
};

init();
