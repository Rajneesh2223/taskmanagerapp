"use client";

import React, { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const EditTaskPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not_completed");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {data:session} = useSession()
  
  const authToken = session?.user?.token;
  
  const router = useRouter();
  const { id } = useParams();
  console.log(id)

  useEffect(() => {
    if (id && authToken) {
      fetchTaskData(id);
    }
  }, [id, authToken]);

  const fetchTaskData = async (taskId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://todos-api-aeaf.onrender.com/api/v1/todo/getById?id=${taskId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setTitle(data.name || "");
        setDescription(data.description || "");
        setStatus(data.status ? "completed" : "not_completed");
      } else {
        throw new Error(data.message || "Failed to fetch task data");
      }
    } catch (err) {
      setError(err.message);
      router.push("/list-task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setIsLoading(true);

  
    if (title.length > 50) {
      setError("Title must be less than 50 characters.");
      setIsLoading(false);
      return;
    }
    if (description.length > 120) {
      setError("Description must be less than 120 characters.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://todos-api-aeaf.onrender.com/api/v1/todo/update?id=${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: title,
            description,
            status: status === "completed",
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update task");
      }

      setSuccessMessage("Task updated successfully!");
      setTimeout(() => router.push("/list-task"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="lg:container lg:mx-auto bg-[#44403C] shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-200 mb-4">Edit Task</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 text-white p-2 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              required
              className="w-full p-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#0A0A0A] text-gray-200"
              placeholder="Enter task title"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={120}
              className="w-full p-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#0A0A0A] text-gray-200"
              placeholder="Enter task description"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#0A0A0A] text-gray-200"
              disabled={isLoading}
            >
              <option value="not_completed">Not Completed</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ade7ba] via-[#44403C] to-[#d1f9b1] text-green-400 py-2 rounded-md hover:bg-green-900 transition"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Click To Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskPage;