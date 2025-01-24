"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";


export default function AddTaskPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(""); 
  const [error, setError] = useState("");
  const router = useRouter();

  const {data:session } = useSession()
   
  const authToken = session?.user?.token ;
 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!status) {
      setError("Please select a task status.");
      return;
    }

    try {
      const response = await fetch(
        "https://todos-api-aeaf.onrender.com/api/v1/todo/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            status: status === "completed", 
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
    <div className="bg-gradient-to-tr from-[#2c2a2a] to-[#3a3738] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 font-Bona_Nova">Add New Task</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-white"
            >
              Task Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task name"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white"
            >
              Task Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">
              Task Status
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  checked={status === "completed"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-white">Completed</span>
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="not_completed"
                  checked={status === "not_completed"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-white">Not Completed</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-400 to-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
