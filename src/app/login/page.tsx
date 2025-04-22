"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/notes"); // Redirect to /notes side after login
    }
    setIsLoading(false);
  };

  return (
  <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
    <h1 className="text-3xl font-bold text-blue-600 mb-8">
      Log ind på SecureNote
    </h1>
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {isLoading && <p className="text-gray-500 text-sm mb-4">Logger ind...</p>}

         <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50">
           {isLoading ? "Logger ind..." : "Log ind"}
         </button>   <p className="text-sm mt-4 text-center">
    Har du ikke en konto?{" "}
    <Link href="/signup" className="text-blue-600 hover:underline">
      Opret en her
    </Link>
  </p>
    </form>
  </div>
  );
}
