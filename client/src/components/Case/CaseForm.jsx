import React, { useEffect, useState } from "react";
import NewPageLayout from "../Layout/NewPageLayout";
import {
  Calendar,
  User,
  MapPin,
  FileText,
  Tag,
  StickyNote,
  Loader2,
  AlertCircle,
  X,
  Users,
  Upload,
  Briefcase,
} from "lucide-react";
import { getCaseAdvocates, getClients } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const STAGES = {
  Criminal: [
    "FIR",
    "Chargesheet",
    "Framing of Charges",
    "Prosecution Evidence",
    "Defense Evidence",
    "Judgment",
  ],
  Civil: [
    "Filing",
    "Written Statement",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Judgment",
  ],
  Matrimonial: [
    "Pleadings",
    "Issues",
    "Plaintiff Evidence",
    "Defendant Evidence",
    "Final Arguments",
    "Judgment",
  ],
};

const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_FILES = 5;

// 🔹 This defines exactly what text fields are allowed to be sent
const defaultForm = {
  caseParty1: "",
  caseParty2: "",
  court: "",
  caseType: "",
  stage: "",
  cnr: "",
  firNo: "",
  policeStation: "",
  caseAmount: "",
  note: "",
  fileNo: "",
  object: "",
  target: "",
};

function CaseForm({
  initialData = {},
  onSubmit,
  loading = false,
  submitLabel = "Save Case",
}) {
  const [formData, setFormData] = useState({ ...defaultForm });

  // 🔹 Document States
  const [files, setFiles] = useState([]); // New pending files
  const [existingDocs, setExistingDocs] = useState([]); // Old saved files
  const [docError, setDocError] = useState("");
  const showToast = useToast();

  const [advocates, setAdvocates] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [mainUserId, setMainUserId] = useState(null);

  const [selectedLawyer, setSelectedLawyer] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [error, setError] = useState("");

  // 1. Fetch Dropdown Data
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [advRes, clientRes] = await Promise.all([
          getCaseAdvocates(),
          getClients(),
        ]);

        if (advRes.data.success) {
          const list = advRes.data.data;
          setAdvocates(list);
          const mainUser = list.find((a) => a.isMainUser);
          if (mainUser) setMainUserId(mainUser._id);
        }

        if (clientRes.data.success) {
          setClientsList(clientRes.data.data);
        }
      } catch (err) {
        // console.log("Failed to load dependencies");
      }
    };
    fetchDependencies();
  }, []);

  // 2. Handle Edit Mode Prefill
  useEffect(() => {
    if (initialData?._id) {
      if (initialData?.lawyers?.length > 0) {
        const caseLawyerId =
          initialData.lawyers[0].lawyerId?._id ||
          initialData.lawyers[0].lawyerId;
        const team = initialData.lawyers
          .slice(1)
          .map((l) => l.lawyerId?._id || l.lawyerId);
        setSelectedLawyer(caseLawyerId);
        setSelectedTeamMembers(team);
      }
      if (initialData?.clients?.length > 0) {
        setSelectedClients(initialData.clients.map((c) => c._id || c));
      }
      // 🔹 Populate existing documents
      if (initialData?.documents?.length > 0) {
        setExistingDocs(initialData.documents);
      }

      const safeData = {};
      Object.keys(defaultForm).forEach((key) => {
        safeData[key] = initialData[key] || "";
      });
      setFormData(safeData);
    } else if (!initialData?._id && mainUserId && !selectedLawyer) {
      setSelectedLawyer(mainUserId);
    }
  }, [initialData, mainUserId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  // 🔹 Advanced File Handling Logic
  const handleFileChange = (e) => {
    setDocError("");
    const newFiles = Array.from(e.target.files);
    const currentTotal = existingDocs.length + files.length;

    if (currentTotal + newFiles.length > MAX_TOTAL_FILES) {
      setDocError(
        `You can only upload a maximum of ${MAX_TOTAL_FILES} documents per case.`,
      );
      return;
    }

    const validFiles = [];
    newFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setDocError(
          `File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`,
        );
      } else {
        validFiles.push(file);
      }
    });

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null; // reset
  };

  const removeFile = (index) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));
  const removeExistingDoc = (index) =>
    setExistingDocs((prev) => prev.filter((_, i) => i !== index));

  const handleLawyerChange = (e) => {
    const newLawyerId = e.target.value;
    setSelectedLawyer(newLawyerId);

    let updatedTeam = [...selectedTeamMembers];
    updatedTeam = updatedTeam.filter((id) => id !== newLawyerId);

    if (newLawyerId !== mainUserId && mainUserId) {
      if (!updatedTeam.includes(mainUserId)) {
        updatedTeam.push(mainUserId);
      }
    }
    setSelectedTeamMembers(updatedTeam);
  };

  const addTeamMember = (e) => {
    const id = e.target.value;
    if (id && !selectedTeamMembers.includes(id) && id !== selectedLawyer) {
      setSelectedTeamMembers([...selectedTeamMembers, id]);
    }
    e.target.value = "";
  };

  const removeTeamMember = (idToRemove) => {
    if (idToRemove === mainUserId && selectedLawyer !== mainUserId) {
      alert(
        "Since you are not the primary Case Lawyer, you must remain in the Team Members list.",
      );
      return;
    }
    setSelectedTeamMembers(
      selectedTeamMembers.filter((id) => id !== idToRemove),
    );
  };

  const addClient = (e) => {
    const id = e.target.value;
    if (id && !selectedClients.includes(id)) {
      setSelectedClients([...selectedClients, id]);
    }
    e.target.value = "";
  };

  const removeClient = (idToRemove) => {
    setSelectedClients(selectedClients.filter((id) => id !== idToRemove));
  };

  const submit = () => {
    if (!formData.caseParty1 || !formData.caseParty2 || !formData.caseType) {
      const msg = "Parties and Case Type are required.";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    const payload = new FormData();

    // 🔹 1. Fields we want to IGNORE because they are handled separately or cause crashes
    const ignoreFields = [
      "documents",
      "existingDocs",
      "createdAt",
      "updatedAt",
      "__v",
      "lawyers", // Handled below
      "clients", // Handled below
      "feeCollections", // 🚨 Prevents CastError!
      "feeDues", // 🚨 Prevents CastError!
      "notes", // 🚨 Prevents CastError!
      "timeline", // 🚨 Prevents CastError!
    ];

    // 🔹 2. Append only safe string/text data
    Object.keys(formData).forEach((key) => {
      if (
        formData[key] !== undefined &&
        formData[key] !== null &&
        !ignoreFields.includes(key)
      ) {
        payload.append(key, formData[key]);
      }
    });

    // 🔹 3. Append relational arrays manually
    payload.append("selectedLawyer", selectedLawyer);
    selectedTeamMembers.forEach((memberId) =>
      payload.append("teamMembers", memberId),
    );
    selectedClients.forEach((clientId) => payload.append("clients", clientId));

    // 🔹 4. Append files
    existingDocs.forEach((doc) => payload.append("existingDocs", doc));
    files.forEach((file) => payload.append("documents", file));

    onSubmit(payload);
  };

  const availableStages = formData.caseType
    ? STAGES[formData.caseType] || []
    : [];

  const getTeamNameFromId = (id) => {
    const match = advocates.find((a) => a._id === id);
    return match ? match.name : "Unknown";
  };

  const getClientNameFromId = (id) => {
    const match = clientsList.find((c) => c._id === id);
    return match ? match.name : "Unknown";
  };

  const labelClass =
    "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm";
  const iconClass = "absolute left-3 top-3.5 text-slate-400 w-4 h-4";
  const inputWrapperClass = "relative";
  const cardClass = "bg-white dark:bg-slate-900 rounded-2xl p-5";

  return (
    <NewPageLayout
      title="Case Form"
      footer={
        <div className="fixed bottom-0 left-0 w-full md:static flex justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              submitLabel
            )}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <div className={cardClass}>
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className={labelClass}>Case Party - 1 *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="caseParty1"
                  value={formData.caseParty1}
                  onChange={handleChange}
                  placeholder="Party - 1"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Case Party - 2 *</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <input
                  name="caseParty2"
                  value={formData.caseParty2}
                  onChange={handleChange}
                  placeholder="Vs Party - 2"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                className={`${labelClass} text-emerald-700 dark:text-emerald-500`}
              >
                Assign Clients to Case
              </label>
              <div className={inputWrapperClass}>
                <Briefcase className={`${iconClass} text-emerald-500`} />
                <select
                  onChange={addClient}
                  className={`${inputClass} pl-10 border-emerald-200 focus:ring-emerald-500/50`}
                >
                  <option value="">Select a Client from Directory</option>
                  {clientsList.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.phone}
                    </option>
                  ))}
                </select>
              </div>
              {selectedClients.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedClients.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
                    >
                      {getClientNameFromId(id)}
                      <button
                        type="button"
                        onClick={() => removeClient(id)}
                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Case Type *</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <select
                  name="caseType"
                  value={formData.caseType}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Case Type</option>
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Matrimonial">Matrimonial</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Stage</label>
              <div className={inputWrapperClass}>
                <Calendar className={iconClass} />
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  disabled={!availableStages.length}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">
                    {availableStages.length
                      ? "Select Stage"
                      : "Select Case Type First"}
                  </option>
                  {availableStages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Court</label>
              <div className={inputWrapperClass}>
                <MapPin className={iconClass} />
                <select
                  name="court"
                  value={formData.court}
                  onChange={handleChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Court</option>
                  <option value="District Court">District Court</option>
                  <option value="High Court">High Court</option>
                  <option value="Supreme Court">Supreme Court</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Case Lawyer</label>
              <div className={inputWrapperClass}>
                <User className={iconClass} />
                <select
                  value={selectedLawyer}
                  onChange={handleLawyerChange}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Lawyer</option>
                  {advocates.map((adv) => (
                    <option key={adv._id} value={adv._id}>
                      {adv.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Add Team Members</label>
              <div className={inputWrapperClass}>
                <Users className={iconClass} />
                <select
                  onChange={addTeamMember}
                  className={`${inputClass} pl-10`}
                >
                  <option value="">Select Member to Add</option>
                  {advocates
                    .filter((a) => a._id !== selectedLawyer)
                    .map((adv) => (
                      <option key={adv._id} value={adv._id}>
                        {adv.name}
                      </option>
                    ))}
                </select>
              </div>
              {selectedTeamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3">
                  {selectedTeamMembers.map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
                    >
                      {getTeamNameFromId(id)}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(id)}
                        className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🔹 ADVANCED DOCUMENT UPLOAD AREA */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className={labelClass}>Case Documents</label>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {existingDocs.length + files.length} / {MAX_TOTAL_FILES} Files
                </span>
              </div>

              {docError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {docError}
                </div>
              )}

              {existingDocs.length + files.length < MAX_TOTAL_FILES ? (
                <div className="relative mt-1">
                  <input
                    type="file"
                    multiple
                    id="doc-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="doc-upload"
                    className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                  >
                    <Upload className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                      Tap to Select Files (Max {MAX_FILE_SIZE_MB}MB each)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm font-medium">
                  Maximum document limit reached. Remove a file to upload a new
                  one.
                </div>
              )}

              {/* 1. Show Currently Saved Docs (Removable) */}
              {existingDocs.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Already Saved:
                  </p>
                  <div className="flex flex-col gap-2">
                    {existingDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText
                            size={16}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="truncate">
                            {doc.split("-").pop()}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingDoc(idx)}
                          className="text-red-500 hover:text-red-700 ml-2 p-1 bg-red-50 dark:bg-red-900/20 rounded-md transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Show Pending Uploads (Removable) */}
              {files.length > 0 && (
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Pending Uploads:
                  </p>
                  <div className="flex flex-col gap-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-300"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText
                            size={16}
                            className="text-blue-500 shrink-0"
                          />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-red-500 hover:text-red-700 ml-2 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>CNR No.</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <input
                  name="cnr"
                  value={formData.cnr}
                  onChange={handleChange}
                  placeholder="Enter CNR No."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>FIR No. (If Any)</label>
              <div className={inputWrapperClass}>
                <FileText className={iconClass} />
                <input
                  name="firNo"
                  value={formData.firNo}
                  onChange={handleChange}
                  placeholder="Enter FIR No."
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Police Station</label>
              <div className={inputWrapperClass}>
                <MapPin className={iconClass} />
                <input
                  name="policeStation"
                  value={formData.policeStation}
                  onChange={handleChange}
                  placeholder="Enter Police Station"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Case Amount</label>
              <div className={inputWrapperClass}>
                <Tag className={iconClass} />
                <input
                  name="caseAmount"
                  value={formData.caseAmount}
                  onChange={handleChange}
                  placeholder="Enter Case Amount"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Note</label>
              <div className={inputWrapperClass}>
                <StickyNote className={iconClass} />
                <textarea
                  rows={3}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Enter Note"
                  className={`${inputClass} pl-10 resize-none`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewPageLayout>
  );
}

export default CaseForm;
