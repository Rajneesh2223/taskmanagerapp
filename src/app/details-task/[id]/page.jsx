"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletedTask, setDeletedTask] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const {data:session } = useSession()
  const authToken = session?.user?.token;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(
          `https://todos-api-aeaf.onrender.com/api/v1/todo/getById?id=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
    
        if (!response.ok) {
          throw new Error(`Failed to fetch task data: ${response.statusText}`);
        }
    
        const data = await response.json();
        setTask(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "An error occurred");
        setLoading(false);
      }
    };

    if (id && authToken) fetchTask();
  }, [id, authToken]);

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://todos-api-aeaf.onrender.com/api/v1/todo/delete?id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

     
      setDeletedTask({
        ...task,
        originalId: id 
      });

   
      const timer = setTimeout(() => {
        setDeletedTask(null);
        router.push("/list-task");
      }, 10000); 

      setUndoTimer(timer);
      setDeleteLoading(false);
    } catch (err) {
      setError(err.message);
      setDeleteLoading(false);
    }
  };

  const handleUndoDelete = async () => {
    if (deletedTask && undoTimer) {
      clearTimeout(undoTimer);
      
      try {
        const response = await fetch(
          `https://todos-api-aeaf.onrender.com/api/v1/todo/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: deletedTask.name,
              description: deletedTask.description,
              status: deletedTask.status || 'pending',
              
              priority: deletedTask.priority,
              dueDate: deletedTask.dueDate,
              tags: deletedTask.tags,
              
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to restore task: ${response.statusText}`);
        }

       
        setDeletedTask(null);
        setUndoTimer(null);
        router.push("/list-task");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className=" bg-gradient-to-br from-gray-900 to-black p-6">
      {deletedTask && (
        <div className="bg-yellow-600 bg-opacity-20 p-4 mb-4 rounded-md flex justify-between items-center">
          <p className="text-yellow-300">Task deleted. Do you want to undo?</p>
          <button 
            onClick={handleUndoDelete}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Undo
          </button>
        </div>
      )}

      <div className="lg:container h-screen lg:mx-auto  shadow-lg rounded-md p-6">
        {loading ? (
          <p className="text-blue-400">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          task && (
            <div className="bg-[#1E1E1E] p-6 rounded-md shadow-md">
              <h2 className="text-3xl font-bold text-green-400/60 mb-2">
                Task : {task.name.charAt(0).toUpperCase() + task.name.slice(1) || "No Title Available"}
              </h2>
              <p className="text-blue-400/70 mb-4">
               Description : {task.description || "No Description Available"}
              </p>

              {error && (
                <div className="bg-red-500 text-white p-2 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  className="bg-red-500/40 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                  onClick={handleDeleteTask}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Task"}
                </button>
                <button
                  className="bg-green-500/40 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                  onClick={() => router.push(`/edit-task/${id}`)}
                >
                  Edit Task
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Page;