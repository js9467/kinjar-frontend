'use client';

import { useMemo, useState } from 'react';

import { useAppState } from '@/lib/app-state';
import { PendingFamilySignup } from '@/lib/types';

const FILTERS: Array<{ label: string; value: PendingFamilySignup['status'] | 'all' }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

export default function AdminSignupsPage() {
  const { pendingFamilySignups, approveFamilySignup, rejectFamilySignup } = useAppState();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('pending');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<PendingFamilySignup | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return pendingFamilySignups;
    }

    return pendingFamilySignups.filter((signup) => signup.status === filter);
  }, [filter, pendingFamilySignups]);

  const handleApprove = (signup: PendingFamilySignup) => {
    approveFamilySignup(signup.id);
    setSelected(null);
    setNotes('');
  };

  const handleReject = (signup: PendingFamilySignup) => {
    rejectFamilySignup(signup.id);
    setSelected(null);
    setNotes('');
  };

  return (
    <div className="space-y-8 pb-16">
      <header className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Family signup requests</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Vet new family spaces before they join Kinjar. Review each request&apos;s context, reach out to admins, and approve or
          reject with a note for your records.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex gap-2">
            {FILTERS.map(({ label, value }) => {
              const isActive = value === filter;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {filtered.length} request{filtered.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No signup requests in this view.
            </div>
          ) : (
            filtered.map((signup) => (
              <article
                key={signup.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requested family</p>
                    <h2 className="text-xl font-semibold text-slate-900">{signup.familyName}</h2>
                    <p className="mt-1 text-sm text-slate-600">Primary admin: {signup.adminName}</p>
                    <p className="mt-1 text-xs text-slate-500">{signup.adminEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    <span
                      className={`rounded-full px-3 py-1 ${
                        signup.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : signup.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {signup.status}
                    </span>
                  </div>
                </div>
                {signup.message ? (
                  <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">“{signup.message}”</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Requested on {new Date(signup.createdAt).toLocaleString()}</span>
                </div>
                {signup.status === 'pending' ? (
                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => handleApprove(signup)}
                      className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      Approve and create family
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelected(signup)}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-600 transition hover:border-rose-300 hover:text-rose-700"
                    >
                      Reject with note
                    </button>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Reject {selected.familyName}?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Add a note so other admins know why this request was declined. The requester won&apos;t see this note.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Reason for rejection"
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setNotes('');
                }}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(selected)}
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                Reject request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
