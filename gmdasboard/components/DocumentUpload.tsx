'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface UploadResponse {
  id: string;
  title: string;
  grade_levels: number[];
  topic: string;
  status: string;
  questions_count: number;
}

interface DocumentUploadProps {
  onUploadSuccess?: (document: UploadResponse) => void;
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [gradeLevels, setGradeLevels] = useState<number[]>([1]);
  const [topic, setTopic] = useState('Length');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ragBase = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000';

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('grade_levels', gradeLevels.join(','));
      formData.append('topic', topic);
      formData.append('uploaded_by', 'teacher_id_here'); // TODO: Get from auth context

      const response = await fetch(`${ragBase}/upload/document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed: ${response.status} ${text}`);
      }

      const data: UploadResponse = await response.json();
      setResult(data);

      // Auto-generate questions
      if (data.id) {
        await generateQuestions(data.id);
      }

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateQuestions = async (documentId: string) => {
    try {
      const response = await fetch(`${ragBase}/questions/generate/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_questions: 10,
          grade_level: gradeLevels[0] || 1,
          difficulty_levels: [1, 2, 3, 4, 5],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Question generation failed:', response.status, text);
        return;
      }

      const data = await response.json();
      console.log('Questions generated:', data);
      
      // Update result with new questions count
      if (result) {
        setResult({ ...result, questions_count: data.questions_generated || 0 });
      }
    } catch (err) {
      console.error('Question generation failed:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload PDF, DOCX, or TXT files to generate adaptive questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Input */}
        <div className="space-y-3">
          <Label htmlFor="file-upload" className="text-sm font-medium">Document File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded-md p-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="truncate">{file.name}</span>
            </div>
          )}
        </div>

        {/* Topic Selection */}
        <div className="space-y-3">
          <Label htmlFor="topic-select" className="text-sm font-medium">Topic</Label>
          <Select value={topic} onValueChange={setTopic} disabled={uploading}>
            <SelectTrigger id="topic-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Length">Length (cm, m, km)</SelectItem>
              <SelectItem value="Area">Area (cm², m²)</SelectItem>
              <SelectItem value="Capacity">Capacity (ml, l)</SelectItem>
              <SelectItem value="Weight">Weight (g, kg)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grade Level Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Grade Levels</Label>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((grade) => (
              <Badge
                key={grade}
                variant={gradeLevels.includes(grade) ? 'default' : 'outline'}
                className="cursor-pointer select-none px-4 py-2 text-sm transition-all hover:scale-105"
                onClick={() => {
                  if (uploading) return;
                  if (gradeLevels.includes(grade)) {
                    setGradeLevels(gradeLevels.filter((g) => g !== grade));
                  } else {
                    setGradeLevels([...gradeLevels, grade]);
                  }
                }}
              >
                Grade {grade}
              </Badge>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <div className="pt-2">
          <Button
            onClick={handleUpload}
            disabled={uploading || !file || gradeLevels.length === 0}
            className="w-full gap-2 h-11"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading & Generating Questions...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload & Generate Questions
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Upload Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Upload Successful!</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>Document: {result.title}</p>
                <p>Topic: {result.topic}</p>
                <p>Status: {result.status}</p>
                <p>Questions Generated: {result.questions_count}</p>
                <p className="text-xs text-green-600">ID: {result.id}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
