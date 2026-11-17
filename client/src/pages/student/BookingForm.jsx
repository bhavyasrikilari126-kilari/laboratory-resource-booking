import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiPackage,
  FiFileText,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import labService from '../../services/lab.service';
import bookingService from '../../services/booking.service';
import equipmentService from '../../services/equipment.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookingForm = () => {
  const { labId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [date, setDate] = useState(() => searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(() => searchParams.get('start') || '10:00');
  const [endTime, setEndTime] = useState(() => searchParams.get('end') || '12:00');
  const [type, setType] = useState('individual');
  const [purpose, setPurpose] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const [labRes, eqRes] = await Promise.all([
          labService.getLab(labId),
          equipmentService.getEquipment({ laboratory: labId }),
        ]);

        if (labRes.success) setLab(labRes.data);
        if (eqRes.success) setAvailableEquipment(eqRes.data || []);
      } catch (err) {
        console.error('Failed to load lab booking form data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (labId) fetchFormData();
  }, [labId]);

  const toggleEquipment = (eqId) => {
    setSelectedEquipment((prev) =>
      prev.includes(eqId) ? prev.filter((id) => id !== eqId) : [...prev, eqId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      toast.error('Please specify the purpose of your laboratory usage');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bookingService.createBooking({
        laboratory: labId,
        date,
        startTime,
        endTime,
        type,
        purpose,
        requiredEquipment: selectedEquipment,
      });

      if (res.success) {
        toast.success(
          res.data.status === 'approved'
            ? 'Booking auto-approved! Digital Pass generated.'
            : 'Booking submitted successfully! Pending faculty review.'
        );
        navigate('/bookings');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to submit reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Preparing reservation form..." />;
  if (!lab) return <div className="text-center p-12 text-gray-500">Laboratory not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiCalendar className="text-indigo-600" /> Reserve Laboratory Session
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Submitting reservation for <strong>{lab.name}</strong> ({lab.labNumber}).
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Session Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Booking Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Reservation Type
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <label
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition text-xs font-bold ${
                  type === 'individual'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="individual"
                  checked={type === 'individual'}
                  onChange={() => setType('individual')}
                  className="hidden"
                />
                Single Student
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition text-xs font-bold ${
                  type === 'group'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="group"
                  checked={type === 'group'}
                  onChange={() => setType('group')}
                  className="hidden"
                />
                Project Team / Group
              </label>
            </div>
          </div>

          {/* Purpose of Lab Usage */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Purpose of Usage & Experiment Scope
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. IoT Motor Speed Controller circuit prototyping and oscilloscope validation for mini-project..."
              required
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Request Hardware / Test Equipment (Optional)
            </label>
            {availableEquipment.length === 0 ? (
              <p className="text-xs text-gray-400">No equipment currently assigned directly to this laboratory.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableEquipment.map((eq) => {
                  const isChecked = selectedEquipment.includes(eq._id);
                  return (
                    <div
                      key={eq._id}
                      onClick={() => toggleEquipment(eq._id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900'
                          : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{eq.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {eq.category} • {eq.availableQuantity} in stock
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                        }`}
                      >
                        {isChecked && <FiCheckCircle className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Policy Reminder */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
            <FiShield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Laboratory Compliance Policy</p>
              <p className="mt-0.5 text-amber-700 leading-relaxed">
                Bookings are verified by faculty coordinators. Once approved, present your digital QR pass at the entrance to the lab technician.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting Reservation...' : 'Confirm Reservation'} <FiArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

