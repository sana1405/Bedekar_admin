"use client";

import type { ReactNode } from "react";
import type { Rates } from "./types";
import { money } from "./types";

const GOLD_PURITY_FACTORS = [
  ["24K", 1],
  ["22K", 22 / 24],
  ["20K", 20 / 24],
  ["18K", 18 / 24],
  ["14K", 14 / 24],
] as const;

const formatRateDate = (value?: string | Date) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function RatesPage({ rates, history, onUpdate }: { rates: Rates; history: Rates[]; onUpdate: () => void }) {
  const gold = rates.gold24K ?? 0;

  return (
    <PageTop title="Metal rates" text="Set your daily base rates; purity prices are calculated automatically." action="Edit today’s rates" onAction={onUpdate}>
      <div className="rate-hero">
        <article>
          <span>24K GOLD</span>
          <h2>{money(gold)}<small>/g</small></h2>
          <p>Base price used for all gold purities</p>
        </article>
        <article>
          <span>FINE SILVER</span>
          <h2>{money(rates.silverPerGram)}<small>/g</small></h2>
          <p>Base price for 99.9% silver</p>
        </article>
      </div>

      <section className="card purity-card">
        <div className="card-title">
          <div>
            <h3>Derived gold purity prices</h3>
            <p>Calculated from the 24K base rate</p>
          </div>
        </div>
        <div className="purities">
          {GOLD_PURITY_FACTORS.map(([name, factor]) => (
            <div key={String(name)}>
              <span>{name}</span>
              <b>{money(gold * Number(factor))}</b>
              <small>per gram</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card history-card">
        <div className="card-title">
          <div>
            <h3>Recent rate history</h3>
            <p>Every published update is stored by the backend.</p>
          </div>
        </div>
        {history.length ? (
          <div className="rate-history-table-wrap">
            <div className="rate-history-header">
              <span className="rate-history-cell rate-history-label">Date</span>
              <span className="rate-history-cell rate-history-label">24K</span>
              <span className="rate-history-cell rate-history-label">22K</span>
              <span className="rate-history-cell rate-history-label">20K</span>
              <span className="rate-history-cell rate-history-label">18K</span>
              <span className="rate-history-cell rate-history-label">14K</span>
              <span className="rate-history-cell rate-history-label">Silver</span>
            </div>
            {history.slice(0, 8).map((item, index) => (
              <div key={`${formatRateDate(item.date ?? item.createdAt)}-${index}`} className="rate-history-row">
                <span className="rate-history-cell rate-history-date">{formatRateDate(item.date ?? item.createdAt)}</span>
                {GOLD_PURITY_FACTORS.map(([name, factor]) => (
                  <b key={name} className="rate-history-cell rate-history-value">{money((item.gold24K ?? 0) * Number(factor))}</b>
                ))}
                <b className="rate-history-cell rate-history-value">{money(item.silverPerGram)}</b>
              </div>
            ))}
          </div>
        ) : (
          <Empty label="No historical rate records yet." />
        )}
      </section>
    </PageTop>
  );
}

function PageTop({ title, text, action, onAction, children }: { title: string; text: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <>
      <div className="welcome page-title">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>{title}</h1>
          <p className="muted">{text}</p>
        </div>
        {action && <button className="gold" onClick={onAction}>{action}</button>}
      </div>
      {children}
    </>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="empty">
      ◇
      <p>{label}</p>
    </div>
  );
}
