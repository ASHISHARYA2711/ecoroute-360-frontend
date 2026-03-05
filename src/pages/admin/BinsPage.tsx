import { useEffect, useState } from 'react';
import { BinService } from '../../api/bin.service';
import type { Bin } from '../../api/bin.service';
import { useSocket } from '../../hooks/useSocket';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────
interface BinFormState {
  binId: string;
  lat: string;
  lng: string;
}

const emptyForm: BinFormState = { binId: '', lat: '', lng: '' };

// ─────────────────────────────────────
// BinsPage Component
// ─────────────────────────────────────
const BinsPage = () => {
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [form, setForm] = useState<BinFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const socket = useSocket();

  // ── Load bins ──────────────────────
  const loadBins = async () => {
    try {
      const data = await BinService.getAllBins();
      setBins(data);
    } catch {
      setError('Failed to load bins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBins(); }, []);

  // ── Real-time socket updates ───────
  useEffect(() => {
    if (!socket) return;
    socket.on('binUpdated', (updatedBin: Bin) => {
      setBins(prev => {
        const idx = prev.findIndex(b => b.binId === updatedBin.binId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = updatedBin;
          return next;
        }
        return [...prev, updatedBin];
      });
    });
    return () => { socket.off('binUpdated'); };
  }, [socket]);

  // ─────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setFormError(null);
    setShowAddModal(true);
  };

  const openEdit = (bin: Bin) => {
    setSelectedBin(bin);
    setForm({ binId: bin.binId, lat: String(bin.location.lat), lng: String(bin.location.lng) });
    setFormError(null);
    setShowEditModal(true);
  };

  const openDelete = (bin: Bin) => {
    setSelectedBin(bin);
    setShowDeleteConfirm(true);
  };

  const closeAll = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setSelectedBin(null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!form.binId.trim()) { setFormError('Bin ID is required'); return false; }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || lat < -90 || lat > 90) { setFormError('Latitude must be between -90 and 90'); return false; }
    if (isNaN(lng) || lng < -180 || lng > 180) { setFormError('Longitude must be between -180 and 180'); return false; }
    return true;
  };

  // Create
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await BinService.createBin({
        binId: form.binId.trim(),
        location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      });
      await loadBins();
      closeAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create bin. The Bin ID may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!validateForm() || !selectedBin) return;
    setSubmitting(true);
    try {
      await BinService.updateBin(selectedBin.binId, {
        location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      });
      await loadBins();
      closeAll();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to update bin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selectedBin) return;
    setSubmitting(true);
    try {
      await BinService.deleteBin(selectedBin.binId);
      setBins(prev => prev.filter(b => b.binId !== selectedBin.binId));
      closeAll();
    } catch {
      setFormError('Failed to delete bin.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────
  // Render
  // ─────────────────────────────────────
  if (loading) return <div style={styles.center}>Loading bins...</div>;
  if (error) return <div style={{ ...styles.center, color: '#dc2626' }}>{error}</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Bins Management</h1>
          <p style={styles.subtitle}>
            {bins.length} bin{bins.length !== 1 ? 's' : ''} total &nbsp;·&nbsp;
            Real-time: {socket ? '✅ Connected' : '❌ Disconnected'}
          </p>
        </div>
        <button style={styles.addBtn} onClick={openAdd}>+ Add Bin</button>
      </div>

      {/* ── Table ── */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              {['Bin ID', 'Latitude', 'Longitude', 'Fill Level', 'Gas Level', 'Waste Type', 'Status', 'Last Updated', 'Actions']
                .map(h => <th key={h} style={styles.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {bins.length === 0 ? (
              <tr><td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No bins found. Click "+ Add Bin" to register one.</td></tr>
            ) : bins.map(bin => (
              <tr key={bin.binId} style={styles.row}>
                <td style={styles.td}><strong>{bin.binId}</strong></td>
                <td style={styles.td}>{bin.location.lat.toFixed(4)}</td>
                <td style={styles.td}>{bin.location.lng.toFixed(4)}</td>
                <td style={styles.td}>
                  <div style={styles.fillBar}>
                    <div style={{ ...styles.fillFill, width: `${bin.currentFill}%`, background: bin.currentFill >= 80 ? '#dc2626' : bin.currentFill >= 50 ? '#f59e0b' : '#16a34a' }} />
                  </div>
                  <span style={{ fontSize: 12 }}>{bin.currentFill}%</span>
                </td>
                <td style={styles.td}>{bin.gasLevel} PPM</td>
                <td style={styles.td}>
                  {bin.lastWasteType
                    ? <>{bin.lastWasteType} {bin.wasteConfidence && <span style={{ color: '#94a3b8', fontSize: 12 }}>({Math.round(bin.wasteConfidence * 100)}%)</span>}</>
                    : <span style={{ color: '#94a3b8' }}>—</span>}
                </td>
                <td style={styles.td}>
                  <StatusBadge status={bin.status} />
                </td>
                <td style={styles.td}>{new Date(bin.updatedAt).toLocaleString()}</td>
                <td style={styles.td}>
                  <div style={styles.actions}>
                    <button style={styles.editBtn} onClick={() => openEdit(bin)} title="Edit bin">✏️</button>
                    <button style={styles.deleteBtn} onClick={() => openDelete(bin)} title="Delete bin">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <Modal title="➕ Add New Bin" onClose={closeAll}>
          <BinForm
            form={form}
            setForm={setForm}
            error={formError}
            binIdEditable={true}
          />
          <ModalFooter
            onCancel={closeAll}
            onConfirm={handleCreate}
            confirmLabel="Create Bin"
            submitting={submitting}
            confirmStyle={styles.addBtn}
          />
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedBin && (
        <Modal title={`✏️ Edit Bin: ${selectedBin.binId}`} onClose={closeAll}>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
            Update location coordinates for this bin. Bin ID cannot be changed.
          </p>
          <BinForm
            form={form}
            setForm={setForm}
            error={formError}
            binIdEditable={false}
          />
          <ModalFooter
            onCancel={closeAll}
            onConfirm={handleUpdate}
            confirmLabel="Save Changes"
            submitting={submitting}
            confirmStyle={styles.editConfirmBtn}
          />
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {showDeleteConfirm && selectedBin && (
        <Modal title="🗑️ Confirm Delete" onClose={closeAll}>
          <p style={{ marginBottom: 8 }}>
            Are you sure you want to delete bin <strong>{selectedBin.binId}</strong>?
          </p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            This is a soft delete. The bin's history will be preserved in the database.
          </p>
          {formError && <p style={styles.formError}>{formError}</p>}
          <ModalFooter
            onCancel={closeAll}
            onConfirm={handleDelete}
            confirmLabel="Yes, Delete"
            submitting={submitting}
            confirmStyle={styles.deleteConfirmBtn}
          />
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────
// Sub-components
// ─────────────────────────────────────

const StatusBadge = ({ status }: { status: Bin['status'] }) => {
  const color = status === 'CRITICAL' ? { bg: '#fee2e2', text: '#dc2626' }
    : status === 'EMPTY' ? { bg: '#f1f5f9', text: '#64748b' }
    : { bg: '#dcfce7', text: '#16a34a' };
  return (
    <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, background: color.bg, color: color.text }}>
      {status}
    </span>
  );
};

interface BinFormProps {
  form: BinFormState;
  setForm: (f: BinFormState) => void;
  error: string | null;
  binIdEditable: boolean;
}
const BinForm = ({ form, setForm, error, binIdEditable }: BinFormProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <label style={styles.label}>
      Bin ID
      <input
        style={{ ...styles.input, background: binIdEditable ? '#fff' : '#f1f5f9', color: binIdEditable ? '#0f172a' : '#64748b' }}
        value={form.binId}
        onChange={e => setForm({ ...form, binId: e.target.value })}
        placeholder="e.g. BIN_IOT_001"
        disabled={!binIdEditable}
      />
    </label>
    <label style={styles.label}>
      Latitude
      <input
        style={styles.input}
        value={form.lat}
        onChange={e => setForm({ ...form, lat: e.target.value })}
        placeholder="e.g. 12.8231"
        type="number"
        step="any"
      />
    </label>
    <label style={styles.label}>
      Longitude
      <input
        style={styles.input}
        value={form.lng}
        onChange={e => setForm({ ...form, lng: e.target.value })}
        placeholder="e.g. 80.0445"
        type="number"
        step="any"
      />
    </label>
    {error && <p style={styles.formError}>{error}</p>}
  </div>
);

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div style={{ padding: '20px 24px 4px' }}>{children}</div>
    </div>
  </div>
);

const ModalFooter = ({ onCancel, onConfirm, confirmLabel, submitting, confirmStyle }: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  submitting: boolean;
  confirmStyle: React.CSSProperties;
}) => (
  <div style={styles.modalFooter}>
    <button style={styles.cancelBtn} onClick={onCancel} disabled={submitting}>Cancel</button>
    <button style={{ ...confirmStyle, opacity: submitting ? 0.6 : 1 }} onClick={onConfirm} disabled={submitting}>
      {submitting ? 'Please wait...' : confirmLabel}
    </button>
  </div>
);

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  center: { padding: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  title: { margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' },
  subtitle: { margin: '4px 0 0', color: '#64748b', fontSize: 14 },
  addBtn: { padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  tableWrap: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 13, color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderTop: '1px solid #e5e7eb', fontSize: 14, verticalAlign: 'middle' },
  row: { transition: 'background 0.15s' },
  fillBar: { background: '#e5e7eb', borderRadius: 4, height: 6, width: 80, marginBottom: 4 },
  fillFill: { height: 6, borderRadius: 4, transition: 'width 0.3s' },
  actions: { display: 'flex', gap: 8 },
  editBtn: { background: '#dbeafe', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  deleteBtn: { background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b', lineHeight: 1 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px 20px' },
  cancelBtn: { padding: '9px 16px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer' },
  editConfirmBtn: { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  deleteConfirmBtn: { padding: '9px 18px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' },
  label: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 14, fontWeight: 500, color: '#334155' },
  input: { padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.2s' },
  formError: { color: '#dc2626', fontSize: 13, margin: '4px 0 0', background: '#fee2e2', padding: '8px 12px', borderRadius: 6 },
};

export default BinsPage;
