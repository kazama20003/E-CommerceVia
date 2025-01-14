'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Pencil, Trash2, Play } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useFormik } from 'formik'
import { axiosInstance } from '@/lib/axiosInstance'
import { useToast } from "@/hooks/use-toast"

interface Video {
  _id: string;
  provider: string;
  link: string;
  title?: string;
  thumbnailUrl?: string;
}

export const VideoTab: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const params = useParams()
  const productId = params.slug as string
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchVideos = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/products/${productId}/videos`);
      const videosData = response.data.data;
      const videoDetails = await Promise.all(videosData.map(fetchVideoDetails));
      setVideos(videoDetails);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({ title: "Error fetching videos", description: "Please try again", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [productId, toast, isLoading]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const fetchVideoDetails = async (video: { _id: string; provider: string; link: string }): Promise<Video> => {
    return { 
      _id: video._id, 
      provider: video.provider, 
      link: video.link,
      title: `${video.provider} Video` 
    };
  };

  const formik = useFormik({
    initialValues: {
      provider: '',
      link: '',
    },
    validate: (values) => {
      const errors: { provider?: string; link?: string } = {};
      if (!values.provider) errors.provider = 'Provider is required';
      if (!values.link) errors.link = 'Link is required';
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        if (selectedVideo) {
          await axiosInstance.put(`/products/${productId}/videos/${selectedVideo._id}`, values)
          toast({ title: "Video updated successfully"})
        } else {
          await axiosInstance.post(`/products/${productId}/videos`, values)
          toast({ title: "Video added successfully"})
        }
        await fetchVideos();
        setIsDialogOpen(false)
        formik.resetForm()
      } catch (error) {
        console.error('Error saving video:', error)
        toast({ title: "Error saving video", description: "Please try again", variant: "destructive" })
      } finally {
        setSubmitting(false);
      }
    },
  })

  const handleDelete = async (videoId: string) => {
    try {
      await axiosInstance.delete(`/products/${productId}/videos`, {
        data: { videoId }
      });
      toast({ title: "Video deleted successfully" });
      await fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({ title: "Error deleting video", description: "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Videos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setSelectedVideo(null)
                formik.resetForm()
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedVideo ? 'Edit Video' : 'Add New Video'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Video Provider</Label>
                <Input
                  id="provider"
                  {...formik.getFieldProps('provider')}
                  placeholder="e.g., YouTube"
                />
                {formik.touched.provider && formik.errors.provider && (
                  <div className="text-red-500 text-sm">{formik.errors.provider}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Video Link</Label>
                <Input
                  id="link"
                  {...formik.getFieldProps('link')}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {formik.touched.link && formik.errors.link && (
                  <div className="text-red-500 text-sm">{formik.errors.link}</div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={formik.isSubmitting || isLoading}>
                {formik.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading videos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <Card key={video._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <a 
                  href={video.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <CardHeader className="p-4">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{video.title || "Untitled Video"}</CardTitle>
                    <p className="text-sm text-gray-500 mb-2">{video.provider}</p>
                    <p className="text-sm text-blue-500 truncate">{video.link}</p>
                  </CardContent>
                </a>
                <CardFooter className="p-4 pt-0 flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setSelectedVideo(video)
                      formik.setValues({
                        provider: video.provider,
                        link: video.link,
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(video._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No videos found. Add a video to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

