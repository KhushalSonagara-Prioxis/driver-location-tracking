"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/enums";
import { useAuthServices} from "@/api/authServices"

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authServices=useAuthServices();

  const handleLogin = async () => {
    try {
      setError("");
      const data = await authServices.userLogin(email,password);

      console.log("data",data)

      // Store auth info
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // Redirect based on role
      if (data.role === Role.Admin) {
        router.push("/admin/trips");
      } else if (data.role === Role.Driver) {
        router.push("/driver/trips");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 border rounded w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="px-4 py-2 border rounded w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded w-64 hover:bg-blue-700"
      >
        Login
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
