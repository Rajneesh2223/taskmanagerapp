'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useSession, signOut } from "next-auth/react";
import { TaskFilterButtons, TaskItem, ErrorMessage } from "../hooks/userListTask";
import { ClipboardCheck } from 'lucide-react';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [loadingTasks, setLoadingTasks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortOption, setSortOption] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  const { data: session, status } = useSession();
  const authToken = session?.user?.token;
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (!authToken) return;

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://todos-api-aeaf.onrender.com/api/v1/todo/getAll`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching tasks:", error.message);
        setError(error.message);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [authToken, status, router]);

  const toggleTaskCompletion = async (id) => {
    setLoadingTasks(prev => ({ ...prev, [id]: true }));
    
    try {
      const currentTask = tasks.find(t => t._id === id);
      const newStatus = !currentTask.status;

      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, status: newStatus } : task
        )
      );

      const response = await fetch(
        `https://todos-api-aeaf.onrender.com/api/v1/todo/update?id=${id}`, 
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            status: newStatus,
            name: currentTask.name,
            description: currentTask.description
          })
        }
      );

      if (!response.ok) {
        setTasks((prev) =>
          prev.map((task) =>
            task._id === id ? { ...task, status: currentTask.status } : task
          )
        );
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setLoadingTasks(prev => {
        const newLoadingTasks = { ...prev };
        delete newLoadingTasks[id];
        return newLoadingTasks;
      });
    }
  };

  const bulkRemoveCompleted = async () => {
    try {
      const completedTasks = tasks.filter(task => task.status);
      
      for (const task of completedTasks) {
        const response = await fetch(
          `https://todos-api-aeaf.onrender.com/api/v1/todo/delete?id=${task._id}`, 
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete task ${task._id}`);
        }
      }

      setTasks((prev) => prev.filter(task => !task.status));
    } catch (error) {
      console.error('Error removing completed tasks:', error);
      alert('Failed to remove completed tasks. Please try again.');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const getSortedTasks = (tasksToSort) => {
    let sortedTasks = [...tasksToSort];

    switch (sortOption) {
      case "name":
        sortedTasks.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "date":
        sortedTasks.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        return tasksToSort;
    }


    if (sortOrder === "desc") {
      sortedTasks.reverse();
    }

    return sortedTasks;
  };


  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.status;
    if (filter === "completed") return task.status;
    return true;
  });


  const displayedTasks = getSortedTasks(
    filteredTasks.filter((task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = displayedTasks.slice(indexOfFirstTask, indexOfLastTask);


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(displayedTasks.length / tasksPerPage);

  return (
    <div className="h-screen bg-[#0A0A0A] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-[#44403C] p-6 rounded-lg shadow-lg min-h-[400px] flex flex-col justify-between">
        <header className="mb-6 flex justify-between flex-wrap items-center">
          <h1 className="text-2xl font-semibold flex items-center gap-2 bg-[#525252] p-2 rounded-lg font-Bona_Nova text-white">
            <span><ClipboardCheck /></span> Task List
          </h1>
          <div className="mt-6 text-center w-full sm:w-auto">
            <Link href="/add-task">
              <p className="px-6 py-2 bg-blue-500/60 text-white rounded-md hover:bg-blue-600 inline-block">
                Add Task
              </p>
            </Link>
          </div>
        </header>

        {error && <ErrorMessage message={error} />}

        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
        />

        <div className="flex flex-wrap justify-between items-center mb-6">
          <TaskFilterButtons
            filter={filter}
            setFilter={(newFilter) => {
              setFilter(newFilter);
              setCurrentPage(1); 
            }}
          />

          <div className="flex items-center space-x-2">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1 border rounded-md text-sm bg-[#FEFCE8]"
            >
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="p-1 border rounded-md text-sm bg-[#FEFCE8]"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <button
            onClick={bulkRemoveCompleted}
            className="px-4 py-2 bg-red-500/50 text-white rounded-md hover:bg-red-600"
            disabled={!tasks.some((task) => task.status)}
          >
            Remove All
          </button>
        </div>
         <div><p className="text-red-500 italic font-bold text-sm">Click on the task name to get the details of the task </p></div>
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : (
          <>
            <ul>
              {currentTasks.length > 0 ? (
                currentTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    toggleTaskCompletion={toggleTaskCompletion}
                    loadingTasks={loadingTasks}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500">No tasks found.</p>
              )}
            </ul>

            <div className="flex justify-center items-center mt-6 space-x-10 p-4 rounded-lg flex-wrap">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-white font-semibold px-2 py-1 text-xs rounded-full">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;
