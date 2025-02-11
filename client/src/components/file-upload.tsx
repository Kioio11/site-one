import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";

interface FileUploadProps {
  orderId: number;
  onUpload?: () => void;
}

export default function FileUpload({ orderId, onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { data: files, isLoading } = useQuery<File[]>({
    queryKey: [`/api/orders/${orderId}/files`],
    enabled: !!orderId,
  });

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiRequest("POST", `/api/orders/${orderId}/files`, formData);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      setFile(null);
      onUpload?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
    setIsUploading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files && files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
              >
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    // Handle file deletion if needed
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
          className="flex-1"
        />
        <Button 
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="min-w-[100px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </div>
    </div>
  );
}