import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  FileText,
  Tag,
  StickyNote,
  Loader2,
  AlertCircle,
  Users,
  X,
} from "lucide-react";
import NewPageLayout from "../Layout/NewPageLayout";
import useIsMobile from "../../hooks/useIsMobile";
import {
  createTask,
  getTaskById,
  updateTask,
  getTaskAssignees,
} from "../../services/api";

function TaskForm({ mode = "add", taskId }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [assigneeOptions, setAssigneeOptions] = useState([]);

  const [formData, setFormData] = useState({
    projectName: "",
    title: "",
    clientName: "",
    assignedTo: [],
    dueDate: "",
    status: "Pending",
    priority: "Medium",
  });

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const res = await getTaskAssignees();
        if (res.data.success) setAssigneeOptions(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignees();
  }, []);

  useEffect(() => {
    if (mode === "edit" && taskId) {
      const fetchTask = async () => {
        try {
          const { data } = await getTaskById(taskId);
          if (data.success) {
            const t = data.data;
            setFormData({
              projectName: t.projectName || "",
              title: t.title || "",
              clientName: t.clientName || "",
              dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
              status: t.status || "Pending",
              priority: t.priority || "Medium",
              assignedTo:
                t.assignedTo?.map((a) => a.assigneeId?._id || a.assigneeId) ||
                [],
            });
          }
        } catch {
          setError("Failed to load task");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTask();
    }
  }, [taskId, mode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const addAssignee = (e) => {
    const id = e.target.value;
    if (id && !formData.assignedTo.includes(id)) {
      setFormData({ ...formData, assignedTo: [...formData.assignedTo, id] });
    }
    e.target.value = "";
  };

  const removeAssignee = (idToRemove) => {
    setFormData({
      ...formData,
      assignedTo: formData.assignedTo.filter((id) => id !== idToRemove),
    });
  };

  const getNameFromId = (id) => {
    const match = assigneeOptions.find((a) => a._id === id);
    return match ? match.name : "Unknown";
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      setError("Task title is required");
      return;
    }
    setSaving(true);
    try {
      if (mode === "add") {
        const { data } = await createTask(formData);
        if (data.success) navigate("/tasks");
      } else {
        const { data } = await updateTask(taskId, formData);
        if (data.success) navigate("/tasks");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";

  if (initialLoading) {
    return (
      <NewPageLayout title="Loading...">
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
        </div>
      </NewPageLayout>
    );
  }

  return (
    <NewPageLayout
      title={mode === "add" ? "Add Task" : "Edit Task"}
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "add" ? (
              "Save Task"
            ) : (
              "Update Task"
            )}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="space-y-1">
              <label className={labelClass}>Project Name</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <input
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  placeholder="Project Name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Title *</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Task Title"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Client Name</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Client Name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Due Date</label>
              <div className={inputWrapperClass}>
                <Calendar className={iconClass} />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Status</label>
              <div className={inputWrapperClass}>
                <StickyNote className={iconClass} />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Priority</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className={labelClass}>Assign To Team</label>
              <div className={inputWrapperClass}>
                <Users className={iconClass} />
                <select
                  onChange={addAssignee}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Member to Assign</option>
                  {assigneeOptions.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.assignedTo.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-800"
                    >
                      {getNameFromId(id)}
                      <button
                        type="button"
                        onClick={() => removeAssignee(id)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default TaskForm;
