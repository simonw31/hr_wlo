"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Appel NextAuth via credentials
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false, // On gère la redirection nous-mêmes
    })

    if (result && !result.error) {
      // Redirection en cas de succès
      router.push("/dashboard")
    } else {
      alert("Invalid credentials")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      {/* Carte blanche au centre */}
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-lg">
        {/* Titre */}
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          Login
        </h1>
        {/* Sous-titre */}
        <p className="mb-6 text-center text-sm text-gray-500">
          Access the app by entering your credentials
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-blue-600 py-2 text-sm font-medium 
                       text-white hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>

        {/* Séparateur "or" */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="h-px w-full bg-gray-300"></div>
          <span className="absolute bg-white px-2 text-sm text-gray-500">or</span>
        </div>

        {/* Bouton Sign Up */}
        <button
          type="button"
          className="w-full rounded-md bg-blue-50 py-2 text-sm font-medium 
                     text-blue-600 hover:bg-blue-100 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500"
        >
          Sign Up
        </button>

        {/* Lien Forgot password */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </div>
    </main>
  )
}
