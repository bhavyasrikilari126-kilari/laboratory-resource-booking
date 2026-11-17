import React, { useState, useEffect } from 'react';
import {
  FiPackage,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiCpu,
  FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import equipmentService from '../../services/equipment.service';
import issueService from '../../services/issue.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const EquipmentBrowser = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Reserve Modal State
  const [reserveItem, setReserveItem] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reserveNotes, setReserveNotes] = useState('');
  const [reserveLoading, setReserveLoading] = useState(false);

  // Issue/Report Modal State
  const [reportItem, setReportItem] = useState(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueType, setIssueType] = useState('damaged_equipment');
  const [reportLoading, setReportLoading] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;

      const res = await equipmentService.getEquipment(params);
      if (res.success) setEquipmentList(res.data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [category]);

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!reserveItem) return;

    try {
      setReserveLoading(true);
      const res = await equipmentService.reserveEquipment(reserveItem._id, {
        quantity: Number(reserveQty),
        notes: reserveNotes,
      });

      if (res.success) {
        toast.success(`Reserved ${reserveQty} unit(s) of ${reserveItem.name}! Pick up with lab technician.`);
        setReserveItem(null);
        fetchEquipment();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve equipment');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!reportItem) return;

    try {
      setReportLoading(true);
      const res = await issueService.report({
        title: issueTitle,
        description: issueDesc,
        type: issueType,
        equipment: reportItem._id,
        laboratory: reportItem.laboratory?._id,
      });

      if (res.success) {
        toast.success('Equipment problem reported. Maintenance notified!');
        setReportItem(null);
        setIssueTitle('');
        setIssueDesc('');
        fetchEquipment();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiPackage className="text-indigo-600" /> Centralized Equipment & Hardware Inventory
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Browse microcontrollers, robotics modules, oscilloscopes, and components. Reserve items for lab projects.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEquipment()}
            placeholder="Search by equipment name, ID, or component..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          <option value="Microcontroller">Microcontrollers</option>
          <option value="Single Board Computer">Single Board Computers</option>
          <option value="Motor Driver">Motor Drivers</option>
          <option value="Actuator">Actuators / Motors</option>
          <option value="Testing Equipment">Testing Equipment</option>
          <option value="Sensor">Sensors</option>
          <option value="AI Edge Device">AI Edge Devices</option>
        </select>

        <button
          onClick={fetchEquipment}
          className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          Search
        </button>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <LoadingSpinner text="Loading hardware catalog..." />
      ) : equipmentList.length === 0 ? (
        <EmptyState
          title="No hardware components found"
          description="Try clearing your category filter or search keywords."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((item) => {
            const isAvailable = item.availableQuantity > 0 && item.condition !== 'damaged';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                        {item.equipmentId}
                      </span>
                      <h3 className="text-base font-black text-gray-900 mt-1">{item.name}</h3>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    <Badge variant={item.condition}>{item.condition}</Badge>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {item.description || 'Standard academic hardware component.'}
                  </p>

                  <div className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1.5 border border-gray-100/60">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned Lab:</span>
                      <span className="font-bold text-gray-800">
                        {item.laboratory?.name || 'Department Central Pool'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Stock:</span>
                      <span className="font-bold text-gray-800">{item.totalQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Available:</span>
                      <span className={`font-black ${item.availableQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.availableQuantity} units ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setReserveItem(item);
                      setReserveQty(1);
                    }}
                    disabled={!isAvailable}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isAvailable ? 'Reserve Item' : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => {
                      setReportItem(item);
                      setIssueTitle(`Issue with ${item.name}`);
                    }}
                    title="Report damage or malfunction"
                    className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                  >
                    <FiAlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reserve Modal */}
      {reserveItem && (
        <Modal
          isOpen={!!reserveItem}
          onClose={() => setReserveItem(null)}
          title={`Reserve ${reserveItem.name}`}
        >
          <form onSubmit={handleReserve} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                max={reserveItem.availableQuantity}
                value={reserveQty}
                onChange={(e) => setReserveQty(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900"
              />
              <p className="text-[11px] text-gray-400 mt-1">Maximum available: {reserveItem.availableQuantity}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Project or Purpose Notes</label>
              <textarea
                rows={3}
                value={reserveNotes}
                onChange={(e) => setReserveNotes(e.target.value)}
                placeholder="Required for autonomous rover motor control mini-project..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={reserveLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {reserveLoading ? 'Reserving...' : 'Confirm Equipment Reservation'}
            </button>
          </form>
        </Modal>
      )}

      {/* Report Damage Modal */}
      {reportItem && (
        <Modal
          isOpen={!!reportItem}
          onClose={() => setReportItem(null)}
          title={`Report Damaged / Missing: ${reportItem.name}`}
        >
          <form onSubmit={handleReportIssue} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Issue Subject</label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Problem Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
              >
                <option value="damaged_equipment">Damaged Hardware Component</option>
                <option value="missing_component">Missing Wire or Accessory</option>
                <option value="electrical">Electrical Short / Burnt Component</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description of Fault</label>
              <textarea
                rows={3}
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder="Board does not power on when plugged into USB; voltage regulator overheating..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={reportLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {reportLoading ? 'Submitting...' : 'Submit Maintenance Report'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentBrowser;

