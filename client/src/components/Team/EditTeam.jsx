// src/components/Team/EditTeam.jsx
import { useParams } from "react-router-dom";
import TeamForm from "./TeamForm";

function EditTeam() {
  const { id } = useParams();

  return <TeamForm mode="edit" teamId={id} />;
}

export default EditTeam;
