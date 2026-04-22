import api from "./api";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export async function login(username: string, password: string) {

  await api.get("/auth/csrf/");

  const csrftoken = getCookie("csrftoken");

  const response = await api.post(
    "/auth/login/",
    {
      username,
      password,
    },
    {
      headers: {
        "X-CSRFToken": csrftoken,
      },
    }
  );

  return response.data;
}

export async function logout() {
  await api.get("/auth/csrf/");
  await api.post("/auth/logout/", null, {
    headers: {
      "X-CSRFToken": getCookie("csrftoken") || "",
    },
  });
}

export async function changePassword(
  old_password: string,
  new_password: string
) {
  const res = await api.post("/auth/change-password/", {
    old_password,
    new_password,
  });
  return res.data;
}

// export async function changePassword(data: {
//   old_password: string;
//   new_password1: string;
//   new_password2: string;
// }) {
//   const res = await api.post("/auth/change-password/)", data);
//   return res.data;
// }