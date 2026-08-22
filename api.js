const BASE_URL = "http://localhost:8000";

export async function api(
  path,
  {
    method = "GET",
    body,
    token,
  } = {}
) {
  const response = await fetch(
    BASE_URL + path,
    {
      method,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      body: body
        ? JSON.stringify(body)
        : undefined,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Request failed"
    );
  }

  return data;
}