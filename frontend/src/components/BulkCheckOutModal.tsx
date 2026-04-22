import { useState, useMemo } from 'react';
import { LogOut, Search, X } from 'lucide-react';
import { colors, spacing, radius } from '../theme';
import type { Person } from '../types/people';

interface Props {
  isOpen: boolean;
  count: number;
  users: Person[];
  onConfirm: (userId: string, notes: string) => void;
  onClose: () => void;
}

export default function BulkCheckOutModal({ isOpen, count, users, onConfirm, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedUserId) return;
    onConfirm(selectedUserId, notes);
    reset();
  };

  const handleClose = () => { reset(); onClose(); };

  const reset = () => {
    setSearch('');
    setSelectedUserId('');
    setNotes('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: '1px solid rgba(70,98,145,0.2)',
    backgroundColor: colors.bgSurface,
    fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem',
    color: colors.textPrimary, outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Archivo', sans-serif",
    fontSize: '0.75rem', fontWeight: 600, color: colors.blueGrayMd,
    marginBottom: spacing.xs,
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(3,12,35,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          border: '1px solid rgba(70,98,145,0.15)',
          boxShadow: '0 8px 40px rgba(3,12,35,0.18)',
          width: '100%', maxWidth: '30rem',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.xl}`,
            borderBottom: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <LogOut size={16} color={colors.orangeAccent} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary }}>
              Check Out {count} Asset{count !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '1.625rem', height: '1.625rem', borderRadius: radius.sm, border: 'none',
              backgroundColor: 'transparent', color: colors.blueGrayMd,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {/* User picker */}
          <div>
            <label style={labelStyle}>
              Assign To <span style={{ color: colors.error }}>*</span>
            </label>

            {selectedUser ? (
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: radius.md,
                  backgroundColor: 'rgba(46,124,253,0.06)',
                  border: '1px solid rgba(46,124,253,0.2)',
                }}
              >
                <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: colors.textPrimary }}>
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>
                <button
                  onClick={() => setSelectedUserId('')}
                  style={{
                    width: '1.25rem', height: '1.25rem', borderRadius: radius.sm, border: 'none',
                    backgroundColor: 'transparent', color: colors.blueGrayMd,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={13}
                    style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: colors.blueGrayMd, pointerEvents: 'none' }}
                  />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    style={{ ...inputStyle, paddingLeft: '2rem' }}
                  />
                </div>
                <div
                  style={{
                    maxHeight: '9rem', overflowY: 'auto',
                    borderRadius: radius.md,
                    border: '1px solid rgba(70,98,145,0.15)',
                    marginTop: spacing.xs,
                  }}
                >
                  {filteredUsers.length === 0 ? (
                    <div style={{ padding: spacing.md, fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', color: colors.blueGrayMd, textAlign: 'center' }}>
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        style={{
                          width: '100%', textAlign: 'left',
                          padding: `${spacing.sm} ${spacing.md}`,
                          border: 'none', backgroundColor: 'transparent',
                          fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem',
                          color: colors.textPrimary, cursor: 'pointer',
                          borderBottom: '1px solid rgba(70,98,145,0.07)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {u.first_name} {u.last_name}
                        <span style={{ marginLeft: spacing.sm, fontSize: '0.75rem', color: colors.blueGrayMd }}>
                          {u.email}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Purpose, project, etc."
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
            padding: `${spacing.md} ${spacing.xl}`,
            borderTop: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md,
              border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent',
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: colors.blueGrayMd, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedUserId}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md, border: 'none',
              backgroundColor: selectedUserId ? colors.orangeAccent : 'rgba(70,98,145,0.15)',
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: selectedUserId ? colors.white : colors.blueGrayMd,
              cursor: selectedUserId ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            Check Out {count}
          </button>
        </div>
      </div>
    </div>
  );
}
