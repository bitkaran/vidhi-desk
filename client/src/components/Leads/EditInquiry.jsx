// src/components/Leads/EditInquiry.jsx
import { useParams } from "react-router-dom";
import InquiryForm from "./InquiryForm";

function EditInquiry() {
  const { id } = useParams();

  return <InquiryForm mode="edit" leadId={id} />;
}

export default EditInquiry;
