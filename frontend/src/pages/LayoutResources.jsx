import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useLayout } from "@/context/LayoutContext";
import { useAuth } from "@/context/AuthContext"; // Add this import
import { apiClient } from "@/lib/utils";
import { File, Image, FileText, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";

export default function LayoutResources() {
  const [resources, setResources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { selectedLayout } = useLayout();
  const { auth } = useAuth(); // Add this line

  // Add this near the start of the component
  if (auth.user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-red-500">You don't have permission to access this page</p>
      </div>
    );
  }

  useEffect(() => {
    if (selectedLayout) {
      fetchResources();
    }
  }, [selectedLayout]);

  const fetchResources = async () => {
    try {
      const { data } = await apiClient.get(`/layout-resources/layout/${selectedLayout}`);
      setResources(data);
    } catch (error) {
      toast.error("Failed to fetch resources");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('layoutId', selectedLayout);

    setUploading(true);
    try {
      await apiClient.post('/layout-resources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully');
      fetchResources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await apiClient.delete(`/layout-resources/${id}`);
      setResources(resources.filter(resource => resource._id !== id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image size={40} />;
    if (fileType === 'application/pdf') return <FileText size={40} />;
    return <File size={40} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!selectedLayout) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-gray-500">Please select a layout to view resources</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Layout Resources</h1>
        <div className="relative">
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,application/pdf"
          />
          <Button
            onClick={() => document.getElementById('fileUpload').click()}
            disabled={uploading}
            className="text-lg font-semibold capitalize cursor-pointer bg-[#1F263E] text-white"
          >
            {uploading ? 'Uploading...' : (
              <>
                <Upload strokeWidth={3}/>
                Upload File
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div
            key={resource._id}
            className="bg-white p-4 rounded-lg shadow-md space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center space-x-3 min-w-0">
                <div className="flex-shrink-0">
                  {getFileIcon(resource.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate max-w-[200px] sm:max-w-[250px]">{resource.originalName}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(resource.fileSize)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 self-end sm:self-auto">
                {auth.user?.role === "superadmin" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(resource._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 break-words">
              Uploaded on {format(new Date(resource.uploadDate), 'MMM d, yyyy')}
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(resource.url, '_blank')}
            >
              View File
            </Button>
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">No resources uploaded yet</p>
        </div>
      )}
    </div>
  );
}
