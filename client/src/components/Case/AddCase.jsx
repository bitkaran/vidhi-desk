// src/components/Case/AddCase.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CaseForm from "./CaseForm";
import { createCase } from "../../services/api";
import { useToast } from "../../context/ToastContext";

function AddCase() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data) => {
    try {
      setLoading(true);
      const res = await createCase(data);

      if (res.data.success) {
        showToast("Case created successfully!");
        navigate("/cases");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error creating case", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CaseForm
      onSubmit={handleCreate}
      loading={loading}
      submitLabel="Save Case"
    />
  );
}

export default AddCase;
