const API = "http://127.0.0.1:8000";

/* =========================================
   TOKEN STORAGE
========================================= */

function storeAuth(data: any) {
  localStorage.setItem(
    "access_token",
    data.access_token
  );

  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );
}

export function getToken() {
  return localStorage.getItem(
    "access_token"
  );
}

export function getStoredUser() {
  const user =
    localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}

export function getUserRole() {
  const user = getStoredUser();
  return user?.role || "customer";
}

/* =========================================
   SIGNUP — CUSTOMER (Backend)
========================================= */

export async function signUp(
  email: string,
  password: string,
  username: string,
  phone: string,
  role: string
) {
  const res = await fetch(
    `${API}/auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        username,
        phone_number: phone,
        role,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return {
      data: null,
      error: {
        message:
          data.detail ||
          "Signup failed",
      },
    };
  }

  storeAuth(data);

  return { data, error: null };
}

/* =========================================
   SIGNUP — STAFF (Backend)
========================================= */

export async function signUpStaff(
  email: string,
  password: string,
  username: string,
  phone: string,
  staffCode: string
) {
  const res = await fetch(
    `${API}/auth/signup/staff`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        username,
        phone_number: phone,
        staff_access_code:
          staffCode,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return {
      data: null,
      error: {
        message:
          data.detail ||
          "Staff signup failed",
      },
    };
  }

  storeAuth(data);

  return { data, error: null };
}

/* =========================================
   SIGNIN (Backend)
========================================= */

export async function signIn(
  email: string,
  password: string
) {
  const res = await fetch(
    `${API}/auth/signin`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return {
      data: null,
      error: {
        message:
          data.detail ||
          "Signin failed",
      },
    };
  }

  storeAuth(data);

  return { data, error: null };
}

/* =========================================
   LOGOUT (Backend)
========================================= */

export async function signOut() {
  try {
    await fetch(
      `${API}/auth/logout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
  } catch {
    // backend logout optional
  }

  localStorage.removeItem(
    "access_token"
  );
  localStorage.removeItem("user");
}

/* =========================================
   GET CURRENT USER (Backend Verified)
========================================= */

export async function getCurrentUser() {
  const token = getToken();

  if (!token) return null;

  const res = await fetch(
    `${API}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return null;

  return await res.json();
}

/* =========================================
   GOOGLE SIGNIN (Backend OAuth)
========================================= */

export async function signInWithGoogle() {
  const res = await fetch(
    `${API}/auth/signin/google`,
    {
      method: "POST",
    }
  );

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    console.error(
      "Google OAuth URL missing"
    );
  }
}
