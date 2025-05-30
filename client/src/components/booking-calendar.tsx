import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Venue, Field, TimeSlot } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface BookingCalendarProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingCalendar({ venue, isOpen, onClose }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const { toast } = useToast();

  const { data: fields } = useQuery({
    queryKey: ['/api/venues', venue?.id, 'fields'],
    queryFn: async () => {
      if (!venue) return [];
      const response = await fetch(`/api/venues/${venue.id}/fields`);
      return response.json();
    },
    enabled: !!venue,
  });

  const { data: timeSlots } = useQuery({
    queryKey: ['/api/fields', selectedField?.id, 'slots', selectedDate],
    queryFn: async () => {
      if (!selectedField) return [];
      const response = await fetch(`/api/fields/${selectedField.id}/slots?date=${selectedDate}`);
      return response.json();
    },
    enabled: !!selectedField && !!selectedDate,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest('POST', '/api/bookings', bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created!",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isAvailable && !slot.adminBlocked) {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = () => {
    if (!selectedSlot || !selectedField) return;

    bookingMutation.mutate({
      fieldId: selectedField.id,
      timeSlotId: selectedSlot.id,
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      totalAmount: selectedSlot.price,
      status: 'pending',
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 0 ? hour + 1 : hour;
        const endTimeString = `${endHour.toString().padStart(2, '0')}:00`;
        
        // Find matching time slot from API or create mock
        const apiSlot = timeSlots?.find((slot: TimeSlot) => slot.startTime === timeString);
        const isBooked = Math.random() > 0.7; // Mock some booked slots
        const isPeak = hour >= 17 && hour <= 21; // 5 PM to 9 PM is peak
        
        slots.push({
          time: timeString,
          endTime: endTimeString,
          isAvailable: !isBooked,
          isPeak,
          price: isPeak ? 45 : 35,
          slot: apiSlot,
        });
      }
    }
    return slots;
  };

  const timeSlotData = generateTimeSlots();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  if (!venue) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Book {venue.name}</span>
          </DialogTitle>
          <p className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {venue.address}, {venue.city}
          </p>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* Field Selection */}
          {fields && fields.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Field</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map((field: Field) => (
                  <Button
                    key={field.id}
                    variant={selectedField?.id === field.id ? "default" : "outline"}
                    onClick={() => setSelectedField(field)}
                    className="p-4 h-auto text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.sportType} • ${field.hourlyRate}/hr</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Date</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, index) => (
                <Button
                  key={index}
                  variant={selectedDate === date.toISOString().split('T')[0] ? "default" : "outline"}
                  onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                  className="p-3 text-center"
                >
                  <div>
                    <div className="text-xs">{weekDays[index]}</div>
                    <div className="font-medium">{date.getDate()}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Slots Grid */}
          {selectedField && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Available Times</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {timeSlotData.map((slot, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleSlotClick({
                      id: index,
                      fieldId: selectedField.id,
                      date: selectedDate,
                      startTime: slot.time,
                      endTime: slot.endTime,
                      isAvailable: slot.isAvailable,
                      isPeakHour: slot.isPeak,
                      price: slot.price.toString(),
                      adminBlocked: false,
                    })}
                    className={`p-3 h-auto ${
                      !slot.isAvailable 
                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed' 
                        : slot.isPeak
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                        : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    } ${
                      selectedSlot?.startTime === slot.time ? 'ring-2 ring-blue-500' : ''
                    }`}
                    disabled={!slot.isAvailable}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium">{slot.time}</div>
                      <div className="text-xs">${slot.price}</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded border border-green-200 mr-2"></div>
                  <span>Available - Regular</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 rounded border border-blue-200 mr-2"></div>
                  <span>Available - Peak</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 rounded border border-red-200 mr-2"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Summary */}
          {selectedSlot && selectedField && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold mb-4">Booking Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString()} - {selectedSlot.startTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span>Field:</span>
                  <span className="font-medium">{selectedField.name}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-500">${selectedSlot.price}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBooking}
                disabled={bookingMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 mt-6"
              >
                {bookingMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
