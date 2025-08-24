'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    duration: ''
  });

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch services from Supabase
  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
      
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive',
      });
      return;
    }
    
    setServices(data as Service[]);
  };

  // Open dialog for adding new service
  const handleAddService = () => {
    setIsEditing(false);
    setCurrentService(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      duration: ''
    });
    setShowServiceDialog(true);
  };

  // Open dialog for editing service
  const handleEditService = (service: Service) => {
    setIsEditing(true);
    setCurrentService(service);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      description: service.description || '',
      duration: service.duration ? service.duration.toString() : ''
    });
    setShowServiceDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Save service (create or update)
  const handleSaveService = async () => {
    // Validate form
    if (!formData.name || !formData.price) {
      toast({
        title: 'Error',
        description: 'Name and price are required',
        variant: 'destructive',
      });
      return;
    }

    const serviceData = {
      name: formData.name,
      price: parseInt(formData.price),
      description: formData.description || null,
      duration: formData.duration ? parseInt(formData.duration) : null
    };

    if (isEditing && currentService) {
      // Update existing service
      const { error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', currentService.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update service',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setServices(services.map(service => 
        service.id === currentService.id ? { ...service, ...serviceData } : service
      ));

      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
    } else {
      // Create new service
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create service',
          variant: 'destructive',
        });
        return;
      }

      // Update local state
      setServices([...services, data[0] as Service]);

      toast({
        title: 'Success',
        description: 'Service created successfully',
      });
    }

    // Close dialog and reset form
    setShowServiceDialog(false);
    setFormData({
      name: '',
      price: '',
      description: '',
      duration: ''
    });
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
      return;
    }

    // Update local state
    setServices(services.filter(service => service.id !== serviceId));

    toast({
      title: 'Success',
      description: 'Service deleted successfully',
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Services</h1>
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Services List</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No services found</p>
            ) : (
              <div className="divide-y">
                {services.map((service) => (
                  <div key={service.id} className="flex justify-between items-center py-4">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-500">{service.description}</p>
                      )}
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm text-gray-500">
                          Price: {formatCurrency(service.price)}
                        </span>
                        {service.duration && (
                          <span className="text-sm text-gray-500">
                            Duration: {service.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Service name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">Price (IDR)</label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Price in IDR"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Service description"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">Duration in minutes (optional)</label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="Duration in minutes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveService}>{isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}