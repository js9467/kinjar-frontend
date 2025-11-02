'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
  highlight?: string;
}

export function StatCard({ label, value, trend, icon, highlight }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {trend ? <p className="mt-2 text-xs font-medium text-emerald-600">{trend}</p> : null}
          {highlight ? <p className="mt-2 text-sm text-slate-500">{highlight}</p> : null}
        </div>
        {icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
