'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DocumentUpload from '@/components/DocumentUpload';
import { 
  FileText, 
  Calendar, 
  Download, 
  Trash2, 
  Eye, 
  Loader2,
  BookOpen,
  Ruler,
  Square,
  Droplet,
  Weight as WeightIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  title: string;
  grade_levels: number[];
  topic: string;
  status: string;
  questions_count: number;
  created_at: string;
  file_path: string;
}

export default function MeasurementPage() {
  const [activeTab, setActiveTab] = useState('length');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ragBase = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000';

  const topics = [
    { id: 'length', name: 'Length', icon: Ruler, units: 'cm, m, km', color: 'blue' },
    { id: 'area', name: 'Area', icon: Square, units: 'cm², m²', color: 'green' },
    { id: 'capacity', name: 'Capacity', icon: Droplet, units: 'ml, l', color: 'cyan' },
    { id: 'weight', name: 'Weight', icon: WeightIcon, units: 'g, kg', color: 'purple' },
  ];

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all documents, then filter by topic
      const response = await fetch(`${ragBase}/documents`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      const allDocs = data.documents || [];
      
      // Filter by current topic (case-insensitive)
      const topicName = topics.find(t => t.id === activeTab)?.name || '';
      const filtered = allDocs.filter((doc: Document) => 
        doc.topic.toLowerCase() === topicName.toLowerCase()
      );
      
      setDocuments(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Refresh the document list after successful upload
    fetchDocuments();
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`${ragBase}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh the list
      fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const getTopicColor = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.color || 'neutral';
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">Measurement Domain</h1>
        <p className="text-neutral-600 text-base">
          Upload documents and generate adaptive questions for measurement topics
        </p>
      </div>

      {/* Topic Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <TabsTrigger key={topic.id} value={topic.id} className="gap-2 py-3">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{topic.name}</span>
                <span className="sm:hidden">{topic.name.substring(0, 3)}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <TabsContent key={topic.id} value={topic.id} className="space-y-8 mt-8">
              {/* Topic Info Card */}
              <Card className={`border-l-4 border-${topic.color}-500 shadow-sm`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className={`p-2 rounded-lg bg-${topic.color}-50`}>
                      <Icon className={`h-5 w-5 text-${topic.color}-600`} />
                    </div>
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Units: <span className="font-medium">{topic.units}</span> • Grade levels: <span className="font-medium">1-5</span>
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Upload Section */}
              <DocumentUpload onUploadSuccess={handleUploadSuccess} />

              {/* Documents List */}
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BookOpen className="h-5 w-5 text-neutral-700" />
                    Uploaded Documents ({documents.length})
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Documents and generated questions for {topic.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    </div>
                  ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                      <p className="font-medium">Error loading documents</p>
                      <p className="text-sm">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDocuments}
                        className="mt-2"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                      <p className="font-medium text-lg mb-1">No documents uploaded yet</p>
                      <p className="text-sm text-neutral-400">Upload a document above to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border border-neutral-200 p-5 hover:bg-neutral-50 hover:border-neutral-300 transition-all hover:shadow-sm"
                        >
                          <div className="shrink-0">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                              <h4 className="font-semibold text-neutral-900 text-base truncate">
                                {doc.title}
                              </h4>
                              <Badge variant={doc.status === 'processed' ? 'default' : 'outline'} className="self-start px-3 py-1">
                                {doc.status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-neutral-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span>{doc.questions_count} questions</span>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                Grades: {doc.grade_levels.join(', ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                            <Button variant="outline" size="sm" title="View Details" className="gap-2">
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                            <Button variant="outline" size="sm" title="Download" className="gap-2">
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">Download</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Delete"
                              onClick={() => handleDelete(doc.id)}
                              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
