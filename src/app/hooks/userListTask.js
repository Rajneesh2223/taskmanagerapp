import Link from 'next/link';
import { format } from 'date-fns'; 

export const TaskFilterButtons = ({ filter, setFilter }) => (
  <div className="flex gap-4">
  {['all', 'active', 'completed'].map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      className={`px-2 text-xs font-extralight  py-1 rounded-md ${
        filter === status? status === 'active' ? "bg-green-400 text-black" : status === 'completed' ? "bg-red-300 text-black"
            : "bg-blue-400 text-white"
          : "bg-gray-300"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  ))}
</div>


);


export const TaskItem = ({ task, toggleTaskCompletion, loadingTasks }) => {
 
  const formattedDate = task.createdAt 
    ? format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm')
    : 'No date available';

  return (
    <li
      className="flex justify-between items-center border-b p-4 last:border-b-0 hover:bg-blue-300/10 rounded-md"
    >
      <div className="flex items-center gap-4 text-white">
        <input
          type="checkbox"
          checked={task.status}
          onChange={() => toggleTaskCompletion(task._id)}
          disabled={loadingTasks[task._id]}
          className={`w-5 h-5 ${
            loadingTasks[task._id] ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
        <div className="flex flex-col">
          <Link href={`/details-task/${task._id}`}>
            <p
              className={`text-lg font-geistMono text-green-200/80 ${
                task.status ? "line-through text-gray-300" : ""
              } ${loadingTasks[task._id] ? 'opacity-50' : ''}`}
            >
             {task.name.charAt(0).toUpperCase() + task.name.slice(1)}

            </p>
          </Link>
          <span className="text-xs text-blue-200 ">
            Created: {formattedDate}
          </span>
        </div>
      </div>
    </li>
  );
};


export const ErrorMessage = ({ message }) => (
  <div className="bg-red-500 text-white p-2 rounded-md mb-4">
    {message}
  </div>
);