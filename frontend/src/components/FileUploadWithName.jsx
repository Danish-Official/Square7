import { apiClient } from "@/lib/utils";
import { Upload, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

function FileUploadWithName({ expense, fetchExpenses }) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements[`file_${expense._id}`];
    if (!fileInput.files[0]) return;
    const formData = new FormData();
    formData.append('document', fileInput.files[0]);
    try {
      await apiClient.post(`/expenses/${expense._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchExpenses();
      toast.success('Document uploaded');
      setFileName("");
      fileInput.value = "";
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the uploaded document?")) return;
    try {
      await apiClient.delete(`/expenses/${expense._id}/document`);
      fetchExpenses();
      toast.success("Document deleted");
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <form className="flex items-center gap-1" onSubmit={handleSubmit}>
        <label className="relative cursor-pointer inline-flex items-center">
          <input
            type="file"
            name={`file_${expense._id}`}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleChange}
          />
          <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs border border-gray-200 hover:bg-gray-200 transition">
            {fileName || "Choose file"}
          </span>
        </label>
        <button
          type="submit"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium border border-green-200 transition"
          title="Upload document"
          disabled={!fileName}
        >
          <Upload size={14} />
        </button>
      </form>
      {expense.documentUrl && (
        <button
          type="button"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium border border-red-200 transition"
          title="Delete document"
          onClick={handleDelete}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export default FileUploadWithName;