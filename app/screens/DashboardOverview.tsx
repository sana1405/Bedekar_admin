"use client";

import type { Product, Rates } from "./types";
import { idOf, labelOf, money } from "./types";

export default function DashboardOverview({ products, rates, onNavigate }: { products: Product[]; rates: Rates; onNavigate: (value: string) => void }) {
  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">THURSDAY, 7 AUGUST 2026</p>
          <h1>
            Good morning, Pranav <em>✦</em>
          </h1>
          <p className="muted">Here’s your store’s performance at a glance.</p>
        </div>
        <button className="gold" onClick={() => onNavigate("Products")}>＋ Add new product</button>
      </div>

      <div className="stats">
        <Metric icon="⌁" title="Today’s sales" value="₹1,84,250" detail="↗ 12.5% vs yesterday" />
        <Metric icon="▣" title="Orders received" value="24" detail="↗ 8.2% vs yesterday" />
        <Metric icon="♙" title="New customers" value="16" detail="↗ 4.6% vs yesterday" />
        <Metric icon="◷" title="Pending orders" value="08" detail="● Needs attention" />
      </div>

      <div className="dash-grid">
        <section className="card chart-card">
          <div className="card-title">
            <div>
              <h3>Revenue overview</h3>
              <p>Performance over the last 7 days</p>
            </div>
            <button>This week⌄</button>
          </div>
          <div className="chart">
            <div className="chart-line" />
            <div className="bubble">
              ₹1,84,250<small>Thu, 7 Aug</small>
            </div>
          </div>
          <div className="chart-days">
            <span>1 Aug</span>
            <span>2 Aug</span>
            <span>3 Aug</span>
            <span>4 Aug</span>
            <span>5 Aug</span>
            <span>6 Aug</span>
            <span>7 Aug</span>
          </div>
        </section>

        <section className="card metal-card">
          <div className="card-title">
            <div>
              <h3>Today’s metal rates</h3>
              <p>Live from your pricing desk</p>
            </div>
            <button className="link" onClick={() => onNavigate("Metal rates")}>Manage →</button>
          </div>
          <RateRows rates={rates} />
          <button className="bottom-link" onClick={() => onNavigate("Metal rates")}>View rate history <span>→</span></button>
        </section>
      </div>

      <section className="card inventory">
        <div className="card-title">
          <div>
            <h3>Recent catalogue additions</h3>
            <p>{products.length} products currently visible</p>
          </div>
          <button className="link" onClick={() => onNavigate("Products")}>Manage products →</button>
        </div>
        {products.slice(0, 4).map(product => <DashboardProductLine product={product} key={idOf(product)} />)}
      </section>
    </>
  );
}

function Metric({ icon, title, value, detail }: { icon: string; title: string; value: string; detail: string }) {
  return (
    <article className="metric">
      <i>{icon}</i>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function RateRows({ rates }: { rates: Rates }) {
  const gold = rates.gold24K ?? 0;

  return (
    <div className="rate-list">
      {[
        ["Gold", "24K · 99.9%", gold],
        ["Gold", "22K · 91.6%", gold * 22 / 24],
        ["Gold", "18K · 75.0%", gold * 0.75],
        ["Silver", "99.9%", rates.silverPerGram ?? 0],
      ].map(([metal, purity, rate]) => (
        <div className="rate" key={String(purity)}>
          <i className={metal === "Silver" ? "silver" : ""}>✦</i>
          <span>
            <b>{metal}</b>
            <small>{purity}</small>
          </span>
          <strong>{money(Number(rate))}<small>/g</small></strong>
        </div>
      ))}
    </div>
  );
}

function DashboardProductLine({ product }: { product: Product }) {
  return (
    <div className="product-name">
      <div className="thumbnail">
        {product.displayImage ? <img src={product.displayImage} alt="" /> : <span>✦</span>}
      </div>
      <span>
        <b>{product.name}</b>
        <small>{labelOf(product.category)} · {labelOf(product.subCategory)}</small>
      </span>
    </div>
  );
}
