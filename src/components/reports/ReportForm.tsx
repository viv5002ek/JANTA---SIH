import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card } from '../ui/Card';
import { JHARKHAND_DISTRICTS, CATEGORIES, SUBCATEGORIES } from '../../constants';
import toast from 'react-hot-toast';

interface ReportFormProps {
  onSuccess?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    district: '',
    sector_number: '',
    address_line: ''
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${user!.id}_${Date.now()}_${index}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('report-images')
        .upload(fileName, image);

      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images
      const imageUrls = await uploadImages();

      // Create report
      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user!.id,
          ...formData,
          latitude: location?.lat,
          longitude: location?.lng,
          images: imageUrls.length > 0 ? imageUrls : null
        }]);

      if (error) throw error;

      toast.success('Report submitted successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        district: '',
        sector_number: '',
        address_line: ''
      });
      setImages([]);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Report an Issue</h3>
        <p className="text-sm text-gray-600">Help improve your community by reporting civic issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            placeholder="Brief title of the issue"
          />

          <Select
            label="District"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            options={JHARKHAND_DISTRICTS.map(district => ({ value: district, label: district }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={CATEGORIES.map(category => ({ value: category, label: category }))}
            required
          />

          {formData.category && (
            <Select
              label="Sub-category"
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              options={SUBCATEGORIES[formData.category as keyof typeof SUBCATEGORIES]?.map(sub => ({ value: sub, label: sub })) || []}
              required
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sector Number"
            value={formData.sector_number}
            onChange={(e) => handleInputChange('sector_number', e.target.value)}
            required
            placeholder="e.g., Sector 3, Block A"
          />

          {location && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-md">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Location detected</span>
            </div>
          )}
        </div>

        <Input
          label="Address Line"
          value={formData.address_line}
          onChange={(e) => handleInputChange('address_line', e.target.value)}
          required
          placeholder="Detailed address description"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Images (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB each (max 5 images)</p>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="h-20 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Submit Report
        </Button>
      </form>
    </Card>
  );
};