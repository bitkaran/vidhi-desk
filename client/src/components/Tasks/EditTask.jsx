// src/components/Tasks/EditTask.jsx
import { useParams } from "react-router-dom";
import TaskForm from "./TaskForm";

function EditTask() {
  const { id } = useParams();

  return <TaskForm mode="edit" taskId={id} />;
}

export default EditTask;
