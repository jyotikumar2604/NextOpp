import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Trash2 } from "lucide-react";
import Badge from "../common/Badge";
import CompanyLogo from "../common/CompanyLogo";
import Modal from "../common/Modal";
import { Button } from "../common/Button";
import { APPLICATION_STATUSES } from "../../data/constants";
import { deadlineLabel, formatDate } from "../../utils/dates";

const STATUS_TONE = { Applied: "blue", Interview: "purple", Offered: "green", Rejected: "red" };

// Plain-language guidance per stage. General advice, not a claim about any specific employer.
const NEXT_ACTION = {
  Applied: "Wait for a response. A polite follow-up after two weeks is reasonable.",
  Interview: "Prepare, and note the interview date and format below.",
  Offered: "Review the offer carefully and respond before any stated deadline.",
  Rejected: "Consider asking for feedback and saving similar opportunities.",
};

export default function ApplicationCard({ application: a, opportunity: o, onUpdate, onRemove }) {
  const [notes, setNotes] = useState(a.notes ?? "");
  const [confirming, setConfirming] = useState(false);
  const notesId = `notes-${a.id}`;

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CompanyLogo name={o.organization} color={o.color} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[17px] font-semibold text-stone-900"><Link to={`/opportunities/${o.id}`} className="hover:text-brand-700 hover:underline">{o.title}</Link></h3>
            <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-stone-500">{o.organization} · {o.type}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-stone-500">
            <span>Applied {formatDate(a.appliedAt)}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" aria-hidden /> Listing: {deadlineLabel(o.deadline).toLowerCase()}</span>
          </p>
        </div>
        <div className="sm:w-44">
          <label htmlFor={`status-${a.id}`} className="mb-1 block text-xs font-medium text-stone-500">Status</label>
          <select id={`status-${a.id}`} value={a.status} onChange={(e) => onUpdate(a.id, { status: e.target.value })} className="input h-9">
            {APPLICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600"><span className="font-medium text-stone-800">Next step: </span>{NEXT_ACTION[a.status]}</p>

      <div className="mt-4">
        <label htmlFor={notesId} className="mb-1 block text-xs font-medium text-stone-500">Notes (saved when you click away)</label>
        <textarea
          id={notesId}
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (a.notes ?? "") && onUpdate(a.id, { notes })}
          placeholder="Interview dates, contacts, things to prepare…"
          className="input"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} className="text-red-600 hover:bg-red-50 hover:text-red-700"><Trash2 /> Remove</Button>
      </div>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Remove from tracker?"
        description={`"${o.title}" will be removed from My Applications. This doesn't affect your actual application with ${o.organization}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirming(false); onRemove(a.id); }}>Remove</Button>
          </>
        }
      />
    </article>
  );
}
