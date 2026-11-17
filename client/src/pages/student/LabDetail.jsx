import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiCompass,
  FiCalendar,
  FiClock,
  FiUsers,
  FiTool,
  FiUserCheck,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import labService from '../../services/lab.service';
import waitingListService from '../../services/waitingList.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LabDetail = () => {
  const { id } = useParams();
  const [lab, setLab] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [waitingListLoading, setWaitingListLoading] = useState(false);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        setLoading(true);
        const res = await labService.getLab(id);
        if (res.success) setLab(res.data);
      } catch (err) {
        console.error('Error fetching lab:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLab();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;
      try {
        setSlotLoading(true);
        const res = await labService.getLabAvailability(id, { date: selectedDate });
        if (res.success) setAvailability(res.data);
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setSlotLoading(false);
      }
    };

    fetchAvailability();
  }, [id, selectedDate]);

  const handleJoinWaitingList = async (slot) => {
    try {
      setWaitingListLoading(true);
      const res = await waitingListService.join({
        laboratory: id,
        type: 'lab',
        preferredDate: selectedDate,
        preferredStartTime: slot.start,
        preferredEndTime: slot.end,
      });

      if (res.success) {
        toast.success(`Joined waiting list at position #${res.data.position}! You'll be notified if a slot opens.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waiting list');
    } finally {
      setWaitingListLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading laboratory details..." />;
  if (!lab) return <div className="text-center p-12 text-gray-500">Laboratory not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              {lab.labNumber}
            </span>
            <Badge variant={lab.status}>{lab.status}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{lab.name}</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl leading-relaxed">{lab.description}</p>
        </div>

        <Link
          to={`/bookings/new/${lab._id}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition self-start md:self-auto shrink-0"
        >
          Book Reservation <FiArrowRight />
        </Link>
      </div>

      {/* Grid: Details & Real-Time Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Equipment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Lab Specifications</h2>
            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="flex items-center gap-2 text-gray-400"><FiUsers /> Seating Capacity</span>
                <span className="font-bold text-gray-900">{lab.capacity} Students</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="flex items-center gap-2 text-gray-400"><FiClock /> Operating Hours</span>
                <span className="font-bold text-gray-900">
                  {lab.operatingHours?.open || '08:30'} - {lab.operatingHours?.close || '17:30'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-gray-400"><FiUserCheck /> Faculty in Charge</span>
                <span className="font-bold text-gray-900">{lab.facultyInCharge?.name || 'Assigned Staff'}</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Available Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {lab.facilities?.map((f, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>

          {/* Equipment in Lab */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>Hardware & Test Kits</span>
              <span className="text-xs text-indigo-600 font-semibold">{lab.equipment?.length || 0} items</span>
            </h2>
            <div className="space-y-2">
              {lab.equipment?.map((item) => (
                <div key={item._id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.category}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.availableQuantity} available
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Schedule & Time Slots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Real-Time Slot Availability</h2>
                <p className="text-xs text-gray-500">Calculated live from active reservations & maintenance schedule.</p>
              </div>

              {/* Date Picker */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {slotLoading ? (
              <LoadingSpinner text="Checking live slot schedule..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availability?.slots?.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between ${
                      slot.isAvailable
                        ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                        : 'border-rose-200 bg-rose-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">
                          {slot.start} - {slot.end}
                        </span>
                        {slot.isAvailable ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <FiCheckCircle className="w-3 h-3" /> Available
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                            <FiXCircle className="w-3 h-3" /> Reserved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {slot.isAvailable
                          ? 'Available for reservation'
                          : `Booked: ${slot.booking?.purpose || 'Class session'}`}
                      </p>
                    </div>

                    {slot.isAvailable ? (
                      <Link
                        to={`/bookings/new/${lab._id}?date=${selectedDate}&start=${slot.start}&end=${slot.end}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        Book
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoinWaitingList(slot)}
                        disabled={waitingListLoading}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                      >
                        Join Queue
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetail;

