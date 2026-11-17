import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiClock, FiCalendar, FiMapPin, FiShield, FiGrid } from 'react-icons/fi';
import labPassService from '../../services/labPass.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { QRCodeSVG } from 'qrcode.react';

const MyPasses = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true);
        const res = await labPassService.getMyPasses();
        if (res.success) setPasses(res.data || []);
      } catch (err) {
        console.error('Error fetching passes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPasses();
  }, []);

  if (loading) return <LoadingSpinner text="Loading digital lab passes..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiCheckSquare className="text-indigo-600" /> Digital Laboratory Passes
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Server-verified QR codes for authorized campus laboratory entry and exit logging.
        </p>
      </div>

      {passes.length === 0 ? (
        <EmptyState
          title="No Digital Passes Generated"
          description="Once your laboratory booking is approved by faculty, a digital QR entry pass will appear here automatically."
          actionText="Browse Laboratories"
          onAction={() => (window.location.href = '/labs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map((pass) => (
            <div
              key={pass._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col items-center text-center space-y-4"
            >
              <div className="p-3 bg-slate-900 rounded-2xl shadow-md">
                <QRCodeSVG
                  value={JSON.stringify({
                    passCode: pass.passCode,
                    lab: pass.laboratory?.labNumber,
                    validFrom: pass.validFrom,
                    validUntil: pass.validUntil,
                  })}
                  size={150}
                  bgColor="#0f172a"
                  fgColor="#ffffff"
                  level="M"
                />
              </div>

              <div className="space-y-1 w-full">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                  Pass: {pass.passCode}
                </span>
                <h3 className="text-base font-black text-gray-900">{pass.laboratory?.name}</h3>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <FiMapPin className="text-gray-400" /> Room {pass.laboratory?.labNumber}
                </p>
              </div>

              <div className="w-full pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5 text-left bg-gray-50/70 p-3 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valid From:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(pass.validFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valid Until:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(pass.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Check-In:</span>
                  <span className="font-bold text-emerald-700">
                    {pass.entryTime ? new Date(pass.entryTime).toLocaleTimeString() : 'Not Yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Exit Check-Out:</span>
                  <span className="font-bold text-indigo-700">
                    {pass.exitTime ? new Date(pass.exitTime).toLocaleTimeString() : 'Not Yet'}
                  </span>
                </div>
              </div>

              <div className="w-full">
                <Badge variant={pass.exitTime ? 'completed' : pass.isUsed ? 'checked_in' : 'available'} className="w-full justify-center py-1">
                  {pass.exitTime ? 'Completed Session' : pass.isUsed ? 'Checked In' : 'Valid Entry Pass'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPasses;

