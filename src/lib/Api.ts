import Cookies from 'js-cookie';
const apiUrl = import.meta.env.VITE_API_URL;

const BASE_URL = apiUrl;
const handleResponse = async (response: Response) => {
  if (response.status === 204 || response.status === 205) {
    return {
      success: true,
      data: null,
      error: null,
    };
  }

  const rawText = await response.text();

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (err) {
    console.error("❌ Failed to parse JSON. Raw response:", rawText);
    throw new Error("Failed to parse JSON response.");
  }

  return {
    success: response.ok,
    data: response.ok ? data : null,
    error: !response.ok ? data?.error || { message: 'Something went wrong' } : null,
  };
};


const refreshAccessToken = async () => {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}auth/refresh-token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const json = await res.json();
    if (res.ok && json?.data?.access) {
      Cookies.set("token", json.data.access, { expires: 1 });
      return json.data.access;
    }

    return null;
  } catch (err) {
    console.error("Refresh token failed:", err);
    return null;
  }
};

const request = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  body?: any,
  includeToken: boolean = true,
  isFileUpload: boolean = false
) => {
  const token = Cookies.get("token");
  const headers: any = includeToken && token
    ? { Authorization: `Bearer ${token}` }
    : {};

  if (!isFileUpload) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...(body && { body: isFileUpload ? body : JSON.stringify(body) }),
  };

  let response = await fetch(`${BASE_URL}${url}`, fetchOptions);
  if (response.status === 401 && includeToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      Cookies.set("token", newToken, { expires: 1 });
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(`${BASE_URL}${url}`, fetchOptions);
    }
  }

  return handleResponse(response);
};

const api = {
  get: (url: string) => request("GET", url),
  post: (url: string, body: any) => request("POST", url, body),
  put: (url: string, body: any) => request("PUT", url, body),
  delete: (url: string) => request("DELETE", url),
  postFile: (url: string, formData: FormData) => request("POST", url, formData, true, true),
};

export default api;
