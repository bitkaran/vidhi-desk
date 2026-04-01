import { useParams } from "react-router-dom";
import ClientForm from "./ClientForm";

function EditClient() {
  const { id } = useParams();

  return <ClientForm mode="edit" clientId={id} />;
}

export default EditClient;