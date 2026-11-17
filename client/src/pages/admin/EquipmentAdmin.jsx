import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiGrid, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import equipmentService from '../../services/equipment.service';
import departmentService from '../../services/department.service';
import labService from '../../services/lab.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { QRCodeSVG } from 'qrcode.react';

const EquipmentAdmin = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [category, setCategory] = useState('Microcontroller');
  const [deptId, setDeptId] = useState('');
  const [labId, setLabId] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(10);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // QR Modal
  const [qrItem, setQrItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eqRes, deptsRes, labsRes] = await Promise.all([
        equipmentService.getEquipment(),
        departmentService.getDepartments(),
        labService.getLabs(),
      ]);

      if (eqRes.success) setEquipmentList(eqRes.data || []);
      if (deptsRes.success) setDepartments(deptsRes.data || []);
      if (labsRes.success) setLabs(labsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await equipmentService.createEquipment({
        name,
        equipmentId,
        category,
        department: deptId || undefined,
        laboratory: labId || undefined,
        totalQuantity: Number(totalQuantity),
        availableQuantity: Number(totalQuantity),
        description,
      });

      if (res.success) {
        toast.success('Equipment registered with QR tracking code!');
        setShowAddModal(false);
        setName('');
        setEquipmentId('');
        setDescription('');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create equipment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading hardware catalog..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiPackage className="text-indigo-600" /> Equipment & Hardware Inventory Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Register hardware components, track quantities, and generate unique QR barcodes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> Register Hardware Item
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Barcode ID</th>
                <th className="p-3">Component</th>
                <th className="p-3">Category</th>
                <th className="p-3">Assigned Lab</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Available / Total</th>
                <th className="p-3 text-right rounded-r-xl">QR Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {equipmentList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{item.equipmentId}</td>
                  <td className="p-3 font-bold text-gray-900">{item.name}</td>
                  <td className="p-3 text-gray-500">{item.category}</td>
                  <td className="p-3 text-gray-600">{item.laboratory?.name || 'Central'}</td>
                  <td className="p-3">
                    <Badge variant={item.condition}>{item.condition}</Badge>
                  </td>
                  <td className="p-3 font-bold">
                    <span className={item.availableQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.availableQuantity}
                    </span>
                    <span className="text-gray-400"> / {item.totalQuantity}</span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setQrItem(item)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition inline-flex items-center gap-1 font-bold text-[11px]"
                    >
                      <FiGrid className="w-4 h-4 text-indigo-600" /> Print QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Register Hardware Inventory Item"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Equipment Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ESP32 Wi-Fi & Bluetooth Dual-Core Board"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Equipment ID / Barcode</label>
                <input
                  type="text"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  placeholder="EQ-ESP32-02"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
                >
                  <option value="Microcontroller">Microcontroller</option>
                  <option value="Single Board Computer">Single Board Computer</option>
                  <option value="Motor Driver">Motor Driver</option>
                  <option value="Actuator">Actuator / Motor</option>
                  <option value="Testing Equipment">Testing Equipment</option>
                  <option value="Sensor">Sensor</option>
                  <option value="AI Edge Device">AI Edge Device</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Assigned Laboratory</label>
                <select
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
                >
                  <option value="">Central Department Pool</option>
                  {labs.map((l) => (
                    <option key={l._id} value={l._id}>{l.name} ({l.labNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Total Quantity Stock</label>
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Add Hardware to Catalog'}
            </button>
          </form>
        </Modal>
      )}

      {/* QR Label Modal */}
      {qrItem && (
        <Modal
          isOpen={!!qrItem}
          onClose={() => setQrItem(null)}
          title={`Equipment Barcode Label: ${qrItem.name}`}
        >
          <div className="text-center space-y-4 py-2">
            <div className="p-4 bg-slate-900 rounded-2xl inline-block shadow-lg mx-auto">
              <QRCodeSVG
                value={JSON.stringify({
                  equipmentId: qrItem.equipmentId,
                  name: qrItem.name,
                  category: qrItem.category,
                })}
                size={160}
                bgColor="#0f172a"
                fgColor="#ffffff"
                level="M"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                {qrItem.equipmentId}
              </span>
              <h4 className="text-base font-black text-gray-900">{qrItem.name}</h4>
              <p className="text-xs text-gray-500">Category: {qrItem.category}</p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition"
            >
              Print Barcode Label
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentAdmin;

