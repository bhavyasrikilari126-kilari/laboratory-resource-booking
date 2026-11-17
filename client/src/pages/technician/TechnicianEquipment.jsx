import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiCornerDownLeft, FiAlertTriangle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import equipmentService from '../../services/equipment.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TechnicianEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Modal
  const [returnItem, setReturnItem] = useState(null);
  const [returnCondition, setReturnCondition] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await equipmentService.getEquipment();
      if (res.success) setEquipmentList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleIssue = async (item) => {
    try {
      const res = await equipmentService.issueEquipment(item._id, {});
      if (res.success) {
        toast.success(`Hardware unit issued to student`);
        fetchEquipment();
      }
    } catch (err) {
      toast.error('Failed to issue equipment');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnItem) return;

    try {
      setReturning(true);
      const res = await equipmentService.returnEquipment(returnItem._id, {
        returnCondition,
        notes: returnNotes,
      });

      if (res.success) {
        toast.success('Equipment return verified and condition recorded!');
        setReturnItem(null);
        fetchEquipment();
      }
    } catch (err) {
      toast.error('Failed to record return');
    } finally {
      setReturning(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading equipment inventory..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiPackage className="text-indigo-600" /> Equipment Issue & Return Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Verify student hardware reservations, issue components, and inspect returned kits for damages.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">ID</th>
                <th className="p-3">Component Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Available / Total</th>
                <th className="p-3 text-right rounded-r-xl">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {equipmentList.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{item.equipmentId}</td>
                  <td className="p-3 font-bold text-gray-900">{item.name}</td>
                  <td className="p-3 text-gray-500">{item.category}</td>
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleIssue(item)}
                        disabled={item.availableQuantity <= 0}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-40"
                      >
                        Issue
                      </button>
                      <button
                        onClick={() => setReturnItem(item)}
                        className="px-3 py-1.5 border border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <FiCornerDownLeft /> Log Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      {returnItem && (
        <Modal
          isOpen={!!returnItem}
          onClose={() => setReturnItem(null)}
          title={`Log Return: ${returnItem.name}`}
        >
          <form onSubmit={handleReturn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Inspected Condition upon Return
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              >
                <option value="good">Good (No damage, fully functional)</option>
                <option value="fair">Fair (Minor cosmetic wear)</option>
                <option value="poor">Poor (Requires calibration)</option>
                <option value="damaged">Damaged (Burned or broken components)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Inspection Notes</label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="All pins straight; micro-USB cable included..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={returning}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {returning ? 'Recording...' : 'Verify Return & Restock Inventory'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TechnicianEquipment;

