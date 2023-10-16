const getById = (id) => {
  return document.getElementById(id);
};

const error = getById("error");
const success = getById("success");
const password = getById("password");
const confirmpassword = getById("confirm-password");
const form = getById("form");
const container = getById("container");
const button = getById("submit");
const loader = getById("loader");

error.style.display = "none";
success.style.display = "none";
container.style.display = "none";

window.addEventListener("DOMContentLoaded", async () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  const { userId, token } = params;
  const res = await fetch("/auth/verify-reset-token", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ userId, token }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    loader.innerText = error;
    return;
  }
  container.style.display = "block";
  loader.style.display = "none";
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!password.value.trim()) {
    error.style.display = "block";
    error.innerText = "Password cannot be empty";
    return;
  }
  if (!confirmpassword.value.trim()) {
    error.style.display = "block";
    error.innerText = "Please reenter your password";
    return;
  }
  if (password.value !== confirmpassword.value) {
    error.style.display = "block";
    error.innerText = "Passwords dont match";
    return;
  }

  error.style.display = "none";

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => {
      return searchParams.get(prop);
    },
  });
  const { userId, token } = params;
  loader.innerText = "Updating password";
  loader.style.display = "block";
  const res = await fetch("/auth/update-password", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ userId, token, password: password.value }),
  });
  if (!res.ok) {
    loader.style.display = "none";
    const { error: errorMessage } = await res.json();
    error.style.display = "block";
    error.innerText = errorMessage;
    return;
  }
  container.style.display = "none";
  loader.innerText = "Password Updated Successfully";
});
