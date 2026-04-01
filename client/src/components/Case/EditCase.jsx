// src/components/Case/EditCase.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CaseForm from "./CaseForm";
import { getCaseById, updateCase } from "../../services/api";

function EditCase() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const res = await getCaseById(id);
      if (res.data.success) {
        setData(res.data.data);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      const res = await updateCase(id, form);
      if (res.data.success) navigate("/cases");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
      <CaseForm
        initialData={data}
        onSubmit={handleUpdate}
        loading={saving}
        submitLabel="Update Case"
      />
  );
}

export default EditCase;
